require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
// const passport = require('passport');

const indexRouter = require("./routes/index");

const errorHandle = require('./middlewares/errorHandler');
const connectDB = require('./config/connectDB');

const app = express();


// Cấu hình CORS
app.use(cors({
    origin: ['http://localhost:5000', 'http://localhost:5173'], // Thêm port 5173 cho Vite
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve static files từ thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// import passport config
// require('./config/passport');

// connect to database
connectDB();

// cấu hình session
app.use(
    session({
        secret: "secretkey",
        resave: false,
        saveUninitialized: false, // Không lưu session chưa được khởi tạo
        rolling: true, // Reset thời gian hết hạn mỗi khi có request
        cookie: {
            maxAge: 30 * 60 * 1000, // 30 phút (tính bằng milliseconds)
            httpOnly: true, // Bảo vệ khỏi XSS attacks
            secure: false, // Đặt true nếu dùng HTTPS
            sameSite: 'lax' // Bảo vệ khỏi CSRF attacks
        }
    })
);

// // Khởi tạo Passport
// app.use(passport.initialize());
// app.use(passport.session());

//Routes

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Mount main router với prefix /api
app.use('/', indexRouter);

// bắt lỗi 404 (nếu không route nào khớp)
app.use(function (req, res, next) {
    res.status(404).json({ message: "Not Found" });
});

// xử lý lỗi
app.use(errorHandle);

const PORT = process.env.PORT || 4000; // Admin server chạy trên port 4000
app.listen(PORT, () => {
    console.log(`🚀 Admin Server is running on http://localhost:${PORT}`);
    console.log(`📡 Auth endpoints: http://localhost:${PORT}/auth`);
});

module.exports = app;
