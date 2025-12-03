// controllers/productController.js
const asyncHandle = require('express-async-handler');
const productService = require('../services/productService');
const AppError = require('../errors');

// ==================== CRUD OPERATIONS ====================

// CREATE - Tạo sản phẩm mới
const createProduct = asyncHandle(async (req, res) => {
    const product = await productService.createProduct(req.body);
    res.status(201).json({
        success: true,
        message: 'Product creted successfully!',
        product
    });
});

// READ - Lấy danh sách sản phẩm
const getProducts = asyncHandle(async (req, res) => {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter từ query params
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.newProduct !== undefined) filter.newProduct = req.query.newProduct === 'true';
    if (req.query.isBestseller !== undefined) filter.isBestseller = req.query.isBestseller === 'true';
    if (req.query.isFlashSale !== undefined) filter.isFlashSale = req.query.isFlashSale === 'true';
    
    // Thêm search support
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { author: { $regex: search, $options: 'i' } },
            { publisher: { $regex: search, $options: 'i' } }
        ];
    }
    
    try {
        const result = await productService.getProducts({
            filter,
            page: Number(page),
            limit: Number(limit),
            sortBy,
            sortOrder
        });
    
        console.log('Products fetched successfully:', result.products.length);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in getProducts:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching products'
        });
    }
});

// READ - Lấy chi tiết sản phẩm theo ID
const getProductById = asyncHandle(async (req, res) => {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
        throw new AppError('Product not found!', 404);
    }
    res.status(200).json({
        success: true,
        product
    });
});

// UPDATE - Cập nhật sản phẩm
const updateProduct = asyncHandle(async (req, res) => {
    const updatedProduct = await productService.updateProduct(req.params.id, req.body);
    if (!updatedProduct) {
        throw new AppError('Product not found!', 404);
    }
    res.status(200).json({
        success: true,
        message: 'Update product successfully!',
        product: updatedProduct
    });
});

// DELETE - Xóa sản phẩm (hard delete - xóa thật sự khỏi database)
const deleteProduct = asyncHandle(async (req, res) => {
    try {
        const deletedProduct = await productService.deleteProduct(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully!',
            product: deletedProduct
        });
    } catch (error) {
        // Nếu lỗi là do sản phẩm đang được sử dụng trong orders
        if (error.message.includes('Cannot delete product') || error.message.includes('is being used in')) {
            throw new AppError(error.message, 400);
        }
        // Nếu lỗi là do không tìm thấy sản phẩm
        if (error.message === 'Product not found') {
            throw new AppError('Product not found!', 404);
        }
        // Các lỗi khác
        throw error;
    }
});

// SEARCH - Tìm kiếm sản phẩm
const searchProducts = asyncHandle(async (req, res) => {
    const { keyword = '', page = 1, limit = 10 } = req.query;
    
    if (!keyword.trim()) {
        throw new AppError('Please enter search keywords!', 400);
    }
    
    const result = await productService.searchProducts(keyword, Number(page), Number(limit));
    res.status(200).json(result);
});

// EXPORT - Xuất tất cả sản phẩm ra Excel
const exportProducts = asyncHandle(async (req, res) => {
    const buffer = await productService.exportProductsToExcel();
    
    const filename = `products_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
});

// IMPORT - Nhập nhiều sản phẩm từ JSON
const importProducts = asyncHandle(async (req, res) => {
    const { products } = req.body;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
        throw new AppError('Dữ liệu không hợp lệ! Vui lòng gửi mảng products.', 400);
    }
    
    const result = await productService.importProductsFromJSON(products);
    res.status(201).json(result);
});

// IMPORT - Nhập nhiều sản phẩm từ file Excel
const importProductsFromExcel = asyncHandle(async (req, res) => {
    if (!req.file) {
        throw new AppError('Please upload file Excel!', 400);
    }
    
    const result = await productService.importProductsFromExcel(req.file.path);
    
    // Xóa file sau khi import xong
    const fs = require('fs');
    fs.unlinkSync(req.file.path);
    
    res.status(201).json(result);
});

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProducts,
    exportProducts,
    importProducts,
    importProductsFromExcel
};