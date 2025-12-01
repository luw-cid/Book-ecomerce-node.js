const express = require('express');
const discountController = require('../controllers/discountController');
const asyncHandle = require('express-async-handler');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { adminMiddleware } = require('../middlewares/roleMiddleware');

const router = express.Router();

// ==================== PROTECTED ROUTES (ADMIN ONLY) ====================
// Protect all routes with admin authentication
router.use(authMiddleware, adminMiddleware);

// GET /admin/discounts - Get all discounts with filters
router.get('/', asyncHandle(discountController.getAllDiscounts));

// GET /admin/discounts/:id/stats - Get discount statistics
router.get('/:id/stats', asyncHandle(discountController.getDiscountStats));

// GET /admin/discounts/:id - Get discount by ID
router.get('/:id', asyncHandle(discountController.getDiscountById));

// POST /admin/discounts - Create new discount
router.post('/', asyncHandle(discountController.createDiscount));

// PUT /admin/discounts/:id - Update discount
router.put('/:id', asyncHandle(discountController.updateDiscount));

// PATCH /admin/discounts/:id/toggle - Toggle discount status
router.patch('/:id/toggle', asyncHandle(discountController.toggleDiscountStatus));

// DELETE /admin/discounts/:id - Delete discount
router.delete('/:id', asyncHandle(discountController.deleteDiscount));

module.exports = router;
