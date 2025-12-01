import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 phút không hoạt động → logout
const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 phút → refresh token (trước khi access token 15 phút hết hạn)

let activityTimer: NodeJS.Timeout | null = null;
let refreshTimer: NodeJS.Timeout | null = null;
let lastActivityTime = Date.now();

/**
 * Refresh access token
 */
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token');
    }
    
    console.log('🔄 Refreshing access token...');
    
    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken
    });
    
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    
    // Token Rotation: Lưu cả 2 tokens mới
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    
    console.log('✅ Access token refreshed');
    
    return accessToken;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    throw error;
  }
};

/**
 * Check idle time và logout nếu quá 15 phút không hoạt động
 */
const checkIdleTime = (onLogout: () => void) => {
  const idleTime = Date.now() - lastActivityTime;
  
  if (idleTime >= IDLE_TIMEOUT) {
    console.warn('⏱️ User idle for 15 minutes - logging out');
    
    // Clear timers
    if (activityTimer) clearInterval(activityTimer);
    if (refreshTimer) clearInterval(refreshTimer);
    
    // Logout
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    
    onLogout();
    
    // Show notification
    alert('Your session has expired due to inactivity. Please login again.');
    
    window.location.href = '/login';
  }
};

/**
 * Reset activity time khi user có hoạt động
 */
const resetActivityTime = () => {
  lastActivityTime = Date.now();
};

/**
 * Setup activity tracking với 15 phút idle timeout
 */
export const setupActivityTracker = (onLogout: () => void) => {
  console.log('🎯 Setting up activity tracker (15min idle timeout)');
  
  // Track user activities
  const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
  activities.forEach(activity => {
    window.addEventListener(activity, resetActivityTime, true);
  });
  
  // Check idle time mỗi phút
  activityTimer = setInterval(() => {
    checkIdleTime(onLogout);
  }, 60 * 1000); // Check mỗi 1 phút
  
  // Auto refresh token mỗi 14 phút (nếu user đang active)
  refreshTimer = setInterval(async () => {
    const idleTime = Date.now() - lastActivityTime;
    
    // Chỉ refresh nếu user đang active (idle < 15 phút)
    if (idleTime < IDLE_TIMEOUT) {
      try {
        await refreshAccessToken();
      } catch (error) {
        console.error('Auto refresh failed - logging out');
        // Nếu refresh fail → logout
        if (activityTimer) clearInterval(activityTimer);
        if (refreshTimer) clearInterval(refreshTimer);
        
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('token');
        
        onLogout();
        window.location.href = '/login';
      }
    }
  }, REFRESH_INTERVAL);
  
  // Cleanup function
  return () => {
    console.log('🧹 Cleaning up activity tracker');
    
    activities.forEach(activity => {
      window.removeEventListener(activity, resetActivityTime, true);
    });
    
    if (activityTimer) clearInterval(activityTimer);
    if (refreshTimer) clearInterval(refreshTimer);
  };
};
