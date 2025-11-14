const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// All routes require admin authentication
router.use(authMiddleware);


router.get('/stats', customerController.getCustomerStats)
router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.put('/:id', customerController.updateCustomer);
router.put('/:id/loyalty', customerController.updateLoyaltyPoints);
router.put('/:id/tier', customerController.updateCustomerTier);
router.get('/:id/orders', customerController.getCustomerOrders);
router.post('/:id/reset-password', customerController.resetCustomerPassword);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
