const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Đăng nhập dành riêng cho admin
// Kiểm tra thêm quyền admin
const loginAdmin = async (email, password) => {
    const user = await User.findOne({ email, admin: true });
    if (!user || !user.password) {
        return { success: false, message: "Tài khoản không tồn tại hoặc không có quyền admin!" };
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return { success: false, message: "Mật khẩu không đúng!" };
    }

    const token = jwt.sign(
        { 
            id: user._id, 
            email: user.email, 
            admin: true 
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
    );

    return { 
        success: true, 
        user, 
        token 
    };
};

// Tạo tài khoản admin (chỉ dùng trong script seed)
const createAdmin = async (fullName, email, password) => {
    // Kiểm tra admin đã tồn tại chưa
    const existingAdmin = await User.findOne({ email, admin: true });
    if (existingAdmin) {
        return { success: false, message: "Admin đã tồn tại!", user: existingAdmin };
    }
    
    const hashpassword = await bcrypt.hash(password, 10);
    const admin = await User.create({ 
        fullName, 
        email, 
        password: hashpassword, 
        admin: true 
    });
    
    return { success: true, message: "Tạo admin thành công!", user: admin };
};

module.exports = {
    loginAdmin,
    createAdmin,
};