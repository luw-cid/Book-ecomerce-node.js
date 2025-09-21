// controllers/authController.js
const authService = require("../services/authService");

// Hiển thị form login (nếu dùng view, còn nếu chỉ API thì có thể bỏ)
// const showLoginForm = (req, res) => {
//     res.render('login');
// };

// Đăng ký tài khoản (API REST)
const register = async (req, res) => {
    const { fullName, password, email } = req.body;
    try {
        const user = await authService.registerUser(fullName, password, email);
        res.status(201).json({ message: "Đăng ký thành công", user });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: "Đăng ký thất bại: " + err.message });
    }
};

// Đăng nhập (API REST)
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await authService.loginUser(email, password);
        if (!result) {
            return res.status(401).json({ message: "Tài khoản hoặc mật khẩu không đúng!" });
        }
        
        // Nếu dùng session:
        // req.session.user = user;
        // res.json({ message: "Đăng nhập thành công!", user });
        // Nếu dùng JWT, trả về token ở đây
        const { user, token } = result;
        res.json({
            message: "Đăng nhập thành công!",
            token,
            user: {
                id: user.id,
                name: user.fullName,
                email: user.email,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server!" });
    }
};

// Lấy thông tin profile (API REST)
const profile = (req, res) => {
    // Nếu dùng session
    // const user = req.session.user || req.user;
    // if (!user) {
    //     return res.status(401).json({ message: "Chưa đăng nhập!" });
    // }
    res.json({ user: req.user });
};

// Đăng xuất (API REST)
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Lỗi khi đăng xuất!" });
        }
        res.json({ message: "Đăng xuất thành công!" });
    });
};

// Callback Google OAuth
const googleCallback = (req, res) => {
    // Nếu dùng API thuần, có thể trả về token hoặc thông tin user
    // Nếu dùng web truyền thống, redirect về trang profile
    res.redirect('/profile');
};

module.exports = {
    register,
    login,
    profile,
    logout,
    googleCallback,
};