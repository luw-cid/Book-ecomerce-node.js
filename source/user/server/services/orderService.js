const orderService = require('../models/orderModel');
const loyaltyService = require('./loyaltyService');
const discountService = require('./discountService');

const generateOrderNumber = async () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp}${random}`;
};

const createOrder = async (orderData) => {
    orderData.orderNumber = generateOrderNumber();

    if (!orderData.paymentStatus) {
        orderData.paymentStatus = 'Pending';
    }
    if (!orderData.orderStatus) {
        orderData.orderStatus = 'Pending';
    }

    const order = await orderService.create(orderData);

    await order.populate('item.product', 'title price image author');
    
    if (orderData.discount?.code) {
        try {
            await discountService.incrementUsage(orderData.discount.code)
        } catch (error) {
            console.error('Error incrementing discount usage:', error);
        }
    }

    if (orderData.user) {
        try {
            const pointsResult = await loyaltyService.earnPointsFromOrder(
                orderData.user,
                order.total,
            );
            console.log(`User earned ${pointsResult.pointsEarned} loyalty points`);
        } catch (error) {
            console.error('Error earning loyalty points:', error);
        }
    }
    return order;
}

const getOrderById = async (orderId, userId = null) => {
    const query = { _id: orderId};

    if (userId) {query.user = userId; }

    const order = await orderService.findOne(query)
        .populate('item.product', 'title price image author')
        .populate('user', 'fullname email');

    if (!order) {
        throw new Error('Order not found');
    }

    return order;
}

const getUserOrders = async (userId, options = {}) => {
    const {page = 1, limit = 10, status} = options;

    const query = { user: userId};

    if (status && status !== 'All') {
        query.orderStatus = status;
    }

    const skip = (page - 1) * limit;

    const orders = await orderService.find(query)
        .sort({ createdAt: -1})
        .skip(skip)
        .limit(limit)
        .populate('item.product', 'title price image author')
        .lean();

    const total = await orderService.countDocuments(query);

    return {
        orders,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total/limit)
        }
    };
}

const cancelledOrders = async (orderId, userId) => {
    const order = await orderService.findOne({ _id, user: userId});

    if (!order) { 
        throw new Error('Order not found');
    }

    if (!['Pending', 'Processing'].includes(order.orderStatus)) {
        throw new Error(`Cannot cancel order with status: ${order.orderStatus}`);
    }

    // update status to cancelled
    order.orderStatus = 'Cancelled';
    await order.save();

    // Populate for response
    await order.populate('items.product', 'title price image author');
    return order;
} 

const getUserOrderStats = async (userId) => {
    const totalOrders = await orderService.countDocuments({ user: userId});
    const pendingOrders = await orderService.countDocuments({ user: userId, orderStatus: 'Pending'});
    const deliveredOrders = await orderService.countDocuments({ user: userId, orderStatus: 'Delivered'});

    // calculate total spend (only Paid orders)
    const spentResult = await orderService.aggregate([
        {
            $match: {
                user: mongoose.Types.ObjectId(userId),
                paymentStatus: 'Paid'
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$total'}
            }
        }
    ]);

    const totalSpent = spentResult.length > 0 ? spentResult[0].total : 0;

    return {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalSpent
    };
}

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  cancelledOrders,
  getUserOrderStats
};