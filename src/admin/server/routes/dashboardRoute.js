const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { adminMiddleware } = require('../middlewares/roleMiddleware');

// Tất cả routes đều yêu cầu authentication và admin role
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/overview', dashboardController.getOverviewStats);
router.get('/revenue-trend', dashboardController.getRevenueTrend);
router.get('/weekly-orders', dashboardController.getWeeklyOrders);
router.get('/recent-orders', dashboardController.getRecentOrders);
router.get('/advanced-stats', dashboardController.getAdvancedStats);

module.exports = router;
