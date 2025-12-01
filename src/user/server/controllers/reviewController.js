const Review = require('../models/reviewModel');
const Product = require('../models/productModel');
const asyncHandle = require('express-async-handler');
const AppError = require('../errors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// ============= GET REVIEWS FOR PRODUCT =============
const getReviews = asyncHandle(async (req, res) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError('Invalid product ID', 400);
  }

  // ============= FILTER: Only reviews with comments =============
  const reviewQuery = {
    product: new mongoose.Types.ObjectId(productId),
    comment: { $ne: null, $ne: '' } // Only reviews with actual comments
  };

  const reviews = await Review.find(reviewQuery)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Review.countDocuments(reviewQuery);

  // Calculate rating distribution
  const distribution = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), rating: { $ne: null } } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    }
  ]);

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  distribution.forEach(d => {
    ratingDistribution[d._id] = d.count;
  });

  // Calculate average rating
  const avgResult = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), rating: { $ne: null } } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  const stats = avgResult[0] || { avgRating: 0, totalRatings: 0 };

  return res.status(200).json({
    success: true,
    reviews,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
    stats: {
      averageRating: stats.avgRating ? parseFloat(stats.avgRating.toFixed(1)) : 0,
      totalRatings: stats.totalRatings,
      totalReviews: stats.totalRatings,
      distribution: ratingDistribution
    }
  });
});

// ============= CREATE REVIEW (không cần login) =============
const createReview = asyncHandle(async (req, res) => {
  const { productId } = req.params;
  const { customerName, title, comment, rating } = req.body;

  // Validate
  if (!customerName || !comment) {
    throw new AppError('Please provide name and comment', 400);
  }

  // Validate rating (nếu có)
  if (rating !== undefined && (rating < 1 || rating > 5)) {
    throw new AppError('Rating must be between 1 and 5', 400);
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError('Invalid product ID', 400);
  }

  // Check product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Lấy user từ token (nếu có)
  let userId = null;
  let verified = false;
 
  if (req.headers.authorization) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
      verified = true;
    } catch (err) {
      // Token không hợp lệ → Vẫn cho phép tạo review (không verified)
      console.warn('Invalid token in createReview:', err.message);
    }
  }

  // Create review
  const review = await Review.create({
    product: productId,
    user: userId,
    customerName,
    title: title || '',
    comment,
    rating: rating || null,
    verified
  });

  // Populate user nếu có
  await review.populate('user', 'name email');

  // Update product rating nếu có rating
  if (rating) {
    await updateProductRating(productId);
  }

  // Emit WebSocket event
  const io = req.app.get('io');
  if (io) {
    io.to(`product-${productId}`).emit('newReview', review);
    if (rating) {
      io.to(`product-${productId}`).emit('ratingUpdated', { productId });
    }
  }

  return res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    review
  });
});

// ============= ADD RATING (cần login) =============
const addRating = asyncHandle(async (req, res) => {
  const { productId } = req.params;
  const { rating } = req.body;
  const userId = req.user?._id; // Từ auth middleware

  console.log('📊 addRating called:', { productId, rating, userId });

  if (!userId) {
    throw new AppError('You must be logged in to rate products', 401);
  }

  if (!rating || rating < 1 || rating > 5) {
    throw new AppError('Rating must be between 1 and 5', 400);
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError('Invalid product ID', 400);
  }

// ← THÊM: Check product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Check if user already rated
  const existingRating = await Review.findOne({
    product: productId,
    user: userId,
    rating: { $ne: null }
  });

  if (existingRating) {
    // Update existing rating
    existingRating.rating = rating;
    existingRating.updatedAt = Date.now();
    await existingRating.save();

    // Update product average rating
    await updateProductRating(productId);

    // Emit WebSocket event
    const io = req.app.get('io');
    if (io) {
      io.to(`product-${productId}`).emit('ratingUpdated', { productId });
    }

    return res.status(200).json({
      success: true,
      message: 'Rating updated successfully',
      rating: existingRating
    });
  } else {
    // Create new rating entry
    const newRating = await Review.create({
      product: productId,
      user: userId,
      customerName: req.user.name || 'Anonymous',
      title: '', 
      comment: '',
      rating,
      verified: true
    });

    // Update product average rating
    await updateProductRating(productId);

    // Emit WebSocket event
    const io = req.app.get('io');
    if (io) {
      io.to(`product-${productId}`).emit('ratingUpdated', { productId });
    }

    return res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      rating: newRating
    });
  }
});

// ============= HELPER: Update Product Rating =============
async function updateProductRating(productId) {
  const result = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), rating: { $ne: null } } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: parseFloat(result[0].avgRating.toFixed(1)),
      reviewCount: result[0].count
    });
  }
}

// ============= MARK REVIEW AS HELPFUL =============
const markHelpful = asyncHandle(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findByIdAndUpdate(
    reviewId,
    { $inc: { helpful: 1 } },
    { new: true }
  );

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  // Emit WebSocket event
  const io = req.app.get('io');
  if (io) {
    io.to(`product-${review.product}`).emit('reviewHelpful', { reviewId, helpful: review.helpful });
  }

  return res.status(200).json({
    success: true,
    helpful: review.helpful
  });
});

module.exports = {
  getReviews,
  createReview,
  addRating,
  markHelpful
};