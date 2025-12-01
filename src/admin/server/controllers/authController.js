// controllers/authController.js
const asyncHandle = require('express-async-handler');
const authService = require('../services/authService');
const AppError = require('../errors');

// Đăng nhập Admin (API REST)
const loginAdmin = asyncHandle(async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        throw new AppError("Vui lòng điền email và mật khẩu!", 400);
    }
    
    const result = await authService.loginAdmin(email, password);
    
    if (!result.success) {
        throw new AppError(result.message, 401);
    }
    
    const { user, token } = result;
    
    res.json({
        success: true,
        message: "Đăng nhập admin thành công!",
        token,
        user: {
            id: user._id,
            name: user.fullName,
            email: user.email,
            admin: true
        },
    });
});

// Lấy thông tin profile (API REST)
const profile = asyncHandle(async (req, res) => {
    res.json({ 
        success: true,
        user: req.user 
    });
});

module.exports = {
    loginAdmin,
    profile,
};