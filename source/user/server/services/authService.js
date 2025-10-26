const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Đăng ký new user 
// Hash password bằng bcrypt
// Lưu user vào database
const registerUser = async (fullName, password, email) => {
    const hashpassword = await bcrypt.hash(password, 10);
    return await User.create({fullName, password: hashpassword, email})
}

// Đăng nhập user
// Kiểm tra password (so sánh mật khẩu user nhập với mật khẩu đã hash)
const loginUser = async (email, password) => {
    const user = await User.findOne({email});
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
  let user = await User.findOne({googleId: profile.id});
  if(!user) {
    user = await User.create ({
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