const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

// import các router con
const authRoutes = require('./authRoute');
const productRoutes = require('./productRoute');
const categoryRoutes = require('./categoryRoute');
const cartRoutes = require('./cartRoute');
const userRoutes = require('./userRoute');
const discountRoutes = require('./discountRoute');
const loyaltyRoutes = require('./loyaltyRoute');
const orderRoutes = require('./orderRoute');
const paymentRoutes = require('./paymentRoute');

// ánh xạ các route con
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/user', userRoutes);
router.use('/discounts', discountRoutes);
router.use('/loyalty', loyaltyRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);

// Serve static files cho uploads
router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

module.exports = router;