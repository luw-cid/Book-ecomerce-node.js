const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generatePassword = () => {
    // Tạo mật khẩu ngẫu nhiên 10 ký tự (chữ + số)
    return crypto.randomBytes(5).toString('hex');
}

const createEmailTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        }
    });
};

const sendPasswordEmail = async (recipientEmail, password, fullName) => {
    try {
        const transporter = createEmailTransporter();

        const mailOptions = {
            from: `"Book Store" <${process.env.EMAIL_USER}>`,
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
                    
                    <p>You can login at: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login">Login Here</a></p>
                    
                    <p>Best regards,<br>Book Store Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email sending email:', error);
        throw new Error('Failed to send password email');
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

// Đăng nhập user
// Kiểm tra password (so sánh mật khẩu user nhập với mật khẩu đã hash)
const loginUser = async (email, password) => {
    const user = await userModel.findOne({email});
    if(!user || !user.password) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return null;

    const token = jwt.sign(
      { id: user._id, email: user.email, admin: user.admin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { user, token};
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
  return user; 
};

// Xử lý Google OAuth callback - tạo token và format user data
const handleGoogleCallback = async (user) => {
    // Tạo JWT token cho user
    const token = jwt.sign(
        { id: user._id, email: user.email, admin: user.admin },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
    
    // Format thông tin user để gửi về frontend
    const userData = {
        id: user._id,
        name: user.displayName || user.fullName,
        email: user.email,
        avatar: user.avatar
    };
    
    return { token, user: userData };
};

module.exports = {
    registerUser,
    loginUser,
    findOrCreateGoogleUser,
    handleGoogleCallback,
};