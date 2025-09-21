const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// đăng ký new user 
// hash password bằng bcrypt
// lưu user vào database
const registerUser = async (fullName, password, email) => {
    const hashpassword = await bcrypt.hash(password, 10);
    return await User.create({fullName, password: hashpassword, email})
}

// đăng nhập user
// kiểm tra password (so sánh mật khẩu user nhập với mật khẩu đã hash)
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