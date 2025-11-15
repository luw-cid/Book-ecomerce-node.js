const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authMiddleware, authenticate } = require('../middlewares/authMiddleware');

// Public routes (không cần login)
router.get('/:productId', reviewController.getReviews);
router.post('/:productId/review', reviewController.createReview);
router.post('/:reviewId/helpful', reviewController.markHelpful);

// Protected routes (cần login)
router.post('/:productId/rating', authenticate, reviewController.addRating);

module.exports = router;