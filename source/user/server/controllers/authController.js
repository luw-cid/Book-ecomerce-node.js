// controllers/authController.js
const authService = require("../services/authService");
const AppError = require("../errors");
const asyncHandle = require('express-async-handler');

// Đăng ký tài khoản (API REST)
const register = asyncHandle(async (req, res) => {
    const { fullName, password, email } = req.body;
    const user = await authService.registerUser(fullName, password, email);
    res.status(201).json({ message: "Login successfully", user });
});

// Đăng nhập (API REST)
const login = asyncHandle(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    if (!result) {
        throw new AppError("Account or password incorrect", 401);
    }
    const { user, token } = result;
    // Nếu dùng session:
    // req.session.user = user;
    // res.json({ message: "Đăng nhập thành công!", user });
    // Nếu dùng JWT, trả về token ở đây
    res.json({
        message: "Login successfully!",
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
        res.json({ message: "Logout successfully!" });
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