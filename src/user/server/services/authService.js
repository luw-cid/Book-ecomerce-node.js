const userModel = require('../models/userModel');
const RefreshToken = require('../models/refreshTokenModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');

const generatePassword = () => {
    // Tạo mật khẩu ngẫu nhiên 10 ký tự (chữ + số)
    return crypto.randomBytes(5).toString('hex');
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

const sendPasswordEmail = async (recipientEmail, password, fullName) => {
    try {
        if (!RESEND_API_KEY) {
            console.warn('⚠️ Resend API key not configured - skipping email');
            return false;
        }

        const emailData = {
            from: `Book Store <${RESEND_FROM_EMAIL}>`,
            to: recipientEmail,
            subject: 'Welcome to Book Store - Your Account Password - Change your pasword',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1a4d2e;">Welcome to Book Store!</h2>
                    <p>Hello <strong>${fullName}</strong>,</p>
                    <p>Your account has been created successfully. Here are your login credentials:</p>
                    
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${recipientEmail}</p>
                        <p style="margin: 5px 0;"><strong>Password:</strong> <span style="color: #1a4d2e; font-size: 18px; font-weight: bold;">${password}</span></p>
                    </div>
                    
                    <p style="color: #ff6b6b;"><strong>⚠️ Important:</strong> Please change your password after first login for security reasons.</p>
                    
                    <p>You can login at: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">Login Here</a></p>
                    
                    <p>Best regards,<br>Book Store Team</p>
                </div>
            `
        };

        const response = await axios.post('https://api.resend.com/emails', emailData, {
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 seconds timeout
        });

        console.log('✅ Password email sent successfully:', response.data.id);
        return true;
    } catch (error) {
        console.error('Email sending error:', error.response?.data || error.message);
        // Không throw để không làm fail đăng ký / guest order
        return false;
    }
};

// Đăng ký new user 
// Hash password bằng bcrypt
// Lưu user vào database
const registerUser = async (fullName, email, address) => {
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            throw new Error('Email already exists');
        }

        const randomPassword = generatePassword();
        // Hashpassword
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        // Tạo user mới
        const user = await userModel.create({
            fullName,
            email,
            address,
            password: hashedPassword,
            admin: false,
        });
        // Gửi mail chứa pass cho user
        await sendPasswordEmail(email, randomPassword, fullName);

        // không trả về pass trong response
        const userResponse = {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            address: user.address,
        };

        return userResponse;
    } catch (error) {
        throw error;
    }
}

/**
 * Generate Access Token (ngắn hạn - 15 phút)
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, admin: user.admin },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

/**
 * Generate Refresh Token (random string)
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Save Refresh Token to database
 */
const saveRefreshToken = async (userId, token) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 ngày

  await RefreshToken.create({
    user: userId,
    token,
    expiresAt
  });
};

// Đăng nhập user
// Kiểm tra password (so sánh mật khẩu user nhập với mật khẩu đã hash)
const loginUser = async (email, password) => {
    const user = await userModel.findOne({email});
    if(!user || !user.password) return null;

    // Nếu tài khoản đã bị ban thì trả về thông tin ban
    if (user.isBanned) {
        const baseMessage = 'Your account has been locked.';
        const reason = user.banReason 
            ? `${baseMessage} ${user.banReason}` 
            : baseMessage;
        return { banned: true, reason };
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return null;

    // Tạo access token (1h)
    const accessToken = generateAccessToken(user);
    
    // Tạo refresh token (30 ngày)
    const refreshToken = generateRefreshToken();
    
    // Lưu refresh token vào database
    await saveRefreshToken(user._id, refreshToken);

    return { user, accessToken, refreshToken };
};

// Tìm hoặc tạo Google user
const findOrCreateGoogleUser = async (profile) => {
  let user = await userModel.findOne({googleId: profile.id});
  if(!user) {
    user = await userModel.create ({
        googleId: profile.id,
        displayName: profile.displayName,
        fullName: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : undefined,
    });
  }

  // Nếu tài khoản đã bị ban thì trả về thông tin ban
  if (user.isBanned) {
    const baseMessage = 'Your account has been locked.';
    const reason = user.banReason 
      ? `${baseMessage} ${user.banReason}` 
      : baseMessage;
    return { banned: true, reason };
  }

  return user; 
};

// Xử lý Google OAuth callback - tạo token và format user data
const handleGoogleCallback = async (user) => {
    // Tạo access token (1h)
    const accessToken = generateAccessToken(user);
    
    // Tạo refresh token (30 ngày)
    const refreshToken = generateRefreshToken();
    
    // Lưu refresh token vào database
    await saveRefreshToken(user._id, refreshToken);
    
    // Format thông tin user để gửi về frontend
    const userData = {
        id: user._id,
        fullName: user.displayName || user.fullName,
        email: user.email,
        avatar: user.avatar
    };
    
    return { accessToken, refreshToken, user: userData };
};

/**
 * Refresh Access Token
 * Token Rotation: Tạo cả access token và refresh token mới
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    // Tìm refresh token trong database
    const tokenDoc = await RefreshToken.findOne({ token: refreshToken })
      .populate('user');

    if (!tokenDoc) {
      throw new Error('Invalid refresh token');
    }

    // Check expiration
    if (new Date() > tokenDoc.expiresAt) {
      await RefreshToken.deleteOne({ _id: tokenDoc._id });
      throw new Error('Refresh token expired');
    }

    const user = tokenDoc.user;

    // Token Rotation: Tạo cả 2 tokens mới
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken();

    // Xóa refresh token cũ
    await RefreshToken.deleteOne({ _id: tokenDoc._id });

    // Lưu refresh token mới
    await saveRefreshToken(user._id, newRefreshToken);

    return { 
      accessToken: newAccessToken,
      refreshToken: newRefreshToken 
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Logout - Xóa refresh token khỏi database
 */
const logout = async (refreshToken) => {
  await RefreshToken.deleteOne({ token: refreshToken });
};

/**
 * Logout All Devices - Xóa tất cả refresh tokens của user
 */
const logoutAllDevices = async (userId) => {
  await RefreshToken.deleteMany({ user: userId });
};

const resetPassword = async (email, newPassword) => {
  const user = await userModel.findOne({ email });
  if(!user) return null;
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await userModel.updateOne({ email }, { password: hashedPassword });
  return true;
};

const recoverPassword = async (email) => {
  const user = await userModel.findOne({ email });
  if(!user) return null;
  const randomPassword = generatePassword();
  const hashedPassword = await bcrypt.hash(randomPassword, 10);
  await userModel.updateOne({ email }, { password: hashedPassword });
  await sendPasswordEmail(email, randomPassword, user.fullName);
  return true;
};

module.exports = {
    registerUser,
    loginUser,
    findOrCreateGoogleUser,
    handleGoogleCallback,
    refreshAccessToken,
    logout,
    logoutAllDevices,
    recoverPassword,
    resetPassword
};