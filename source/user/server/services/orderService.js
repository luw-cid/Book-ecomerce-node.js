const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');
const loyaltyService = require('./loyaltyService');
const discountService = require('./discountService');
const authService = require('./authService');

const generateOrderNumber = async () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp}${random}`;
};

const createGuestAccount = async (shippingAddress) => {
    try {
        const { email, fullName, phone, address, city, zipCode } = shippingAddress;

        let user = await userModel.findOne({ email });
        if(!user) {
            console.log(`📧 Creating account for guest: ${email}`);

            const fullAddress = `${address}, ${city}, ${zipCode}`;
            user = await authService.registerUser(fullName, email, fullAddress);

            console.log(`✅ Account created for ${email} - Password sent via email`);

            return user.id;
        }

        return user._id;
    } catch (error) {
        console.error('Error creating guest account:', error);
        throw error;
    }
    
}

const createOrder = async (orderData) => {
    try {
        orderData.orderNumber = await generateOrderNumber();

        if (!orderData.paymentStatus) {
            orderData.paymentStatus = 'Pending';
        }
        if (!orderData.orderStatus) {
            orderData.orderStatus = 'Pending';
        }

        let userId = orderData.user;

        if (!userId && orderData.shippingAddress && orderData.shippingAddress.email) {
            try {
                userId = await createGuestAccount(orderData.shippingAddress);
                orderData.user = userId;

                console.log(`🎉 Guest order converted to user order: ${userId}`);
            } catch (error) {
                console.error('Failed to create guest account:', error);
                // Vẫn cho phép order nhưng không có user (optional user)
                orderData.user = null;
            }
        }
        const order = await orderModel.create(orderData);
        await order.populate('items.product', 'title price coverImage author');

        if (orderData.discount?.code) {
        try {
            await discountService.incrementUsage(orderData.discount.code)
        } catch (error) {
            console.error('Error incrementing discount usage:', error);
        }
    }

    if (userId && orderData.paymentStatus === 'Paid') {
        try {
            const pointsResult = await loyaltyService.earnPointsFromOrder(userId, order.total);
            console.log(`User earned ${pointsResult.pointsEarned} loyalty points`);
        } catch (error) {
            console.error('Error earning loyalty points:', error);
        }
    }
    return order;

    } catch (error) {
        throw error;
    }
}

const updatePaymentStatus = async (orderId, paymentStatus, transactionData = null) => {
    try {
        const order = await orderModel.findById(orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        const oldStatus = order.paymentStatus;
        order.paymentStatus = paymentStatus;
        
        // Nếu payment status là Paid, cập nhật các thông tin liên quan
        if (paymentStatus === 'Paid') {
            order.paidAt = new Date();
            order.orderStatus = 'Processing'; // Tự động chuyển sang Processing
            
            // Lưu transaction details nếu có
            if (transactionData) {
                order.transactionId = transactionData.transactionId || transactionData.id;
                order.paymentDetails = {
                    transactionId: transactionData.transactionId || transactionData.id,
                    transactionContent: transactionData.transaction_content || transactionData.content,
                    transactionDate: transactionData.transaction_date || transactionData.when || new Date(),
                    amount: transactionData.amount_in || transactionData.amount,
                    bankCode: transactionData.bank_brand_name || transactionData.bankCode
                };
            }
        }
        
        await order.save();

        // Tính loyalty points nếu chưa được tính
        if (oldStatus !== 'Paid' && paymentStatus === 'Paid' && order.user) {
            try {
                const pointsResult = await loyaltyService.earnPointsFromOrder(order.user, order.total);
                console.log(`🎁 User earned ${pointsResult.pointsEarned} loyalty points after payment`);
            } catch (error) {
                console.error('Error earning loyalty points:', error);
            }
        }
        
        return order;
    } catch (error) {
        throw error;
    }
}

const getOrderById = async (orderId, userId = null) => {
    const query = { _id: orderId};

    if (userId) {query.user = userId; }

    const order = await orderModel.findOne(query)
        .populate('items.product', 'title price image author')
        .populate('user', 'fullName email');

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

    const orders = await orderModel.find(query)
        .sort({ createdAt: -1})
        .skip(skip)
        .limit(limit)
        .populate('item.product', 'title price image author')
        .lean();

    const total = await orderModel.countDocuments(query);

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
    const order = await orderModel.findOne({ _id, user: userId});

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
    const totalOrders = await orderModel.countDocuments({ user: userId});
    const pendingOrders = await orderModel.countDocuments({ user: userId, orderStatus: 'Pending'});
    const deliveredOrders = await orderModel.countDocuments({ user: userId, orderStatus: 'Delivered'});

    // calculate total spend (only Paid orders)
    const spentResult = await orderModel.aggregate([
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
  getUserOrderStats,
  updatePaymentStatus
};