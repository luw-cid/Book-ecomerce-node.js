const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null nếu comment không cần đăng nhập
  },
  
  // Review content (không cần đăng nhập)
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: false,
    trim: true
  },
  comment: {
    type: String,
    required: false,
    trim: true
  },
  
  // Rating (cần đăng nhập)
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  
  // Metadata
  helpful: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index để query nhanh
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });

// Virtual cho formattedDate
reviewSchema.virtual('date').get(function() {
  return this.createdAt;
});

module.exports = mongoose.model('Review', reviewSchema);