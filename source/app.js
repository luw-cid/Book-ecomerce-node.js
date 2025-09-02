const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = repuire('express-session')
const passport = require('passport');
const moongoose = require('moongoose');
const { dir } = require('console');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/authRoute');
const userRouter = require('./routes/userRoute');
// connect to database
moongoose.connect('mongodb://localhost:27017/ecommerce_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const app = express();

// cấu hình view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.user('/', )

// bắt lỗi 404
app.use(function (req, res, next) {
    next(createError(404));
});

// xử lý lỗi
app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render lỗi
    res.status(err.status || 500);
    res.render('error');
});

app.listen(3000, () => console.log('Server is running on http://localhost:3000'));

module.exports = app;
