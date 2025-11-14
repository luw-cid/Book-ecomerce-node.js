const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware } = require("../middlewares/authMiddleware");

router.use(authMiddleware);
router.get('/', orderController.getOrders);
router.get('/stats', orderController.getOrderStats);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', orderController.updateOrderStatus);
router.put('/:id/cancel', orderController.cancelOrder);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;