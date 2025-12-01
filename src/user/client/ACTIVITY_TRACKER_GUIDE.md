# Hướng dẫn tích hợp Activity Tracker và Axios Interceptor vào App.tsx

## Thêm vào App.tsx:

```typescript
import { setupActivityTracker } from './utils/activityTracker';
import { setupAxiosInterceptor } from './utils/axiosInterceptor';

function App() {
  // ... existing state ...

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentPage('home');
  };

  // Setup axios interceptor khi app mount
  useEffect(() => {
    setupAxiosInterceptor(handleLogout);
  }, []);

  // Setup activity tracker khi user authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🎯 User authenticated - starting activity tracker');
      
      // Setup activity tracker với 15 phút idle timeout
      const cleanup = setupActivityTracker(handleLogout);
      
      // Cleanup khi unmount hoặc logout
      return cleanup;
    }
  }, [isAuthenticated]);

  // ... rest of your code ...
}
```

## Update Login để lưu refreshToken:

```typescript
const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    if (response.data.success) {
      const { accessToken, refreshToken, user } = response.data.data;

      // Lưu tokens
      if (rememberMe) {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken); // Refresh token luôn lưu localStorage
        localStorage.setItem('user', JSON.stringify(user));
      }

      setIsAuthenticated(true);
      setUser(user);
    }
  } catch (error) {
    // ... error handling
  }
};
```

## Update Logout để xóa refresh token khỏi DB:

```typescript
const handleLogout = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    // Gọi API logout để xóa refresh token khỏi database
    if (refreshToken) {
      await axios.post(`${API_URL}/auth/logout`, { refreshToken });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Xóa tokens
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('home');
  }
};
```

## Update Google OAuth Callback:

```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get('accessToken');
  const refreshToken = params.get('refreshToken');
  const userParam = params.get('user');
  
  if (accessToken && refreshToken && userParam) {
    try {
      const user = JSON.parse(decodeURIComponent(userParam));
      
      localStorage.setItem('token', decodeURIComponent(accessToken));
      localStorage.setItem('refreshToken', decodeURIComponent(refreshToken));
      localStorage.setItem('user', JSON.stringify(user));
      
      setIsAuthenticated(true);
      setUser(user);
      
      // Clear URL params
      window.history.replaceState({}, document.title, '/');
    } catch (error) {
      console.error('Error parsing OAuth data:', error);
    }
  }
}, []);
```

## Features:

1. ✅ **Auto refresh token** mỗi 14 phút (nếu user đang hoạt động)
2. ✅ **Idle timeout 15 phút** - logout nếu không hoạt động
3. ✅ **Activity tracking** - click, scroll, keypress reset timer
4. ✅ **Token rotation** - mỗi lần refresh tạo tokens mới
5. ✅ **401 handling** - tự động refresh khi token hết hạn
6. ✅ **Logout from DB** - xóa refresh token khỏi database
