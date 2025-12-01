require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

const indexRouter = require("./routes/index");
const errorHandle = require('./middlewares/errorHandler');
const connectDB = require('./config/connectDB');
const { cleanupUnpaidOrders } = require('./jobs/clearupOrders');

const app = express();
const server = http.createServer(app);

// ============= SOCKET.IO SETUP =============
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const socketAllowedOrigins = [
  'http://localhost:5173',
  FRONTEND_URL,
];

const io = socketIo(server, {
  cors: {
    origin: socketAllowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // Join product room
  socket.on('joinProduct', (productId) => {
    socket.join(`product-${productId}`);
    console.log(`📦 Socket ${socket.id} joined product-${productId}`);
  });

  // Leave product room
  socket.on('leaveProduct', (productId) => {
    socket.leave(`product-${productId}`);
    console.log(`📤 Socket ${socket.id} left product-${productId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Cấu hình CORS
const allowedOrigins = [
    'http://localhost:5173',
    FRONTEND_URL, // Vercel frontend (từ ENV)
];

app.use(cors({
    origin: allowedOrigins,
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

cleanupUnpaidOrders();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket ready on ws://localhost:${PORT}`);
});

module.exports = app;
