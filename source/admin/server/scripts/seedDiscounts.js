require('dotenv').config();
const mongoose = require('mongoose');
const Discount = require('../models/discountModel');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const sampleDiscounts = [
  {
    code: 'SUMMER2024',
    name: 'Summer Sale',
    description: 'Get 20% off on all books',
    discountType: 'percentage',
    percentage: 20,
    minOrderAmount: 30,
    maxDiscountAmount: 50,
    usageLimit: 100,
    perUserLimit: 1,
    startAt: new Date(),
    expiresAt: new Date('2025-12-31'),
    isActive: true,
    isPublic: true,
    displayOnHomepage: true
  },
  {
    code: 'WELCOME10',
    name: 'Welcome Discount',
    description: 'New customer special offer - $10 off',
    discountType: 'fixed',
    fixedAmount: 10,
    minOrderAmount: 50,
    usageLimit: 50,
    perUserLimit: 1,
    firstTimeOnly: true,
    startAt: new Date(),
    expiresAt: new Date('2025-12-31'),
    isActive: true,
    isPublic: true,
    displayOnHomepage: true
  },
  {
    code: 'FREESHIP',
    name: 'Free Shipping',
    description: 'Get 15% off on orders over $25',
    discountType: 'percentage',
    percentage: 15,
    minOrderAmount: 25,
    maxDiscountAmount: 30,
    usageLimit: null, // unlimited
    perUserLimit: 3,
    startAt: new Date(),
    expiresAt: new Date('2025-12-31'),
    isActive: true,
    isPublic: true,
    displayOnHomepage: false
  },
  {
    code: 'BOOKWORM50',
    name: 'Book Lover Special',
    description: '$50 off for orders above $200',
    discountType: 'fixed',
    fixedAmount: 50,
    minOrderAmount: 200,
    usageLimit: 20,
    perUserLimit: 1,
    startAt: new Date(),
    expiresAt: new Date('2025-12-31'),
    isActive: true,
    isPublic: true,
    displayOnHomepage: true
  },
  {
    code: 'FLASH25',
    name: 'Flash Sale',
    description: '25% off flash sale',
    discountType: 'percentage',
    percentage: 25,
    minOrderAmount: 40,
    maxDiscountAmount: 100,
    usageLimit: 30,
    perUserLimit: 1,
    startAt: new Date(),
    expiresAt: new Date('2025-11-30'),
    isActive: true,
    isPublic: true,
    displayOnHomepage: false
  }
];

const seedDiscounts = async () => {
  try {
    await connectDB();

    // Clear existing discounts
    console.log('🗑️  Clearing existing discounts...');
    await Discount.deleteMany({});

    // Insert sample discounts
    console.log('📝 Inserting sample discounts...');
    const result = await Discount.insertMany(sampleDiscounts);

    console.log(`✅ Successfully created ${result.length} discount codes:`);
    result.forEach(discount => {
      console.log(`   - ${discount.code}: ${discount.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding discounts:', error);
    process.exit(1);
  }
};

seedDiscounts();
