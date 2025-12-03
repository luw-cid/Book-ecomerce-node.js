const express = require('express');
const discountController = require('../controllers/discountController');
const asyncHandle = require('express-async-handler');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Các route cần biết user hiện tại (để check perUserLimit, firstTimeOnly, ...)
router.post('/apply', authMiddleware, asyncHandle(discountController.applyDiscount));
router.get('/validate/:code', authMiddleware, asyncHandle(discountController.validateDiscountCode));

// Các route public (không cần đăng nhập)
router.get('/public', asyncHandle(discountController.getPublicDiscounts));
router.get('/active', asyncHandle(discountController.getDiscounts));

module.exports = router;