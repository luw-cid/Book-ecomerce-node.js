const express = require('express');
const asyncHandle = require('express-async-handler');
const statsController = require('../controllers/statsController');

const router = express.Router();

// Public stats for homepage hero
router.get('/hero', asyncHandle(statsController.getHeroStats));

module.exports = router;


