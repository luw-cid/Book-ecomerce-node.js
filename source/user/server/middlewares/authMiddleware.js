// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../errors');

const authMiddleware = async (req, res, next) => {
    try {
        // Lấy token từ header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token, access denied'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Tìm user
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Gắn user vào request
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token is not valid'
        });
    }
};
const authenticate = async (req, res, next) => {
  try {
    // Lấy token từ header Authorization
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
      throw new AppError('Authentication required. Please log in.', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Lấy user từ database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Gắn user vào req để các handler sau dùng
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    next(error);
  }
};
module.exports = { authenticate, authMiddleware };