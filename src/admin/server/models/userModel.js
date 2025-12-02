const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        googleId: { type: String, required: false, sparse: true },
        userId: { type: String, required: false, sparse: true },
        fullName: { type: String, required: true },
        displayName: { type: String, required: false },
        email: { type: String, required: true, unique: true, sparse: true },
        password: { type: String, required: false },
        phoneNumber: { type: String, required: false, unique: true, sparse: true },
        address: { type: String, required: false},
        avatar: { type: String, required: false },
        admin: { type: Boolean, required: false, default: false },
        // Trạng thái khóa tài khoản
        isBanned: { type: Boolean, default: false },
        banReason: { type: String, required: false },
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
