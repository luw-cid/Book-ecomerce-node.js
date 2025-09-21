require('dotenv').config();

const createError = require("http-errors");
const express = require("express");
const cors = require('cors');
const path = require('path');
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");

const app = express();

// Cấu hình CORS
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// const indexRouter = require("./routes/index");
const authRouter = require("./routes/authRoute");
// const userRouter = require("./routes/userRoute");

// import passport config
require("./config/passport");

// connect to database
mongoose.connect('mongodb://localhost:27017/ecommerce_db'
  // useNewUrlParser: true,
  // useUnifiedTopology: true
);



// cấu hình view engine
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// cấu hình session
app.use(
    session({
        secret: "secretkey",
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

//Routes
app.use("/auth", authRouter);

// bắt lỗi 404
app.use(function (req, res, next) {
    res.status(404).json({ message: "Not Found" });
});

// xử lý lỗi
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
        error: req.app.get('env') === 'development' ? err : {}
    });
});

app.listen(3000, () => console.log('Server is running on http://localhost:3000'));

module.exports = app;
