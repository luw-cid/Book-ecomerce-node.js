const orderService = require('../services/orderService');
const userModel = require('../models/userModel');
const AppError = require('../errors');

/**
 * GET /admin/orders
 * Get all orders with filters and pagination
 */
const getOrders = async (req, res) => {
    const { page = 1, limit = 12, status, paymentStatus, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filter = {};

    if (status) {
        filter.orderStatus = status;
    }

    if (paymentStatus) {
        filter.paymentStatus = paymentStatus;
    }

    // Không thêm $or ở đây - để service handle để tránh conflict
    // Service sẽ xử lý search cho cả orderNumber và user data

    const result = await orderService.getOrders({
        filter,
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
        search: search || ''
    });

    res.status(200).json(result);
};

/**
 * GET /admin/orders/:id
 * Get order by ID
 */
const getOrderById = async (req, res) => {
    const { id } = req.params;
    
    const result = await orderService.getOrderById(id);
    
    if (!result.order) {
        throw new AppError('Order not found', 404);
    }
    
    res.status(200).json(result);
};

/**
 * PUT /admin/orders/:id/status
 * Update order status
 */
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        throw new AppError('Status is required', 400);
    }

    const result = await orderService.updateOrderStatus(id, status);
    
    res.status(200).json(result);
};

/**
 * PUT /admin/orders/:id/payment-status
 * Update payment status
 */
const updatePaymentStatus = async (req, res) => {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
        throw new AppError('Payment status is required', 400);
    }

    const result = await orderService.updatePaymentStatus(id, paymentStatus);
    
    res.status(200).json(result);
};

/**
 * PUT /admin/orders/:id/cancel
 * Cancel order
 */
const cancelOrder = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await orderService.cancelOrder(id, reason);
    
    res.status(200).json(result);
};

/**
 * GET /admin/orders/stats
 * Get order statistics
 */
const getOrderStats = async (req, res) => {
    const result = await orderService.getOrderStats();
    
    res.status(200).json(result);
};

/**
 * DELETE /admin/orders/:id
 * Delete order (only cancelled orders)
 */
const deleteOrder = async (req, res) => {
    const { id } = req.params;
    
    const result = await orderService.deleteOrder(id);
    
    res.status(200).json(result);
};

module.exports = {
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getOrderStats,
    deleteOrder
};

