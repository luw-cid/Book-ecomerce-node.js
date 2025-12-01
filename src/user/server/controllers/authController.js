// controllers/authController.js
const authService = require("../services/authService");
const AppError = require("../errors");
const asyncHandle = require('express-async-handler');

// Đăng ký tài khoản (API REST)
const register = asyncHandle(async (req, res) => {
    const { fullName, email, address } = req.body;
    if (!fullName || !address || !email) {
        throw new AppError("Please provide full name, email and password", 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            message: 'Please provide a valid email address' 
        });
    }
    const user = await authService.registerUser(fullName, email, address);
    res.status(201).json({ message: "Register successfully! Please check your email for login credentials.", user });
});

// Đăng nhập (API REST)
const login = asyncHandle(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    if (!result) {
        throw new AppError("Account or password incorrect", 401);
    }
    const { user, accessToken, refreshToken } = result;
    
    res.json({
        success: true,
        message: "Login successfully!",
        data: {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                address: user.address,
                admin: user.admin,
            },
        }
    });
});

// Lấy thông tin profile (API REST)
const profile = asyncHandle(async (req, res) => {
    res.json({ user: req.user });
});

// Đăng xuất (API REST)
const logout = asyncHandle(async (req, res) => {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
        await authService.logout(refreshToken);
    }
    
    res.json({ 
        success: true,
        message: "Logout successfully!" 
    });
});

// Refresh Token
const refreshToken = asyncHandle(async (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
        throw new AppError('Refresh token is required', 400);
    }
    
    const result = await authService.refreshAccessToken(refreshToken);
    
    res.json({
        success: true,
        data: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        }
    });
});

// Logout All Devices
const logoutAllDevices = asyncHandle(async (req, res) => {
    const userId = req.user.id;
    
    await authService.logoutAllDevices(userId);
    
    res.json({
        success: true,
        message: 'Logged out from all devices'
    });
});

// Callback Google OAuth
const googleCallback = asyncHandle(async (req, res) => {
    // Gọi service xử lý logic
    const { accessToken, refreshToken, user } = await authService.handleGoogleCallback(req.user);
    
    // Encode data để truyền qua URL
    const encodedUser = encodeURIComponent(JSON.stringify(user));
    const encodedAccessToken = encodeURIComponent(accessToken);
    const encodedRefreshToken = encodeURIComponent(refreshToken);
    
    // Redirect về frontend
    res.redirect(`http://localhost:5173/auth/callback?accessToken=${encodedAccessToken}&refreshToken=${encodedRefreshToken}&user=${encodedUser}`);
});

const checkSession = (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
  }
  return res.status(401).json({
    success: false,
    message: 'Not authenticated'
  });
};

const recoverPassword = asyncHandle(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new AppError("Email is required", 400);
    }
    const result = await authService.recoverPassword(email);
    if (!result) {
        throw new AppError("Email not found", 404);
    }
    res.json({
        success: true,
        message: "Password recovered successfully! Please check your email for new password."
    });
});

const resetPassword = asyncHandle(async (req, res) => {
    const { email, newPassword } = req.body;
    const result = await authService.resetPassword(email, newPassword);
    if (!result) {
        throw new AppError("Email not found", 404);
    }
    res.json({
        success: true,
        message: "Password reset successfully!"
    });
});

module.exports = {
    register,
    login,
    profile,
    logout,
    refreshToken,
    logoutAllDevices,
    googleCallback,
    checkSession,
    recoverPassword,
    resetPassword
};