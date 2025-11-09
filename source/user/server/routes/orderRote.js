const express = require('express');
const router = express.Router();
const asyncHandle = require('express-async-handler');
const orderController = require('../controllers/orderControler');

router.post('/', asyncHandle(orderController.createOrder));
router.get('/my-orders', asyncHandle(orderController.getUserOrders));
router.get('/stats', asyncHandle(orderController.getUserOrderStats));
router.get('/:id', asyncHandle(orderController.getOrderById));
router.patch('/:id/cancel', asyncHandle(orderController.cancelOrder));

module.exports = router;
