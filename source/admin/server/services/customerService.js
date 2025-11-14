const User = require('../models/userModel');
const Order = require('../models/orderModel');
const AppError = require('../errors');
const bcrypt = require('bcryptjs');

/**
 * Get all customers with filters and pagination
 */
const getCustomers = async ({ filter, page, limit, sortBy, sortOrder }) => {
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const customers = await User.find(filter)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return {
        success: true,
        customers,
        pagination: {
            page,
            limit,
            total,
            totalPages
        }
    };
};

/**
 * Get customer by ID with additional details
 */
const getCustomerById = async (id) => {
    const customer = await User.findById(id)
        .select('-password')
        .lean();

    if (!customer) {
        throw new AppError('Customer not found', 404);
    }

    // Get customer's order statistics
    const orderStats = await Order.aggregate([
        { $match: { user: customer._id } },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalSpent: { $sum: '$total' },
                avgOrderValue: { $avg: '$total' }
            }
        }
    ]);

    const stats = orderStats[0] || {
        totalOrders: 0,
        totalSpent: 0,
        avgOrderValue: 0
    };

    // Get recent orders
    const recentOrders = await Order.find({ user: customer._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('orderNumber total orderStatus createdAt')
        .lean();

    return {
        success: true,
        customer: {
            ...customer,
            orderStats: stats,
            recentOrders
        }
    };
};

/**
 * Update customer information
 */
const updateCustomer = async (id, updateData) => {
    const customer = await User.findById(id);

    if (!customer) {
        throw new AppError('Customer not found', 404);
    }

    // Update customer fields
    Object.keys(updateData).forEach(key => {
        if (key === 'preferences' || key === 'loyalty') {
            // Handle nested objects
            customer[key] = { ...customer[key], ...updateData[key] };
        } else {
            customer[key] = updateData[key];
        }
    });

    await customer.save();

    const updatedCustomer = customer.toObject();
    delete updatedCustomer.password;

    return {
        success: true,
        message: 'Customer updated successfully',
        customer: updatedCustomer
    };
};

/**
 * Update customer loyalty points
 */
const updateLoyaltyPoints = async (id, points, action, reason) => {
    const customer = await User.findById(id);

    if (!customer) {
        throw new AppError('Customer not found', 404);
    }

    const pointsChange = action === 'add' ? points : -points;
    
    customer.loyalty.points = Math.max(0, customer.loyalty.points + pointsChange);
    
    if (action === 'add') {
        customer.loyalty.lifetimePoints += points;
        customer.loyalty.lastEarnedAt = new Date();
    } else {
        customer.loyalty.lastRedeemedAt = new Date();
    }

    // Auto-update tier based on lifetime points
    if (customer.loyalty.lifetimePoints >= 10000) {
        customer.loyalty.tier = 'platinum';
    } else if (customer.loyalty.lifetimePoints >= 5000) {
        customer.loyalty.tier = 'gold';
    } else if (customer.loyalty.lifetimePoints >= 2000) {
        customer.loyalty.tier = 'silver';
    } else {
        customer.loyalty.tier = 'bronze';
    }

    await customer.save();

    const updatedCustomer = customer.toObject();
    delete updatedCustomer.password;

    return {
        success: true,
        message: `Successfully ${action === 'add' ? 'added' : 'subtracted'} ${points} points`,
        customer: updatedCustomer,
        action,
        points,
        reason
    };
};

/**
 * Update customer tier
 */
const updateCustomerTier = async (id, tier) => {
    const customer = await User.findById(id);

    if (!customer) {
        throw new AppError('Customer not found', 404);
    }

    customer.loyalty.tier = tier;
    await customer.save();

    const updatedCustomer = customer.toObject();
    delete updatedCustomer.password;

    return {
        success: true,
        message: `Customer tier updated to ${tier}`,
        customer: updatedCustomer
    };
};

/**
 * Delete customer (soft delete)
 */
const deleteCustomer = async (id) => {
    const customer = await User.findById(id);

    if (!customer) {
        throw new AppError('Customer not found', 404);
    }

    if (customer.admin) {
        throw new AppError('Cannot delete admin users', 403);
    }

    // Check if customer has active orders
    const activeOrders = await Order.countDocuments({
        user: id,
        orderStatus: { $in: ['Pending', 'Processing', 'Shipped'] }
    });

    if (activeOrders > 0) {
        throw new AppError('Cannot delete customer with active orders', 400);
    }

    await User.findByIdAndDelete(id);

    return {
        success: true,
        message: 'Customer deleted successfully'
    };
};

/**
 * Get customer's order history
 */
const getCustomerOrders = async (customerId, { page, limit }) => {
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: customerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('items.product', 'name price images')
        .lean();

    const total = await Order.countDocuments({ user: customerId });
    const totalPages = Math.ceil(total / limit);

    return {
        success: true,
        orders,
        pagination: {
            page,
            limit,
            total,
            totalPages
        }
    };
};

/**
 * Get customer statistics
 */
const getCustomerStats = async () => {
    // Total customers
    const totalCustomers = await User.countDocuments({ admin: false });

    // Customers by tier
    const tierStats = await User.aggregate([
        { $match: { admin: false } },
        {
            $group: {
                _id: '$loyalty.tier',
                count: { $sum: 1 }
            }
        }
    ]);

    // New customers this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newCustomersThisMonth = await User.countDocuments({
        admin: false,
        createdAt: { $gte: startOfMonth }
    });

    // Active customers (customers who have placed orders in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeCustomerIds = await Order.distinct('user', {
        createdAt: { $gte: thirtyDaysAgo }
    });

    const activeCustomers = activeCustomerIds.length;

    // Top customers by spending
    const topCustomers = await Order.aggregate([
        {
            $group: {
                _id: '$user',
                totalSpent: { $sum: '$total' },
                orderCount: { $sum: 1 }
            }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'customer'
            }
        },
        { $unwind: '$customer' },
        {
            $project: {
                _id: '$customer._id',
                fullName: '$customer.fullName',
                email: '$customer.email',
                totalSpent: 1,
                orderCount: 1,
                tier: '$customer.loyalty.tier'
            }
        }
    ]);

    const tierStatsFormatted = {
        bronze: 0,
        silver: 0,
        gold: 0,
        platinum: 0
    };

    tierStats.forEach(stat => {
        tierStatsFormatted[stat._id] = stat.count;
    });

    return {
        success: true,
        stats: {
            totalCustomers,
            newCustomersThisMonth,
            activeCustomers,
            tierDistribution: tierStatsFormatted,
            topCustomers
        }
    };
};

/**
 * Reset customer password
 */
const resetCustomerPassword = async (id, newPassword) => {
    const customer = await User.findById(id);

    if (!customer) {
        throw new AppError('Customer not found', 404);
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    customer.password = await bcrypt.hash(newPassword, salt);

    await customer.save();

    return {
        success: true,
        message: 'Customer password reset successfully'
    };
};

module.exports = {
    getCustomers,
    getCustomerById,
    updateCustomer,
    updateLoyaltyPoints,
    updateCustomerTier,
    deleteCustomer,
    getCustomerOrders,
    getCustomerStats,
    resetCustomerPassword
};
