const express = require('express');
const loyaltyController = require('../controllers/loyaltyController');
// const asyncHandle = require('express-async-handler');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Core customer loyalty routes
router.get('/account', loyaltyController.getLoyaltyAccount);
router.post('/points', loyaltyController.earnPointsFromOrder);
router.post('/redeem', loyaltyController.redeemPoints);

module.exports = router;
