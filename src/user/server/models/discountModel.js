const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  description: { type: String, default: ''},
  
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  
  percentage: { 
    type: Number, 
    min: 0, 
    max: 100,
    required: function() {
      return this.discountType === 'percentage';
    }
  },
  
  fixedAmount: {
    type: Number,
    min: 0,
    required: function() {
      return this.discountType === 'fixed';
    }
  },
  maxDiscountAmount: {type: Number, default: null}, // Ví dụ: Giảm 20% nhưng tối đa $50
  minOrderAmount: { type: Number, default: 0},      // Đơn hàng tối thiểu để apply discount
  usageLimit: { type: Number, default: null },      // Null = unlimited uses
  usageCount: { type: Number, default: 0},          // Số lần đã dùng
  perUserLimit: { type: Number, default: 1},        // Mỗi user chỉ dùng đc 1 lần
  startAt: { type: Date, default: Date.now},
  expiresAt: { type: Date, required: true},

  // Applicable condition
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],  // Nếu empty = apply cho tất cả categories
  
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }], // Nếu empty = apply cho tất cả products

  excludedCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],

  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],

  // ✅ User Restrictions
  applicableUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }], // Nếu empty = apply cho tất cả users

  firstTimeOnly: {
    type: Boolean,
    default: false // Chỉ cho khách hàng mua lần đầu
  },

  // ✅ Status & Display
  isActive: {
    type: Boolean,
    default: true
  },

  isPublic: {
    type: Boolean,
    default: true // False = discount code riêng (VIP, referral)
  },

  displayOnHomepage: {
    type: Boolean,
    default: false
  },

  // ✅ Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin tạo discount
  },

  notes: {
    type: String // Internal notes cho admin
  }
}, { timestamps: true });

discountSchema.index({ code: 1 });
discountSchema.index({ isActive: 1, expiresAt: 1 });
discountSchema.index({ startAt: 1, expiresAt: 1 });

module.exports = mongoose.model("Discount", discountSchema);
