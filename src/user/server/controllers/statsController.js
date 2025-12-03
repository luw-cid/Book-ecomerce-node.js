const asyncHandle = require('express-async-handler');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');

// GET /api/stats/hero - số liệu cho Hero section
const getHeroStats = asyncHandle(async (req, res) => {
  // Đếm số sách đang active
  const totalBooksPromise = Product.countDocuments({ isActive: true });

  // Đếm số user đã đăng ký
  const totalUsersPromise = User.countDocuments({});

  // Tính rating trung bình toàn hệ thống
  const ratingAggPromise = Review.aggregate([
    { $match: { rating: { $ne: null } } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  const [totalBooks, totalUsers, ratingAgg] = await Promise.all([
    totalBooksPromise,
    totalUsersPromise,
    ratingAggPromise,
  ]);

  const avgRating =
    ratingAgg.length > 0 && ratingAgg[0].avgRating
      ? parseFloat(ratingAgg[0].avgRating.toFixed(1))
      : 0;

  return res.status(200).json({
    success: true,
    data: {
      totalBooks,
      totalUsers,
      averageRating: avgRating,
    },
  });
});

module.exports = {
  getHeroStats,
};


