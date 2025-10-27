const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const asyncHandle = require('express-async-handler');
const authMiddleware = require('../middlewares/authMiddleware');

// Tất cả routes đều cần authentication
router.use(authMiddleware);

// ==================== CART ROUTES ====================
// GET /cart - Lấy giỏ hàng của user
router.get('/', asyncHandle(cartController.getCart));

// GET /cart/count - Lấy số lượng items trong giỏ hàng
router.get('/count', asyncHandle(cartController.getCartCount));

// POST /cart/add - Thêm sản phẩm vào giỏ hàng
router.post('/add', asyncHandle(cartController.addToCart));

// PUT /cart/item/:itemId - Cập nhật số lượng sản phẩm trong giỏ
router.put('/item/:itemId', asyncHandle(cartController.updateCartItem));

// DELETE /cart/remove/:itemId - Xóa sản phẩm khỏi giỏ hàng
router.delete('/remove/:itemId', asyncHandle(cartController.removeFromCart));

// DELETE /cart/clear - Xóa toàn bộ giỏ hàng
router.delete('/clear', asyncHandle(cartController.clearCart));

module.exports = router;
