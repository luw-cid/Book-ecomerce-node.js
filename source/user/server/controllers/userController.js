// controllers/userController.js
const userService = require("../services/userService");
const AppError = require("../errors");
const asyncHandle = require('express-async-handler');

// Lấy thông tin profile
const getProfile = asyncHandle(async (req, res) => {
    const userId = req.user.id;
    const user = await userService.getUserProfile(userId);
    
    if (!user) {
        throw new AppError("User not found", 404);
    }
    
    res.json({ user });
});

// Cập nhật thông tin profile
const updateProfile = asyncHandle(async (req, res) => {
    const userId = req.user.id;
    const { fullName, phoneNumber, address } = req.body;
    
    const updatedUser = await userService.updateUserProfile(userId, {
        fullName,
        phoneNumber,
        address
    });
    
    res.status(200).json({
        message: "Profile updated successfully",
        user: updatedUser
    });
});

// Thay đổi mật khẩu
const changePassword = asyncHandle(async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        throw new AppError("Please provide current password and new password", 400);
    }
    
    await userService.changePassword(userId, currentPassword, newPassword);
    
    res.status(200).json({ message: "Password changed successfully" });
});

// Upload avatar
const uploadAvatar = asyncHandle(async (req, res) => {
    const userId = req.user.id;
    
    if (!req.file) {
        throw new AppError("Please upload an image", 400);
    }
    
    const avatarUrl = await userService.uploadAvatar(userId, req.file);
    
    res.status(200).json({
        message: "Avatar uploaded successfully",
        avatar: avatarUrl
    });
});

// Cập nhật preferences
const updatePreferences = asyncHandle(async (req, res) => {
    const userId = req.user.id;
    const preferences = req.body;
    
    const updatedUser = await userService.updatePreferences(userId, preferences);
    
    res.status(200).json({
        message: "Preferences updated successfully",
        preferences: updatedUser.preferences
    });
});

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    updatePreferences
};
