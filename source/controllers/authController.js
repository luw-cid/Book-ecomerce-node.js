// controllers/authController.js
const authService = require("../services/authService");
// Hiển thị form login (view login.ejs)
const showLoginForm = (req, res) => {
    res.render('login');
};
// Đăng ký 
const register = async (req, res) => {
    const { username, password, email } = req.body;
    try {
        await authService.register(username, password, email);
        res.redirect('/auth/login');
    } catch (err){
        // Xử lý lỗi
        console.error(err);
        res.status(500).send("Đăng ký thất bại!: " + err.message);
    }
}

// login thường 
const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await authService.login(username, password);
        if(!user) return res.status(401).send("Tên đăng nhập hoặc mật khẩu không đúng!!");
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server!!");
    }
}

// Xử lý logout
const profile = (req, res) => {
    if(!req.session.user || !req.user) return res.redirect('/auth/login');
    res.render('profile', {user: req.session.user || res.user});
}

const googleCallback = (req, res) => {
    res.redirect('/profile');
}