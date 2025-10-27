require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

const indexRouter = require("./routes/index");

const errorHandle = require('./middlewares/errorHandler');
const connectDB = require('./config/connectDB');

const app = express();


// Cấu hình CORS
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// import passport config
require('./config/passport');

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

// Khởi tạo Passport
app.use(passport.initialize());
app.use(passport.session());

//Routes

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Mount main router
app.use('/', indexRouter);

// bắt lỗi 404 (nếu không route nào khớp)
app.use(function (req, res, next) {
    res.status(404).json({ message: "Not Found" });
});

// xử lý lỗi
app.use(errorHandle);

app.listen(3000, () => console.log('Server is running on http://localhost:3000'));

module.exports = app;
