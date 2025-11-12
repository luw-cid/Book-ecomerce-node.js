const cron = require('node-cron');
const ordeModel = require('../models/orderModel');
const orderModel = require('../models/orderModel');

const cleanupUnpaidOrders = () => {
    cron.schedule('* * * * *', async () => {
        try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            const result = await orderModel.deleteMany(
                {
                    paymentStatus: 'Pending',
                    paymentMethod: 'Bank Transfer',
                    orderStatus: {$ne: 'Cancelled'},
                    createdAt: { $lt: fiveMinutesAgo}
                }
            );
            if (result.deletedCount > 0) {
                console.log(`🗑️  Permanently deleted ${result.deletedCount} unpaid order(s)`);
            }
        } catch (error) {
            console.error('❌ Cleanup error:', error.message);
        }
    });
    console.log('✅ Cleanup job started - deleting unpaid orders after 5 minutes');
};

module.exports = { cleanupUnpaidOrders };