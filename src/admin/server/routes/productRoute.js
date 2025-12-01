// routes/productRoute.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { adminMiddleware } = require('../middlewares/roleMiddleware');
const { uploadExcel } = require('../middlewares/uploadMiddleware');

// ==================== PROTECTED ROUTES (ADMIN ONLY) ====================
// Apply auth + admin middleware to all routes
router.use(authMiddleware, adminMiddleware);

// Search products - ĐẶT TRƯỚC /:id
router.get('/search', productController.searchProducts);

// Export/Import routes
router.get('/export', productController.exportProducts);
router.post('/import', productController.importProducts);
router.post('/import-excel', uploadExcel, productController.importProductsFromExcel);

// CRUD routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
