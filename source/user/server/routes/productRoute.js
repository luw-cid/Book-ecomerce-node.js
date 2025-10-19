const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Public routes
router.get('/', productController.getProducts); // Lấy danh sách sản phẩm với filter
router.get('/search', productController.searchProducts); // Tìm kiếm sản phẩm
router.get('/:id', productController.getProductById); // Lấy chi tiết sản phẩm
router.get('/best-seller', productController.getBestSellerProducts)
router.get('/new-products', productController.getNewProducts);
router.get('/flash-sale', productController.getFlashSaleProducts);

module.exports = router;