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
    const { user, token } = result;
    
    res.json({
        message: "Login successfully!",
        token,
        user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            address: user.address,
            admin: user.admin,
        },
    });
});

// Lấy thông tin profile (API REST)
const profile = asyncHandle(async (req, res) => {
    res.json({ user: req.user });
});

// Đăng xuất (API REST)
const logout = asyncHandle(async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            throw new AppError("Lỗi khi đăng xuất!", 500);
        }
        res.json({ message: "Logout successfully!" });
    });
});

// Callback Google OAuth
const googleCallback = asyncHandle(async (req, res) => {
    // Gọi service xử lý logic
    const { token, user } = await authService.handleGoogleCallback(req.user);
    
    // Encode data để truyền qua URL
    const encodedUser = encodeURIComponent(JSON.stringify(user));
    const encodedToken = encodeURIComponent(token);
    
    // Redirect về frontend
    res.redirect(`http://localhost:5173/auth/callback?token=${encodedToken}&user=${encodedUser}`);
});

module.exports = {
    register,
    login,
    profile,
    logout,
    googleCallback,
};