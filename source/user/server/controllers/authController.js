// controllers/authController.js
const authService = require("../services/authService");
const AppError = require("../errors");
const asyncHandle = require('express-async-handler');

// Đăng ký tài khoản (API REST)
const register = asyncHandle(async (req, res) => {
    const { fullName, password, email } = req.body;
    const user = await authService.registerUser(fullName, password, email);
    res.status(201).json({ message: "Đăng ký thành công", user });
});

// Đăng nhập (API REST)
const login = asyncHandle(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    if (!result) {
        throw new AppError("Tài khoản hoặc mật khẩu không đúng!", 401);
    }
    const { user, token } = result;
    // Nếu dùng session:
    // req.session.user = user;
    // res.json({ message: "Đăng nhập thành công!", user });
    // Nếu dùng JWT, trả về token ở đây
    res.json({
        message: "Đăng nhập thành công!",
        token,
        user: {
            id: user.id,
            name: user.fullName,
            email: user.email,
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
        res.json({ message: "Đăng xuất thành công!" });
    });
});

// Callback Google OAuth
const googleCallback = asyncHandle(async (req, res) => {
    res.redirect('/profile');
});

module.exports = {
    register,
    login,
    profile,
    logout,
    googleCallback,
};