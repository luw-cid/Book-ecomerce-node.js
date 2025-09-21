const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

// import các router con
const authRoutes = require('./authRoute');

// ánh xạ các route con
router.use('/auth', authRoutes);

module.exports = router;