const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        googleId: { type: String, required: true, aparse: true },
        userId: { type: String, required: true, sparse: true },
        password: { type: String },
        displayName: { type: String },
        email: { type: String, required: true, sparse: true },
    },
    { timestamps: true }
);

const User = mongoose.model('user', userSchema);

exports.User = User;
