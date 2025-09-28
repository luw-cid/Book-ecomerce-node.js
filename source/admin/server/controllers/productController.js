const productService = require('../services/productService');
import asyncHandle from 'express-async-handler';
const AppError = require('../errors');

// Tạo sản phẩm mới
const createProduct = asyncHandle(async (req, res) => {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);

});

// Lấy danh sách sản phẩm (có filter và phân trang)
const getProducts = asyncHandle(async (req, res) => {
    const { page = 1, limit = 10, ...filter } = req.query;
    const result = await productService.getProducts({
        filter,
        page: Number(page),
        limit : Number(limit)
    });
    res.status(201).json(result);
});

// Lấy chi tiết sản phẩm theo ID
const getProductById = asyncHandle(async(req, res) => {
    const product = await productService.getProductById(req.params.id);
    if(!product) throw new AppError("Không tìm thấy sản phẩm", 404);
    res.status(201).json(product);
});

// Lấy chi tiết sản phẩm theo ID
const searchProducts = asyncHandle(async (req, res) => {
    const { keyword = "", page = 1, limit = 10} = req.query;
    const result = await productService.searchProducts(keyword, Number(page), Number(limit));
    res.status(201).json(result);
})

// Cập nhật sản phẩm
const updateProduct = asyncHandle(async(req, res) => {
    const updatedProduct = await productService.updateProduct(req.params.id);
    if(!updatedProduct) throw new AppError("Sản phẩm không tồn tại!", 404);
    res.status(201).json(updatedProduct);
});

// Xóa sản phẩm
const deleteProduct = asyncHandle(async(req, res) => {
    const deletedProduct = await productService.deleteProduct(req.params.id);
    if(!deletedProduct) throw new AppError("Sản phẩm không tồn tại!", 404);
    res.status(201).json(deletedProduct);
}); 

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    searchProducts,
    updateProduct,
    deleteProduct,
    
}