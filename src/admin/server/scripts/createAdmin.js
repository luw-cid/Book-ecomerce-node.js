// scripts/createAdmin.js
// Script để tạo tài khoản admin với thông tin tùy chỉnh
require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const authService = require('../services/authService');

// Tạo interface để nhập liệu
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Hàm hỏi câu hỏi
const question = (query) => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};

// Kết nối database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.URI_DB);
        console.log('✅ MongoDB connected successfully\n');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Validate email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate password (ít nhất 6 ký tự)
const isValidPassword = (password) => {
    return password && password.length >= 6;
};

// Tạo admin với thông tin tùy chỉnh
const createCustomAdmin = async () => {
    try {
        console.log('╔════════════════════════════════════════╗');
        console.log('║   CREATE NEW ADMIN ACCOUNT            ║');
        console.log('╚════════════════════════════════════════╝\n');
        
        // Nhập thông tin admin
        const fullName = await question('👤 Enter admin full name: ');
        if (!fullName || fullName.trim().length === 0) {
            console.log('❌ Full name is required!');
            rl.close();
            return;
        }
        
        let email;
        while (true) {
            email = await question('📧 Enter admin email: ');
            if (isValidEmail(email)) {
                break;
            }
            console.log('❌ Invalid email format! Please try again.\n');
        }
        
        let password;
        while (true) {
            password = await question('🔑 Enter admin password (min 6 characters): ');
            if (isValidPassword(password)) {
                break;
            }
            console.log('❌ Password must be at least 6 characters! Please try again.\n');
        }
        
        const confirmPassword = await question('🔑 Confirm password: ');
        if (password !== confirmPassword) {
            console.log('❌ Passwords do not match!');
            rl.close();
            return;
        }
        
        console.log('\n⏳ Creating admin account...\n');
        
        // Tạo admin
        const result = await authService.createAdmin(fullName.trim(), email.trim(), password);
        
        if (result.success) {
            console.log('✅ Admin account created successfully!\n');
            console.log('╔════════════════════════════════════════╗');
            console.log('║   ADMIN ACCOUNT DETAILS               ║');
            console.log('╚════════════════════════════════════════╝');
            console.log('📧 Email:', result.user.email);
            console.log('👤 Name:', result.user.fullName);
            console.log('🔑 ID:', result.user._id);
            console.log('🛡️  Admin:', result.user.admin ? 'Yes' : 'No');
            console.log('📅 Created:', result.user.createdAt);
            console.log('\n⚠️  IMPORTANT: Keep these credentials safe!\n');
        } else {
            console.log('❌', result.message);
        }
        
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
    } finally {
        rl.close();
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
};

// Chạy script
const run = async () => {
    await connectDB();
    await createCustomAdmin();
};

run();
