const User = require('../models/userModel');

// Tier thresholds
const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 1000,
  gold: 5000,
  platinum: 10000
};

// Earn rate: 10% of order total
const EARN_RATE = 0.10;

/**
 * Calculate tier based on lifetime points
 */
const calculateTier = (lifetimePoints) => {
  if (lifetimePoints >= TIER_THRESHOLDS.platinum) return 'platinum';
  if (lifetimePoints >= TIER_THRESHOLDS.gold) return 'gold';
  if (lifetimePoints >= TIER_THRESHOLDS.silver) return 'silver';
  return 'bronze';
};

/**
 * Get loyalty account (for CartPage display)
 */
const getLoyaltyAccount = async (userId) => {
  const user = await User.findById(userId).select('loyalty');
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return {
    userId: user._id,
    totalPoints: user.loyalty.points,
    tier: user.loyalty.tier
  };
};

/**
 * Earn points from order (auto-called after order success)
 */
const earnPointsFromOrder = async (userId, orderTotal) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const pointsEarned = Math.floor(orderTotal * EARN_RATE);
  
  user.loyalty.points += pointsEarned;
  user.loyalty.lifetimePoints += pointsEarned;
  user.loyalty.tier = calculateTier(user.loyalty.lifetimePoints);
  user.loyalty.lastEarnedAt = new Date();
  
  await user.save();
  
  return {
    pointsEarned,
    newBalance: user.loyalty.points,
    tier: user.loyalty.tier
  };
};

/**
 * Redeem points (called during checkout)
 */
const redeemPoints = async (userId, pointsToRedeem) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (pointsToRedeem > user.loyalty.points) {
    throw new Error('Insufficient loyalty points');
  }
  
  user.loyalty.points -= pointsToRedeem;
  user.loyalty.lastRedeemedAt = new Date();
  
  await user.save();
  
  return {
    pointsRedeemed: pointsToRedeem,
    discountAmount: pointsToRedeem, // 1 point = $1
    newBalance: user.loyalty.points
  };
};

module.exports = {
  getLoyaltyAccount,
  earnPointsFromOrder,
  redeemPoints
};
