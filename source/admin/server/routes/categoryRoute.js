// routes/categoryRoute.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const { adminMiddleware } = require('../middlewares/roleMiddleware');
const { uploadCategoryImage } = require('../middlewares/uploadMiddleware');

// ==================== PUBLIC ROUTES ====================

// Lấy tất cả categories (không phân trang - dùng cho dropdown)
router.get('/all', categoryController.getAllCategories);

// Lấy category theo slug
router.get('/slug/:slug', categoryController.getCategoryBySlug);

// Tìm kiếm categories
router.get('/search', categoryController.searchCategories);

// Lấy categories kèm số lượng sản phẩm
router.get('/with-count', categoryController.getCategoriesWithProductCount);

// Lấy danh sách categories (có phân trang)
router.get('/', categoryController.getCategories);

// Lấy chi tiết category theo ID
router.get('/:id', categoryController.getCategoryById);

// ==================== PROTECTED ROUTES (ADMIN ONLY) ====================

// Upload category image (chỉ admin)
router.post('/upload-image',
    authMiddleware,
    adminMiddleware,
    uploadCategoryImage,
    (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng chọn file hình ảnh'
                });
            }

            const imageUrl = `/uploads/images/categories/${req.file.filename}`;
            
            res.json({
                success: true,
                message: 'Upload hình ảnh thành công',
                imageUrl: imageUrl,
                filename: req.file.filename
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi upload hình ảnh'
            });
        }
    }
);

// Tạo category mới (chỉ admin)
router.post('/', 
    authMiddleware, 
    adminMiddleware, 
    categoryController.createCategory
);

// Cập nhật category (chỉ admin)
router.put('/:id', 
    authMiddleware, 
    adminMiddleware, 
    categoryController.updateCategory
);

// Xóa category - soft delete (chỉ admin)
router.delete('/:id', 
    authMiddleware, 
    adminMiddleware, 
    categoryController.deleteCategory
);

// Xóa vĩnh viễn category - hard delete (chỉ admin)
router.delete('/:id/permanent', 
    authMiddleware, 
    adminMiddleware, 
    categoryController.permanentDeleteCategory
);

// Khôi phục category (chỉ admin)
router.patch('/:id/restore', 
    authMiddleware, 
    adminMiddleware, 
    categoryController.restoreCategory
);

module.exports = router;
