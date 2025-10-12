const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        googleId: { type: String, required: false, sparse: true },
        userId: { type: String, required: false, sparse: true },
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true, sparse: true },
        password: { type: String, required: true },
        phoneNumber: { type: String, required: false, unique: true, sparse: true },
        adrress: { type: String, required: false},
        admin: { type: Boolean, required: false },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
