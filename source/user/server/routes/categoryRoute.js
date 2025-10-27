const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const asyncHandle = require('express-async-handler');

// ==================== CATEGORY ROUTES ====================
// GET /categories - Lấy tất cả categories
router.get('/', asyncHandle(categoryController.getAllCategories));

// GET /categories/slug/:slug - Lấy category theo slug
router.get('/slug/:slug', asyncHandle(categoryController.getCategoryBySlug));

// GET /categories/:id - Lấy category theo ID
router.get('/:id', asyncHandle(categoryController.getCategoryById));

module.exports = router;
