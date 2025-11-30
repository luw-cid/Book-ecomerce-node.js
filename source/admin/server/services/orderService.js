const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');

const getOrders = async ({ filter, page, limit, sortBy, sortOrder, search }) => {
    try {
        const skip = (page - 1) * limit;
        
        // Nếu có search, build filter.$or một lần duy nhất
        if (search && search.trim()) {
            // Tìm users matching search
            const matchingUsers = await userModel.find({
                $or: [
                    { fullName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            
            const userIds = matchingUsers.map(u => u._id);
            
            // Xóa filter.$or cũ nếu có (từ controller)
            if (filter.$or) {
                delete filter.$or;
            }
            
            // Build filter.$or mới với cả orderNumber và userIds
            filter.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { user: { $in: userIds } }
            ];
        }
        
        // Chỉ tạo query một lần duy nhất
        const query = orderModel.find(filter)
            .populate('user', 'fullName email phoneNumber')
            .populate('items.product', 'name images price')
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(limit);

        const orders = await query;
        const total = await orderModel.countDocuments(filter);

        return {
            success: true,
            orders,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                totalOrders: total
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

// Helper function: Cập nhật stock và sold cho products trong order
const updateProductStockAndSold = async (orderItems) => {
    try {
        for (const item of orderItems) {
            const product = await productModel.findById(item.product);
            if (product) {
                // Kiểm tra stock đủ không
                if (product.stock < item.quantity) {
                    console.warn(`⚠️ Insufficient stock for product ${product.name}: requested=${item.quantity}, available=${product.stock}`);
                    // Vẫn tiếp tục nhưng log warning
                }
                
                // Giảm stock (không cho phép âm)
                product.stock = Math.max(0, product.stock - item.quantity);
                // Tăng sold
                product.sold = (product.sold || 0) + item.quantity;
                await product.save();
                console.log(`✅ Updated stock for product ${product.name}: stock=${product.stock}, sold=${product.sold}`);
            } else {
                console.warn(`⚠️ Product not found: ${item.product}`);
            }
        }
    } catch (error) {
        console.error('Error updating product stock and sold:', error);
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

        const oldStatus = order.orderStatus;

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
        
        // Cập nhật stock và sold khi order status chuyển sang 'Delivered'
        if (status === 'Delivered' && oldStatus !== 'Delivered' && order.items && order.items.length > 0) {
            try {
                await updateProductStockAndSold(order.items);
                console.log(`✅ Stock and sold updated for order ${order.orderNumber} when delivered`);
            } catch (error) {
                console.error('Error updating product stock when order delivered:', error);
                // Không throw error để không làm fail status update
            }
        }
        
        // Populate product details and user after save
        const populatedOrder = await orderModel.findById(orderId)
            .populate('items.product', 'name images price author publisher')
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