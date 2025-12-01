import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

/**
 * Setup Axios Interceptor với Token Rotation
 */
export const setupAxiosInterceptor = (onLogout: () => void) => {
  // Request interceptor - Thêm access token vào header
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - Handle 401 và auto refresh
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Bỏ qua các request login/register - những request này có thể trả về 401 hợp lệ
      const isAuthRequest = originalRequest.url?.includes('/auth/login') || 
                           originalRequest.url?.includes('/auth/register');
      
      if (isAuthRequest) {
        // Đối với login/register, trả về lỗi trực tiếp không xử lý refresh token
        return Promise.reject(error);
      }

      // Nếu lỗi 401 và chưa retry
      if (error.response?.status === 401 && !originalRequest._retry) {
        
        // Nếu đang refresh, đợi trong queue
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = 'Bearer ' + token;
              }
              return axios(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          // Không có refresh token → logout
          console.warn('⚠️ No refresh token - logging out');
          isRefreshing = false;
          
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          localStorage.removeItem('user');
          
          onLogout();
          // Không redirect nếu đang ở trang login/register
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        try {
          console.log('🔄 Refreshing access token (401 error)...');
          
          // Gọi API refresh
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          // Token Rotation: Lưu cả 2 tokens mới
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Update header cho request hiện tại
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = 'Bearer ' + accessToken;
          }
          
          // Update header mặc định
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;

          // Process queue
          processQueue(null, accessToken);

          console.log('✅ Token refreshed successfully (after 401)');

          // Retry request ban đầu
          return axios(originalRequest);

        } catch (refreshError) {
          // Refresh failed → logout
          console.error('❌ Token refresh failed:', refreshError);
          
          processQueue(refreshError, null);
          
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          sessionStorage.removeItem('token');
          localStorage.removeItem('user');
          
          onLogout();
          
          alert('Your session has expired. Please login again.');
          window.location.href = '/login';
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};
