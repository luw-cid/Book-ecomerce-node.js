const loyaltyService = require('../services/loyaltyService');
const AppError = require('../errors');

/**
 * Get loyalty account (for CartPage)
 * GET /api/loyalty/account
 */
const getLoyaltyAccount = async (req, res) => {
  const userId = req.user?._id;
  
  if (!userId) {
    throw new AppError('Authentication required', 401);
  }
  
  const account = await loyaltyService.getLoyaltyAccount(userId);
  
  res.status(200).json({
    success: true,
    account
  });
};

/**
 * Redeem points (called during checkout)
 * POST /api/loyalty/redeem
 * Body: { points: number }
 */
const redeemPoints = async (req, res) => {
  const userId = req.user?._id;
  const { points } = req.body;
  
  if (!userId) {
    throw new AppError('Authentication required', 401);
  }
  
  if (!points || points <= 0) {
    throw new AppError('Invalid points amount', 400);
  }
  
  const result = await loyaltyService.redeemPoints(userId, points);
  
  res.status(200).json({
    success: true,
    message: 'Points redeemed successfully',
    data: result
  });
};

module.exports = {
  getLoyaltyAccount,
  redeemPoints
};
