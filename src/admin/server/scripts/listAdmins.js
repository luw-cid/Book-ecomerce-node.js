// scripts/listAdmins.js
// Script để xem danh sách tất cả admin trong database
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');

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

// Liệt kê tất cả admin
const listAdmins = async () => {
    try {
        console.log('╔════════════════════════════════════════╗');
        console.log('║   LIST OF ALL ADMIN ACCOUNTS          ║');
        console.log('╚════════════════════════════════════════╝\n');
        
        const admins = await User.find({ admin: true }).select('-password');
        
        if (admins.length === 0) {
            console.log('⚠️  No admin accounts found in database!');
            console.log('\n💡 Run "npm run seed:admin" to create default admin account.\n');
        } else {
            console.log(`📊 Found ${admins.length} admin account(s):\n`);
            
            admins.forEach((admin, index) => {
                console.log(`${index + 1}. ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`   📧 Email: ${admin.email}`);
                console.log(`   👤 Name: ${admin.fullName}`);
                console.log(`   🔑 ID: ${admin._id}`);
                console.log(`   📅 Created: ${admin.createdAt}`);
                console.log(`   🔄 Updated: ${admin.updatedAt}`);
                console.log('');
            });
        }
        
    } catch (error) {
        console.error('❌ Error listing admins:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
};

// Chạy script
const run = async () => {
    await connectDB();
    await listAdmins();
};

run();
