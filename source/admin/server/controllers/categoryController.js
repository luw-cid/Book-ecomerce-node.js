// controllers/categoryController.js
const categoryService = require('../services/categoryService');

/**
 * CREATE - Tạo category mới
 * POST /categories
 */
const createCategory = async (req, res, next) => {
    try {
        const category = await categoryService.createCategory(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Tạo category thành công',
            category
        });
    } catch (error) {
        console.error('Error in createCategory:', error);
        next(error);
    }
};

/**
 * READ - Lấy danh sách categories (có phân trang và filter)
 * GET /categories?page=1&limit=10&sortBy=createdAt&sortOrder=desc&isActive=true
 */
const getCategories = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', isActive } = req.query;
        
        // Build filter
        const filter = {};
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }
        
        const result = await categoryService.getCategories({
            filter,
            page: Number(page),
            limit: Number(limit),
            sortBy,
            sortOrder
        });
        
        res.json(result);
    } catch (error) {
        console.error('Error in getCategories:', error);
        next(error);
    }
};

/**
 * READ - Lấy tất cả categories (không phân trang - dùng cho dropdown)
 * GET /categories/all
 */
const getAllCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getAllCategories();
        
        res.json({
            success: true,
            categories,
            total: categories.length
        });
    } catch (error) {
        console.error('Error in getAllCategories:', error);
        next(error);
    }
};

/**
 * READ - Lấy categories kèm số lượng sản phẩm
 * GET /categories/with-count
 */
const getCategoriesWithProductCount = async (req, res, next) => {
    try {
        const categories = await categoryService.getCategoriesWithProductCount();
        
        res.json({
            success: true,
            categories,
            total: categories.length
        });
    } catch (error) {
        console.error('Error in getCategoriesWithProductCount:', error);
        next(error);
    }
};

/**
 * READ - Lấy chi tiết category theo ID
 * GET /categories/:id
 */
const getCategoryById = async (req, res, next) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);
        
        res.json({
            success: true,
            category
        });
    } catch (error) {
        console.error('Error in getCategoryById:', error);
        next(error);
    }
};

/**
 * READ - Lấy category theo slug
 * GET /categories/slug/:slug
 */
const getCategoryBySlug = async (req, res, next) => {
    try {
        const category = await categoryService.getCategoryBySlug(req.params.slug);
        
        res.json({
            success: true,
            category
        });
    } catch (error) {
        console.error('Error in getCategoryBySlug:', error);
        next(error);
    }
};

/**
 * UPDATE - Cập nhật category
 * PUT /categories/:id
 */
const updateCategory = async (req, res, next) => {
    try {
        const category = await categoryService.updateCategory(req.params.id, req.body);
        
        res.json({
            success: true,
            message: 'Cập nhật category thành công',
            category
        });
    } catch (error) {
        console.error('Error in updateCategory:', error);
        next(error);
    }
};

/**
 * DELETE - Xóa category (soft delete)
 * DELETE /categories/:id
 */
const deleteCategory = async (req, res, next) => {
    try {
        const category = await categoryService.deleteCategory(req.params.id);
        
        res.json({
            success: true,
            message: 'Xóa category thành công',
            category
        });
    } catch (error) {
        console.error('Error in deleteCategory:', error);
        next(error);
    }
};

/**
 * DELETE - Xóa vĩnh viễn category (hard delete)
 * DELETE /categories/:id/permanent
 */
const permanentDeleteCategory = async (req, res, next) => {
    try {
        const category = await categoryService.permanentDeleteCategory(req.params.id);
        
        res.json({
            success: true,
            message: 'Xóa vĩnh viễn category thành công',
            category
        });
    } catch (error) {
        console.error('Error in permanentDeleteCategory:', error);
        next(error);
    }
};

/**
 * RESTORE - Khôi phục category
 * PATCH /categories/:id/restore
 */
const restoreCategory = async (req, res, next) => {
    try {
        const category = await categoryService.restoreCategory(req.params.id);
        
        res.json({
            success: true,
            message: 'Khôi phục category thành công',
            category
        });
    } catch (error) {
        console.error('Error in restoreCategory:', error);
        next(error);
    }
};

/**
 * SEARCH - Tìm kiếm categories
 * GET /categories/search?keyword=sach&page=1&limit=10
 */
const searchCategories = async (req, res, next) => {
    try {
        const { keyword, page = 1, limit = 10 } = req.query;
        
        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp từ khóa tìm kiếm'
            });
        }
        
        const result = await categoryService.searchCategories(keyword, Number(page), Number(limit));
        
        res.json(result);
    } catch (error) {
        console.error('Error in searchCategories:', error);
        next(error);
    }
};

module.exports = {
    createCategory,
    getCategories,
    getAllCategories,
    getCategoriesWithProductCount,
    getCategoryById,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
    permanentDeleteCategory,
    restoreCategory,
    searchCategories
};
