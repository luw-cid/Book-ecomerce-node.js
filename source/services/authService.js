const User = require("../models/userModel");
const bcrypt = require("bcrypt");

// đăng ký new user 
// hash password bằng bcrypt
// lưu user vào database
const registerUser = async (username, password, email) => {
    const hashpassword = await bcrypt.hash(password, 10);
    return await User.create({username, password: hashpassword, email})
}

// đăng nhập user
// kiểm tra password (so sánh mật khẩu user nhập với mật khẩu đã hash)
const loginUser = async (username, password) => {
    const user = await User.findOne({ username});
    if(!user) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch ? user : null;
};

const findOrCreateGoogleUser = async (profile) => {
  let user = await User.findOne({googleId: profile.id});
  if(!user) {
    user = await User.create ({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,

    });
  }
  return user; 
};

module.exports = {
    registerUser,
    loginUser,
    findOrCreateGoogleUser,
};