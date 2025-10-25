const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/search', productController.searchProducts);           
router.get('/new', productController.getNewProducts);            
router.get('/bestseller', productController.getBestSellerProducts); 
router.get('/flash-sale', productController.getFlashSaleProducts); 
router.get('/:id', productController.getProductById);             
router.get('/', productController.getProducts);                  

module.exports = router;