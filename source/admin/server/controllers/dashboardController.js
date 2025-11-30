const asyncHandler = require('express-async-handler');
const dashboardService = require('../services/dashboardService');

/**
 * Get overview statistics
 * GET /api/dashboard/overview
 */
const getOverviewStats = asyncHandler(async (req, res) => {
    const result = await dashboardService.getOverviewStats();
    res.status(200).json(result);
});

/**
 * Get revenue trend data
 * GET /api/dashboard/revenue-trend?period=6months
 */
const getRevenueTrend = asyncHandler(async (req, res) => {
    const { period = '6months' } = req.query;
    const result = await dashboardService.getRevenueTrend(period);
    res.status(200).json(result);
});

/**
 * Get orders data by period
 * GET /api/dashboard/weekly-orders?period=week|month|quarter
 */
const getWeeklyOrders = asyncHandler(async (req, res) => {
    const { period = 'week' } = req.query;
    const result = await dashboardService.getWeeklyOrders(period);
    res.status(200).json(result);
});

/**
 * Get recent orders
 * GET /api/dashboard/recent-orders?limit=5
 */
const getRecentOrders = asyncHandler(async (req, res) => {
    const { limit = 5 } = req.query;
    const result = await dashboardService.getRecentOrders(parseInt(limit));
    res.status(200).json(result);
});

/**
 * Get advanced statistics
 * GET /api/dashboard/advanced-stats?period=year&startDate=&endDate=
 */
const getAdvancedStats = asyncHandler(async (req, res) => {
    const { period = 'year', startDate, endDate } = req.query;
    const result = await dashboardService.getAdvancedStats(startDate, endDate, period);
    res.status(200).json(result);
});

module.exports = {
    getOverviewStats,
    getRevenueTrend,
    getWeeklyOrders,
    getRecentOrders,
    getAdvancedStats
};
