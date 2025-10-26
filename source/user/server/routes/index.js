const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

// import các router con
const authRoutes = require('./authRoute');
const productRoutes = require('./productRoute');
const userRoute = require('./userRoute');

// ánh xạ các route con
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/user', userRoute)

// Serve static files cho uploads
router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

module.exports = router;