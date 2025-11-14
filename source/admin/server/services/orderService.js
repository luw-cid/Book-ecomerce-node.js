const orderModel = require('../models/orderModel');

const getOrders = async ({ filter = {}, page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' }) => {
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1};

    try {
        const orders = await orderModel
            .find(filter)
            .populate('user', 'fullName email phone')
            .populate('items.product', 'name images price')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await orderModel.countDocuments(filter);

        return {
            success: true,
            orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalOrders: total,
                limit
            }
        };

    } catch (error) {
        throw error;
    }
};

const getOrderById = async (orderId) => {
    try {
        const order = await orderModel
            .findById(orderId)
            .populate('user', 'name email phone address')
            .populate('items.product', 'name images price author publisher')
            .lean();

        if (!order) {
            throw new Error('Order not found');
        }

        return { success: true, order };
    } catch (error) {
        throw error;
    }
};

const updateOrderStatus = async (orderId, status) => {
    try {
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

        if (!validStatuses.includes(status)) {
            throw new Error('Invalid order status');
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        if (order.orderStatus === 'Cancelled' || order.orderStatus === 'Delivered') {
            throw new Error(`Cannot update order with status: ${order.orderStatus}`);
        }

        order.orderStatus = status;
        
        // Initialize statusHistory if it doesn't exist
        if (!order.statusHistory) {
            order.statusHistory = [];
        }
        
        order.statusHistory.push({
            status,
            updatedAt: new Date()
        });

        await order.save();
        
        // Populate product details and user after save
        const populatedOrder = await orderModel.findById(orderId)
            .populate('items.product')
            .populate('user', 'fullName email phoneNumber');
        
        return { success: true, order: populatedOrder};
    } catch (error) {
        throw error;
    }
};

const cancelOrder = async (orderId, reason) => {
    try {
        const order = await orderModel.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        if (order.status === 'delivered') {
            throw new Error('Cannot cancel delivered order');
        }

        if (order.status === 'cancelled') {
            throw new Error('Order is already cancelled');
        }

        order.status = 'cancelled';
        order.statusHistory.push({
            status: 'cancelled',
            updatedAt: new Date(),
            note: reason || 'Cancelled by admin'
        });

        await order.save();

        return { success: true, order };
    } catch (error) {
        throw error;
    }
};

const getOrderStats = async () => {
    try {
        const totalOrders = await orderModel.countDocuments();
        const pendingOrders = await orderModel.countDocuments({ status: 'pending' });
        const processingOrders = await orderModel.countDocuments({ status: 'processing' });
        const shippingOrders = await orderModel.countDocuments({ status: 'shipping' });
        const deliveredOrders = await orderModel.countDocuments({ status: 'delivered' });
        const cancelledOrders = await orderModel.countDocuments({ status: 'cancelled' });

        const totalRevenue = await orderModel.aggregate([
            { $match: { status: 'delivered', paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        return {
            success: true,
            stats: {
                totalOrders,
                pendingOrders,
                processingOrders,
                shippingOrders,
                deliveredOrders,
                cancelledOrders,
                totalRevenue: totalRevenue[0]?.total || 0
            }
        };
    } catch (error) {
        throw error;
    }
};

const deleteOrder = async (orderId) => {
    try {
        const order = await orderModel.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Chỉ cho phép xóa đơn hàng đã hủy
        if (order.status !== 'cancelled') {
            throw new Error('Only cancelled orders can be deleted');
        }

        await orderModel.findByIdAndDelete(orderId);

        return { success: true, message: 'Order deleted successfully' };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getOrders,
    getOrderById,
    updateOrderStatus,
    // updatePaymentStatus,
    cancelOrder,
    getOrderStats,
    deleteOrder
};