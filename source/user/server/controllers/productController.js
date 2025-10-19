const productService = require("../services/productService");
const asyncHandle = require('express-async-handler');
const AppError = require('../errors');

// Lấy danh sách sản phẩm với các tùy chọn lọc, tìm kiếm và sắp xếp
const getProducts = asyncHandle(async (req, res) => {
    // Lấy tất cả các tham số từ query string
    const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search = '',
        category,
        tags,
        isNew,
        isBestseller,
        isFlashSale,
        minPrice,
        maxPrice
    } = req.query;

    // Xây dựng object filter
    const filter = {};
    if (category) filter.category = category;
    if (tags) filter.tags = tags.split(',');
    if (isNew !== undefined) filter.isNew = isNew === 'true';
    if (isBestseller !== undefined) filter.isBestseller = isBestseller === 'true';
    if (isFlashSale !== undefined) filter.isFlashSale = isFlashSale === 'true';

    // Xây dựng object priceRange
    const priceRange = {};
    if (minPrice !== undefined) priceRange.min = Number(minPrice);
    if (maxPrice !== undefined) priceRange.max = Number(maxPrice);

    // Gọi service với các tham số đã xử lý
    const result = await productService.getProducts({
        filter,
        searchQuery: search,
        sortBy,
        sortOrder,
        page: Number(page),
        limit: Number(limit),
        priceRange
    });
    if(!result) throw new AppError("Không tìm thấy sản phẩm!", 404);
    res.status(200).json(result);
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
    if(!result) throw new AppError("Không tìm thấy sản phẩm!", 404);
    res.status(201).json(result);
})

const getNewProducts = asyncHandle(async(req, res) => {
    const limit = Number(req.query.limit) || 10;
    const result = await productService.getNewProducts(limit);
    if(!result) throw new AppError("Không tìm thấy sản phẩm!", 404);   
    res.status(201).json(result);
})

const getBestSellerProducts = asyncHandle(async(req, res) => {
    const limit = Number(req.query.limit) || 10;
    const result = await productService.getBestSellerProducts(limit);
    if(!result) throw new AppError("Không tìm thấy sản phẩm!", 404);
    res.status(201).json(result);
})

const getFlashSaleProducts = asyncHandle(async(req, res) => {
    const limit = Number(req.query.limit) || 10;
    const result = await productService.getFlashSaleProducts(limit);
    if(!result) throw new AppError("Không tìm thấy sản phẩm!", 404);
    res.status(201).json(result);
})


module.exports = {
    getProducts,
    getProductById,
    searchProducts,
    getNewProducts,
    getBestSellerProducts,
    getFlashSaleProducts,
}