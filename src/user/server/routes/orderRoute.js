const express = require('express');
const router = express.Router();
const asyncHandle = require('express-async-handler');
const orderController = require('../controllers/orderControler');
const { authMiddleware } = require('../middlewares/authMiddleware');

// POST / - Create order (cho phép guest checkout, không bắt buộc auth)
router.post('/', asyncHandle(orderController.createOrder));

// Các routes sau đây cần authentication
router.get('/my-orders', authMiddleware, asyncHandle(orderController.getUserOrders));
router.get('/stats', authMiddleware, asyncHandle(orderController.getUserOrderStats));
router.get('/:id', authMiddleware, asyncHandle(orderController.getOrderById));
router.patch('/:id/cancel', authMiddleware, asyncHandle(orderController.cancelOrder));

module.exports = router;
