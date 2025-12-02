/**
 * Utility functions để quản lý token storage nhất quán
 * Hỗ trợ cả localStorage (persistent) và sessionStorage (session-only)
 */

const STORAGE_TYPE_KEY = 'token_storage_type'; // 'local' hoặc 'session'

/**
 * Lấy token từ storage (check cả localStorage và sessionStorage)
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

/**
 * Lấy refresh token từ storage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
};

/**
 * Lưu token vào storage (localStorage hoặc sessionStorage)
 * @param token - Access token
 * @param refreshToken - Refresh token
 * @param useLocalStorage - true = localStorage (persistent), false = sessionStorage (session-only)
 */
export const setTokens = (token: string, refreshToken: string, useLocalStorage: boolean = true) => {
  if (useLocalStorage) {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem(STORAGE_TYPE_KEY, 'local');
    // Xóa khỏi sessionStorage nếu có
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
  } else {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem(STORAGE_TYPE_KEY, 'session');
    // Xóa khỏi localStorage nếu có
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
};

/**
 * Xóa tất cả tokens khỏi cả localStorage và sessionStorage
 */
export const removeTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem(STORAGE_TYPE_KEY);
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem(STORAGE_TYPE_KEY);
};

/**
 * Kiểm tra xem token đang được lưu ở đâu
 */
export const getStorageType = (): 'local' | 'session' | null => {
  if (localStorage.getItem('token')) return 'local';
  if (sessionStorage.getItem('token')) return 'session';
  return null;
};

/**
 * Lưu user vào storage (theo storage type hiện tại)
 */
export const setUser = (user: any) => {
  const storageType = getStorageType();
  if (storageType === 'local') {
    localStorage.setItem('user', JSON.stringify(user));
    sessionStorage.removeItem('user');
  } else if (storageType === 'session') {
    sessionStorage.setItem('user', JSON.stringify(user));
    localStorage.removeItem('user');
  } else {
    // Mặc định dùng localStorage nếu chưa có token
    localStorage.setItem('user', JSON.stringify(user));
  }
};

/**
 * Lấy user từ storage
 */
export const getUser = (): any | null => {
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Xóa user khỏi storage
 */
export const removeUser = () => {
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
};



