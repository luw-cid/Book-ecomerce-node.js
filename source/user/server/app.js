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
        saveUninitialized: true,
    })
);

// app.use(passport.initialize());
// app.use(passport.session());

//Routes

// Mount main router under /api
app.use('/api', indexRouter);

// bắt lỗi 404 (nếu không route nào khớp)
app.use(function (req, res, next) {
    res.status(404).json({ message: "Not Found" });
});

// xử lý lỗi
app.use(errorHandle);

app.listen(3000, () => console.log('Server is running on http://localhost:3000'));

module.exports = app;
