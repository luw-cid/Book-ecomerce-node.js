const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

// import các router con
const authRoutes = require('./authRoute');
const productRoutes = require('./productRoute');
const categoryRoutes = require('./categoryRoute');

// ánh xạ các route con
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;