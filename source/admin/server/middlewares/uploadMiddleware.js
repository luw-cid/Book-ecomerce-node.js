// middlewares/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa có
const uploadExcelDir = path.join(__dirname, '../uploads/excel');
const uploadImagesDir = path.join(__dirname, '../uploads/images');
const uploadCategoriesDir = path.join(__dirname, '../uploads/images/categories');

if (!fs.existsSync(uploadExcelDir)) {
    fs.mkdirSync(uploadExcelDir, { recursive: true });
}
if (!fs.existsSync(uploadImagesDir)) {
    fs.mkdirSync(uploadImagesDir, { recursive: true });
}
if (!fs.existsSync(uploadCategoriesDir)) {
    fs.mkdirSync(uploadCategoriesDir, { recursive: true });
}

// Cấu hình storage cho Excel files
const excelStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadExcelDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'products-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Cấu hình storage cho Category Images
const categoryImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadCategoriesDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, 'category-' + uniqueSuffix + ext);
    }
});

// File filter - chỉ cho phép Excel files
const excelFileFilter = (req, file, cb) => {
    const allowedMimes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
    ];
    
    const allowedExts = ['.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file Excel (.xlsx, .xls)!'), false);
    }
};

// File filter - chỉ cho phép Image files
const imageFileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
    ];
    
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file hình ảnh (.jpg, .jpeg, .png, .gif, .webp)!'), false);
    }
};

// Middleware upload Excel
const uploadExcel = multer({
    storage: excelStorage,
    fileFilter: excelFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // Giới hạn 10MB
    }
}).single('file');

// Middleware upload Category Image
const uploadCategoryImage = multer({
    storage: categoryImageStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
    }
}).single('image');

module.exports = { 
    uploadExcel,
    uploadCategoryImage
};
