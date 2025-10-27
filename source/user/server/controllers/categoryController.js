const AppError = require('../errors');
const categoryService = require('../services/categoryService');

const getAllCategories = async (req, res) => {
    const categories = await categoryService.getAllCategories();
    res.status(200).json({
        success: true,
        count: categories.length,
        categories
    });
};

const getCategoryById = async (req, res) => {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) throw new AppError("Category not found!", 404);
    res.status(200).json({success: true, category});
};

const getCategoryBySlug = async (req, res) => {
    const category = await categoryService.getCategoryBySlug(req.params.slug);
    if (!category) throw new AppError('Category not found!', 404);
    res.status(200).json({success: true, category});
};

module.exports = {
    getAllCategories,
    getCategoryById,
    getCategoryBySlug
}