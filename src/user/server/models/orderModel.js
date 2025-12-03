const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Guest checkout
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product',
      required: true
    },
    quantity: { 
      type: Number,
      required: true,
      min: 1
    },
    price: { 
      type: Number,
      required: true,
      min: 0
    },
    name: String,
    image: String
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: false }
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    code: String,
    amount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  shipping: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  loyaltyPointsUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  loyaltyDiscount: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Card', 'Banking', 'Bank Transfer', 'Cash on Delivery'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  paidAt: {
    type: Date,
    default: null
  },
  transactionId: {
    type: String,
    default: null
  },
  paymentDetails: {
    transactionId: String,
    transactionContent: String,
    transactionDate: Date,
    amount: Number,
    bankCode: String
  },
  trackingNumber: String,
  notes: String,
  statusHistory: [{
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    note: String
  }]
}, { 
  timestamps: true 
});

// Indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);