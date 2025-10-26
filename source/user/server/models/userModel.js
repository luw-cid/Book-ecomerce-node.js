const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        googleId: { type: String, required: false, sparse: true },
        userId: { type: String, required: false, sparse: true },
        fullName: { type: String, required: true },
        displayName: { type: String, required: false }, // Tên hiển thị từ Google
        email: { type: String, required: true, unique: true, sparse: true },
        password: { type: String, required: false }, // Không bắt buộc cho Google login
        phoneNumber: { type: String, required: false, unique: true, sparse: true },
        address: { type: String, required: false}, // Sửa typo: adrress -> address
        avatar: { type: String, required: false }, // Avatar từ Google
        admin: { type: Boolean, required: false, default: false },
        preferences: {
            emailNotifications: { type: Boolean, default: true },
            smsNotifications: { type: Boolean, default: false },
            marketingEmails: { type: Boolean, default: true }
        }
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
