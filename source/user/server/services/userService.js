// services/userService.js
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const AppError = require("../errors");

// Lấy thông tin user
const getUserProfile = async (userId) => {
    const user = await User.findById(userId).select('-password');
    return user;
};

// Cập nhật profile
const updateUserProfile = async (userId, updateData) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
    ).select('-password');
    
    return user;
};

// Thay đổi mật khẩu
const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId);
    
    if (!user) {
        throw new AppError("User not found", 404);
    }
    
    // Kiểm tra mật khẩu hiện tại (chỉ cho user đăng ký bằng email/password)
    if (user.password) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new AppError("Current password is incorrect", 401);
        }
    } else {
        throw new AppError("Cannot change password for social login accounts", 400);
    }
    
    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    return true;
};

// Upload avatar (giả lập - trong thực tế sẽ upload lên cloud storage)
const uploadAvatar = async (userId, file) => {
    // Trong thực tế, bạn sẽ upload file lên cloud storage như AWS S3, Cloudinary, etc.
    // Ở đây chúng ta giả lập bằng cách lưu đường dẫn local
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    
    await User.findByIdAndUpdate(userId, { avatar: avatarUrl });
    
    return avatarUrl;
};

// Cập nhật preferences
const updatePreferences = async (userId, preferences) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { $set: { preferences } },
        { new: true }
    ).select('-password');
    
    return user;
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    changePassword,
    uploadAvatar,
    updatePreferences
};
