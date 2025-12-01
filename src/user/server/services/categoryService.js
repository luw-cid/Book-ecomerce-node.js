const categoryModel = require('../models/categoryModel');
const productModel = require('../models/productModel');

const getAllCategories = async () => {
    const categories = await categoryModel.find({ isActive: true}).sort({ name: 1}).select('-__v');
    
    // Thêm productCount cho mỗi category (dùng aggregate để tối ưu hiệu suất)
    const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
            const productCount = await productModel.countDocuments({ 
                category: category._id,
                // isActive: true 
            });
            return {
                ...category.toObject(),
                productCount
            };
        })
    );
    
    return categoriesWithCount;
}

const getCategoryById = async (categoryId) => {
    const category = await categoryModel.findById(categoryId).select('-__v');
    if (!category) throw new Error('Category not found');
    return category;
}

const getCategoryBySlug = async (slug) => {
    const category = await categoryModel.findOne({ slug, isActive: true}).select('-__v');
    if (!category) throw new Error('Category not found');
    return category;
}

// Helper function: Tạo slug từ tên
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

module.exports = {
    getAllCategories, 
    getCategoryById,
    getCategoryBySlug,
    generateSlug
}