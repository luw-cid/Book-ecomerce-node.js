const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// ==================== SEARCH ROUTES (phải đặt TRƯỚC các route có params) ====================
router.get('/search', productController.searchProducts);           
router.get('/search/suggestions', productController.searchSuggestions);
router.get('/search/advanced', productController.advancedSearch);

// ==================== SPECIAL ROUTES ====================
router.get('/brands', productController.getBrands);
// router.get('/price-range', productController.getProductsByPriceRange);
router.get('/price-range', productController.getPriceRange);
router.get('/new', productController.getNewProducts);            
router.get('/bestseller', productController.getBestSellerProducts); 
router.get('/flash-sale', productController.getFlashSaleProducts);
router.get('/related/:id', productController.getRelatedProducts);

// ==================== GENERAL ROUTES ====================
router.get('/:id', productController.getProductById);             
router.get('/', productController.getProducts);                  

module.exports = router;