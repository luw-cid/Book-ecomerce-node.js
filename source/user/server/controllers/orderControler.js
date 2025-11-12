const AppError = require('../errors');
const orderService = require('../services/orderService');

const createOrder = async (req, res) => {
    const orderData = req.body;

    if (!orderData || !orderData.items || orderData.items.length === 0) {
        throw new AppError('Order must contain at least one item', 400);
    }

    if (!orderData.shippingAddress) {
        throw new AppError('Shipping address is required', 400);
    }
    
    if (!orderData.paymentMethod) {
        throw new AppError('Payment method is required', 400);
    }
    
    if (!orderData.subtotal || !orderData.total) {
        throw new AppError('Order amounts are required', 400);
    }
    
    // Validate shipping address fields
    const { fullName, email, phone, address, city } = orderData.shippingAddress;
    if (!fullName || !email || !phone || !address || !city) {
        throw new AppError('Complete shipping address is required', 400);
    }
    
    // Validate items
    for (const item of orderData.items) {
        if (!item.product || !item.quantity || !item.price) {
            throw new AppError('Invalid item data', 400);
        }
        if (item.quantity < 1) {
            throw new AppError('Item quantity must be at least 1', 400);
        }
    }

    if (req.user) {
        orderData.user = req.user._id;
    }

    const order = await orderService.createOrder(orderData);

    res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order: order
    });
};

const getOrderById = async (req, res) => {
    const { id } = req.params;

    if (!id ) {
        throw new AppError('Order ID is required', 400);
    }

    const userId = req.user?._id;

    const order = await orderService.getOrderById(id, userId);
    res.status(200).json({
        success: true,
        data: order
    });
}

const getUserOrders = async (req, res) => {
  const userId = req.user?._id;
  
  if (!userId) {
    throw new AppError('Authentication required', 401);
  }
  
  const { page, limit, status } = req.query;
  
  const result = await orderService.getUserOrders(userId, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    status: status || undefined
  });
  
  res.status(200).json({
    success: true,
    data: result.orders,
    pagination: result.pagination
  });
};

const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?._id;
  
  if (!userId) {
    throw new AppError('Authentication required', 401);
  }
  
  if (!id) {
    throw new AppError('Order ID is required', 400);
  }
  
  const order = await orderService.cancelledOrders(id, userId);
  
  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: order
  });
};

const getUserOrderStats = async (req, res) => {
  const userId = req.user?._id;
  
  if (!userId) {
    throw new AppError('Authentication required', 401);
  }
  
  const stats = await orderService.getUserOrderStats(userId);
  
  res.status(200).json({
    success: true,
    data: stats
  });
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  cancelOrder,
  getUserOrderStats
};