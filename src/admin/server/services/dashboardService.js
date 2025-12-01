const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Category = require('../models/categoryModel');

/**
 * Get overview statistics (Total Revenue, Books Sold, Active Users, Conversion Rate)
 */
const getOverviewStats = async () => {
    try {
        // Total Revenue - tổng doanh thu từ các đơn hàng đã thanh toán
        const revenueResult = await Order.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // Revenue from current month
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthRevenueResult = await Order.aggregate([
            { 
                $match: { 
                    paymentStatus: 'Paid',
                    createdAt: { $gte: startOfCurrentMonth }
                }
            },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const currentMonthRevenue = currentMonthRevenueResult[0]?.total || 0;

        // Revenue from last month for comparison
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const lastMonthRevenueResult = await Order.aggregate([
            { 
                $match: { 
                    paymentStatus: 'Paid',
                    createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
                }
            },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const lastMonthRevenue = lastMonthRevenueResult[0]?.total || 0;
        const revenueGrowth = lastMonthRevenue > 0 
            ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
            : 0;

        // Books Sold - tổng số sách đã bán (từ field sold của Product)
        const booksSoldResult = await Product.aggregate([
            { $group: { _id: null, total: { $sum: '$sold' } } }
        ]);
        const booksSold = booksSoldResult[0]?.total || 0;

        // Books sold in current month (from orders)
        const currentMonthBooksSoldResult = await Order.aggregate([
            { 
                $match: { 
                    paymentStatus: 'Paid',
                    createdAt: { $gte: startOfCurrentMonth }
                }
            },
            { $unwind: '$items' },
            { $group: { _id: null, total: { $sum: '$items.quantity' } } }
        ]);
        const currentMonthBooksSold = currentMonthBooksSoldResult[0]?.total || 0;

        // Books sold last month
        const lastMonthBooksSoldResult = await Order.aggregate([
            { 
                $match: { 
                    paymentStatus: 'Paid',
                    createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
                }
            },
            { $unwind: '$items' },
            { $group: { _id: null, total: { $sum: '$items.quantity' } } }
        ]);
        const lastMonthBooksSold = lastMonthBooksSoldResult[0]?.total || 0;
        const booksSoldGrowth = lastMonthBooksSold > 0
            ? ((currentMonthBooksSold - lastMonthBooksSold) / lastMonthBooksSold * 100).toFixed(1)
            : 0;

        // Active Users - số người dùng đã đặt hàng
        const distinctUsers = await Order.distinct('user');
        const activeUsers = distinctUsers ? distinctUsers.length : 0;

        // Total Users
        const totalUsers = await User.countDocuments({ admin: false });
        const activeUsersGrowth = totalUsers > 0
            ? ((activeUsers / totalUsers) * 100).toFixed(1)
            : 0;

        // Conversion Rate - tỷ lệ chuyển đổi (số đơn hàng / số người dùng)
        const totalOrders = await Order.countDocuments();
        const conversionRate = totalUsers > 0
            ? ((totalOrders / totalUsers) * 100).toFixed(1)
            : 0;

        // Current month conversion rate
        const currentMonthOrders = await Order.countDocuments({
            createdAt: { $gte: startOfCurrentMonth }
        });
        const currentMonthConversionRate = totalUsers > 0
            ? ((currentMonthOrders / totalUsers) * 100).toFixed(1)
            : 0;

        // Last month conversion rate
        const lastMonthOrders = await Order.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        });
        const lastMonthConversionRate = totalUsers > 0
            ? ((lastMonthOrders / totalUsers) * 100).toFixed(1)
            : 0;
        const conversionRateGrowth = lastMonthConversionRate > 0
            ? ((parseFloat(currentMonthConversionRate) - parseFloat(lastMonthConversionRate)) / parseFloat(lastMonthConversionRate) * 100).toFixed(1)
            : 0;

        return {
            success: true,
            stats: {
                totalRevenue: totalRevenue.toFixed(2),
                revenueGrowth: parseFloat(revenueGrowth),
                booksSold,
                booksSoldGrowth: parseFloat(booksSoldGrowth),
                activeUsers,
                totalUsers,
                activeUsersGrowth: parseFloat(activeUsersGrowth),
                conversionRate: parseFloat(conversionRate),
                conversionRateGrowth: parseFloat(conversionRateGrowth),
                // Additional data for reference
                currentMonthRevenue: currentMonthRevenue.toFixed(2),
                lastMonthRevenue: lastMonthRevenue.toFixed(2)
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get revenue trend data (monthly)
 */
const getRevenueTrend = async (period = '6months') => {
    try {
        let startDate = new Date();
        let groupFormat = '%Y-%m';

        if (period === 'year') {
            startDate.setFullYear(startDate.getFullYear() - 1);
        } else if (period === '6months') {
            startDate.setMonth(startDate.getMonth() - 6);
        } else if (period === '3months') {
            startDate.setMonth(startDate.getMonth() - 3);
        }

        const revenueData = await Order.aggregate([
            {
                $match: {
                    paymentStatus: 'Paid',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        // Format data for chart
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedData = revenueData.map(item => ({
            month: `${monthNames[item._id.month - 1]}`,
            revenue: item.revenue,
            orders: item.orders
        }));

        return {
            success: true,
            data: formattedData
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get orders data by period (week, month, quarter)
 */
const getWeeklyOrders = async (period = 'week') => {
    try {
        const now = new Date();
        let startDate = new Date();
        let groupBy = {};
        let formattedData = [];

        if (period === 'week') {
            // Last 7 days - group by day
            startDate.setDate(startDate.getDate() - 7);
            const ordersData = await Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: { $dayOfWeek: '$createdAt' },
                        orders: { $sum: 1 }
                    }
                },
                {
                    $sort: { '_id': 1 }
                }
            ]);

            // Map day of week (1=Sunday, 2=Monday, ..., 7=Saturday) to day names
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            // Initialize all days with 0
            for (let i = 0; i < 7; i++) {
                formattedData.push({
                    label: dayNames[i],
                    orders: 0
                });
            }

            // Fill in actual data
            ordersData.forEach(item => {
                const dayIndex = item._id === 1 ? 0 : item._id - 1; // Convert Sunday=1 to index 0
                formattedData[dayIndex].orders = item.orders;
            });

        } else if (period === 'month') {
            // Last 4 weeks - group by week number (0-3)
            startDate.setDate(startDate.getDate() - 28);
            const ordersData = await Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate }
                    }
                },
                {
                    $addFields: {
                        daysDiff: {
                            $divide: [
                                { $subtract: ['$createdAt', startDate] },
                                1000 * 60 * 60 * 24 // Convert to days
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        weekNumber: {
                            $floor: {
                                $divide: ['$daysDiff', 7]
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: '$weekNumber',
                        orders: { $sum: 1 }
                    }
                },
                {
                    $sort: { '_id': 1 }
                }
            ]);

            // Initialize 4 weeks with 0
            for (let i = 0; i < 4; i++) {
                formattedData.push({
                    label: `Week ${i + 1}`,
                    orders: 0
                });
            }

            // Fill in actual data
            ordersData.forEach(item => {
                if (item._id >= 0 && item._id < 4) {
                    formattedData[item._id].orders = item.orders;
                }
            });

        } else if (period === 'quarter') {
            // Last 3 months - group by month
            startDate.setMonth(startDate.getMonth() - 3);
            const ordersData = await Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        orders: { $sum: 1 }
                    }
                },
                {
                    $sort: { '_id.year': 1, '_id.month': 1 }
                }
            ]);

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            ordersData.forEach(item => {
                formattedData.push({
                    label: monthNames[item._id.month - 1],
                    orders: item.orders
                });
            });

            // Ensure we have 3 months
            while (formattedData.length < 3) {
                const monthIndex = (now.getMonth() - (3 - formattedData.length) + 12) % 12;
                formattedData.unshift({
                    label: monthNames[monthIndex],
                    orders: 0
                });
            }
        }

        return {
            success: true,
            data: formattedData,
            period: period
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get recent orders
 */
const getRecentOrders = async (limit = 5) => {
    try {
        const orders = await Order.find()
            .populate('user', 'fullName email')
            .populate('items.product', 'name images')
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        const formattedOrders = orders.map(order => {
            const books = order.items.map(item => item.name || item.product?.name || 'Unknown').join(', ');
            // Format VND: 1,000,000 đ
            const formattedAmount = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(order.total);
            return {
                id: order.orderNumber,
                customer: order.user?.fullName || order.shippingAddress?.fullName || 'Guest',
                books: books.length > 50 ? books.substring(0, 50) + '...' : books,
                amount: formattedAmount,
                status: order.orderStatus
            };
        });

        return {
            success: true,
            orders: formattedOrders
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get statistics for advanced dashboard
 */
const getAdvancedStats = async (startDate, endDate, period = 'year') => {
    try {
        let dateFilter = {};
        
        if (startDate && endDate) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        } else {
            // Default to period
            const start = new Date();
            if (period === 'year') {
                start.setFullYear(start.getFullYear() - 1);
            } else if (period === 'quarter') {
                start.setMonth(start.getMonth() - 3);
            } else if (period === 'month') {
                start.setMonth(start.getMonth() - 1);
            } else if (period === 'week') {
                start.setDate(start.getDate() - 7);
            }
            dateFilter = { createdAt: { $gte: start } };
        }

        // Revenue and Orders by period
        const revenueData = await Order.aggregate([
            {
                $match: {
                    ...dateFilter,
                    paymentStatus: 'Paid'
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 },
                    books: { $sum: { $sum: '$items.quantity' } }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedRevenueData = revenueData.map(item => ({
            month: `${monthNames[item._id.month - 1]}`,
            revenue: item.revenue,
            books: item.books,
            orders: item.orders,
            avgOrder: item.orders > 0 ? (item.revenue / item.orders) : 0
        }));

        // Sales by Category
        const categoryData = await Order.aggregate([
            {
                $match: {
                    ...dateFilter,
                    paymentStatus: 'Paid'
                }
            },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            { $unwind: '$product.category' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'product.category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            {
                $group: {
                    _id: '$category._id',
                    name: { $first: '$category.name' },
                    value: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            {
                $sort: { value: -1 }
            },
            { $limit: 5 }
        ]);

        const colors = ['#1a4d2e', '#2d6a4f', '#52b788', '#74c69d', '#95d5b2'];
        const formattedCategoryData = categoryData.map((item, index) => ({
            name: item.name,
            value: item.value,
            color: colors[index % colors.length]
        }));

        // Top Products
        const topProducts = await Order.aggregate([
            {
                $match: {
                    ...dateFilter,
                    paymentStatus: 'Paid'
                }
            },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$items.product',
                    name: { $first: '$product.name' },
                    author: { $first: '$product.author' },
                    sold: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            {
                $sort: { sold: -1 }
            },
            { $limit: 5 }
        ]);

        const formattedTopProducts = topProducts.map(item => {
            // Format VND
            const formattedRevenue = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(item.revenue);
            return {
                name: item.name,
                author: item.author,
                sold: item.sold,
                revenue: formattedRevenue
            };
        });

        // Inventory Status by Category
        const inventoryData = await Product.aggregate([
            {
                $unwind: '$category'
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            { $unwind: '$categoryInfo' },
            {
                $group: {
                    _id: '$categoryInfo._id',
                    category: { $first: '$categoryInfo.name' },
                    inStock: {
                        $sum: {
                            $cond: [{ $gt: ['$stock', 10] }, 1, 0]
                        }
                    },
                    lowStock: {
                        $sum: {
                            $cond: [
                                { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', 10] }] },
                                1,
                                0
                            ]
                        }
                    },
                    outOfStock: {
                        $sum: {
                            $cond: [{ $eq: ['$stock', 0] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const formattedInventoryData = inventoryData.map(item => ({
            category: item.category,
            inStock: item.inStock,
            lowStock: item.lowStock,
            outOfStock: item.outOfStock
        }));

        return {
            success: true,
            data: {
                revenueData: formattedRevenueData,
                categoryData: formattedCategoryData,
                topProducts: formattedTopProducts,
                inventoryData: formattedInventoryData
            }
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getOverviewStats,
    getRevenueTrend,
    getWeeklyOrders,
    getRecentOrders,
    getAdvancedStats
};
