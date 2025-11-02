// services/categoryService.js
const Category = require('../models/categoryModel');

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate slug từ tên category
 */
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

// ==================== CRUD OPERATIONS ====================

/**
 * CREATE - Tạo category mới
 */
const createCategory = async (data) => {
    // Tự động tạo slug nếu không có
    if (!data.slug && data.name) {
        data.slug = generateSlug(data.name);
    }
    
    // Kiểm tra slug đã tồn tại chưa
    const existingCategory = await Category.findOne({ slug: data.slug });
    if (existingCategory) {
        throw new Error('Category với slug này đã tồn tại');
    }
    
    const category = new Category(data);
    return await category.save();
};

/**
 * READ - Lấy danh sách categories (có filter và phân trang)
 */
const getCategories = async ({ filter = {}, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' }) => {
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const categories = await Category.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);
        
    const total = await Category.countDocuments(filter);

    return {
        success: true,
        categories,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
    };
};

/**
 * READ - Lấy tất cả categories (không phân trang - dùng cho dropdown)
 */
const getAllCategories = async () => {
    return await Category.find({ isActive: true })
        .select('_id name slug description image')
        .sort({ name: 1 });
};

/**
 * READ - Lấy chi tiết category theo ID
 */
const getCategoryById = async (categoryId) => {
    const category = await Category.findById(categoryId);
    if (!category) {
        throw new Error('Category không tồn tại');
    }
    return category;
};

/**
 * READ - Lấy category theo slug
 */
const getCategoryBySlug = async (slug) => {
    const category = await Category.findOne({ slug });
    if (!category) {
        throw new Error('Category không tồn tại');
    }
    return category;
};

/**
 * UPDATE - Cập nhật category
 */
const updateCategory = async (categoryId, data) => {
    // Nếu update name, tự động update slug
    if (data.name && !data.slug) {
        data.slug = generateSlug(data.name);
        
        // Kiểm tra slug mới có trùng không (trừ chính nó)
        const existingCategory = await Category.findOne({ 
            slug: data.slug, 
            _id: { $ne: categoryId } 
        });
        if (existingCategory) {
            throw new Error('Category với slug này đã tồn tại');
        }
    }
    
    const category = await Category.findByIdAndUpdate(
        categoryId, 
        data, 
        { new: true, runValidators: true }
    );
    
    if (!category) {
        throw new Error('Category không tồn tại');
    }
    
    return category;
};

/**
 * DELETE - Xóa category (soft delete - set isActive = false)
 */
const deleteCategory = async (categoryId) => {
    const category = await Category.findByIdAndUpdate(
        categoryId,
        { isActive: false },
        { new: true }
    );
    
    if (!category) {
        throw new Error('Category không tồn tại');
    }
    
    return category;
};

/**
 * DELETE - Xóa vĩnh viễn category (hard delete)
 */
const permanentDeleteCategory = async (categoryId) => {
    // Kiểm tra xem có sản phẩm nào đang sử dụng category này không
    const Product = require('../models/productModel');
    const productsCount = await Product.countDocuments({ category: categoryId });
    
    if (productsCount > 0) {
        throw new Error(`Không thể xóa category này vì có ${productsCount} sản phẩm đang sử dụng`);
    }
    
    const category = await Category.findByIdAndDelete(categoryId);
    
    if (!category) {
        throw new Error('Category không tồn tại');
    }
    
    return category;
};

/**
 * RESTORE - Khôi phục category đã bị soft delete
 */
const restoreCategory = async (categoryId) => {
    const category = await Category.findByIdAndUpdate(
        categoryId,
        { isActive: true },
        { new: true }
    );
    
    if (!category) {
        throw new Error('Category không tồn tại');
    }
    
    return category;
};

/**
 * SEARCH - Tìm kiếm category theo keyword
 */
const searchCategories = async (keyword, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const filter = {
        $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } },
        ]
    };

    const categories = await Category.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    const total = await Category.countDocuments(filter);

    return {
        success: true,
        categories,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
        keyword
    };
};

/**
 * COUNT - Đếm số lượng sản phẩm trong mỗi category
 */
const getCategoriesWithProductCount = async () => {
    const Product = require('../models/productModel');
    
    const categories = await Category.find({ isActive: true });
    
    const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
            const productCount = await Product.countDocuments({ 
                category: category._id,
                isActive: true 
            });
            
            return {
                _id: category._id,
                name: category.name,
                slug: category.slug,
                description: category.description,
                image: category.image,
                isActive: category.isActive,
                productCount,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt
            };
        })
    );
    
    return categoriesWithCount;
};

module.exports = {
    createCategory,
    getCategories,
    getAllCategories,
    getCategoryById,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
    permanentDeleteCategory,
    restoreCategory,
    searchCategories,
    getCategoriesWithProductCount
};
