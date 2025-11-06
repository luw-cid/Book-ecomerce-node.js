const productService = require("../services/productService");
const asyncHandle = require('express-async-handler');
const AppError = require('../errors');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const mongoose = require('mongoose');

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
    if (isNew !== undefined) filter.newProduct = isNew === 'true'; // Changed: isNew → newProduct
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

// Tìm kiếm nâng cao
const advancedSearch = asyncHandle(async(req, res) => {
    const {
        keyword,
        category,
        author,
        publisher,
        minPrice,
        maxPrice,
        minRating,
        tags,
        newProduct,
        isBestseller,
        isFlashSale,
        inStock,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 10
    } = req.query;

    const searchParams = {
        keyword,
        category,
        author,
        publisher,
        minPrice: minPrice ? Number(minPrice) : null,
        maxPrice: maxPrice ? Number(maxPrice) : null,
        minRating: minRating ? Number(minRating) : null,
        tags: tags ? tags.split(',') : [],
        newProduct: newProduct === 'true' ? true : newProduct === 'false' ? false : null,
        isBestseller: isBestseller === 'true' ? true : isBestseller === 'false' ? false : null,
        isFlashSale: isFlashSale === 'true' ? true : isFlashSale === 'false' ? false : null,
        inStock: inStock === 'true' ? true : inStock === 'false' ? false : null,
        sortBy,
        sortOrder,
        page: Number(page),
        limit: Number(limit)
    };

    const result = await productService.advancedSearch(searchParams);
    res.status(200).json({
        success: true,
        ...result
    });
});

// Gợi ý tìm kiếm
const searchSuggestions = asyncHandle(async(req, res) => {
    const { keyword, limit = 5 } = req.query;
    
    if (!keyword || keyword.trim() === '') {
        return res.status(200).json({
            success: true,
            suggestions: []
        });
    }

    const suggestions = await productService.searchSuggestions(keyword, Number(limit));
    res.status(200).json({
        success: true,
        count: suggestions.length,
        suggestions
    });
});

// Lấy sản phẩm liên quan
const getRelatedProducts = asyncHandle(async(req, res) => {
    const { id } = req.params;
    const limit = Number(req.query.limit) || 4;

    const relatedProducts = await productService.getRelatedProducts(id, limit);
    res.status(200).json({
        success: true,
        count: relatedProducts.length,
        products: relatedProducts
    });
});

// Lấy sản phẩm theo khoảng giá
const getProductsByPriceRange = asyncHandle(async(req, res) => {
    const { minPrice, maxPrice, limit = 10 } = req.query;

    if (!minPrice || !maxPrice) {
        throw new AppError('minPrice và maxPrice là bắt buộc', 400);
    }

    const products = await productService.getProductsByPriceRange(
        Number(minPrice),
        Number(maxPrice),
        Number(limit)
    );

    res.status(200).json({
        success: true,
        count: products.length,
        products
    });
});

// Thêm hàm lấy range giá
const getPriceRange = asyncHandle(async (req, res) => {
  const { category } = req.query;
  const filter = { isActive: true };

  if (category) {
    // Nếu category là ObjectId hợp lệ -> dùng trực tiếp
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.category = mongoose.Types.ObjectId(category);
    } else {
      // Nếu category là tên -> tìm Category và dùng _id
      const catDoc = await Category.findOne({ name: category });
      if (!catDoc) {
        return res.status(200).json({ minPrice: 0, maxPrice: 0 });
      }
      filter.category = catDoc._id;
    }
  }

  const result = await Product.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" }
      }
    }
  ]);

  return res.status(200).json(result[0] || { minPrice: 0, maxPrice: 100 });
});

module.exports = {
    getProducts,
    getProductById,
    searchProducts,
    getNewProducts,
    getBestSellerProducts,
    getFlashSaleProducts,
    getPriceRange,
    advancedSearch,
    searchSuggestions,
    getRelatedProducts,
    getProductsByPriceRange
}