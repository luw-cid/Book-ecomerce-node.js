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
        address: { type: String, required: false}, // Địa chỉ chính (backward compatible)
        // Nhiều địa chỉ giao hàng
        addresses: [{
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: false },
            district: { type: String, required: false },
            ward: { type: String, required: false },
            isDefault: { type: Boolean, default: false }
        }],
        avatar: { type: String, required: false }, // Avatar từ Google
        admin: { type: Boolean, required: false, default: false },
        preferences: {
            emailNotifications: { type: Boolean, default: true },
            smsNotifications: { type: Boolean, default: false },
            marketingEmails: { type: Boolean, default: true }
        },
        
        // Loyalty Program
        loyalty: {
            points: { 
                type: Number, 
                default: 0, 
                min: 0 
            },
            lifetimePoints: { 
                type: Number, 
                default: 0, 
                min: 0 
            },
            tier: { 
                type: String, 
                enum: ['bronze', 'silver', 'gold', 'platinum'], 
                default: 'bronze' 
            },
            lastEarnedAt: { 
                type: Date 
            },
            lastRedeemedAt: { 
                type: Date 
            }
        }
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;


module.exports = User;
