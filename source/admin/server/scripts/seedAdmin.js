// scripts/seedAdmin.js
// Script để tạo tài khoản admin mặc định
require('dotenv').config();
const mongoose = require('mongoose');
const authService = require('../services/authService');

// Kết nối database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.URI_DB);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Tạo admin mặc định
const seedAdmin = async () => {
    try {
        console.log('\n🚀 Starting admin seeding process...\n');
        
        // Admin mặc định
        const defaultAdmin = {
            fullName: 'Administrator',
            email: 'admin@bookstore.com',
            password: 'Admin@123' // Nên đổi mật khẩu sau khi đăng nhập lần đầu
        };
        
        console.log('📋 Default Admin Account:');
        console.log('   Email:', defaultAdmin.email);
        console.log('   Password:', defaultAdmin.password);
        console.log('   Name:', defaultAdmin.fullName);
        console.log('\n⚠️  IMPORTANT: Please change this password after first login!\n');
        
        const result = await authService.createAdmin(
            defaultAdmin.fullName,
            defaultAdmin.email,
            defaultAdmin.password
        );
        
        if (result.success) {
            console.log('✅', result.message);
            console.log('\n📧 Admin Email:', result.user.email);
            console.log('👤 Admin Name:', result.user.fullName);
            console.log('🔑 Admin ID:', result.user._id);
            console.log('🛡️  Admin Status:', result.user.admin ? 'Active' : 'Inactive');
        } else {
            console.log('⚠️ ', result.message);
        }
        
        console.log('\n✨ Admin seeding completed!\n');
        
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
    } finally {
        // Đóng kết nối database
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
};

// Chạy script
const run = async () => {
    await connectDB();
    await seedAdmin();
};

run();
