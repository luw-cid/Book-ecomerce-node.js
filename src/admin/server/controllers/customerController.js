const customerService = require('../services/customerService');
const AppError = require('../errors');

/**
 * GET /admin/customers
 * Get all customers with filters and pagination
 */
const getCustomers = async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        search,
        tier,
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
    } = req.query;

    const filter = { admin: false }; // Only get non-admin users

    if (search) {
        filter.$or = [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phoneNumber: { $regex: search, $options: 'i' } }
        ];
    }

    if (tier) {
        filter['loyalty.tier'] = tier;
    }

    const result = await customerService.getCustomers({
        filter,
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder
    });

    res.status(200).json(result);
};

/**
 * GET /admin/customers/:id
 * Get customer by ID
 */
const getCustomerById = async (req, res) => {
    const { id } = req.params;
    
    const result = await customerService.getCustomerById(id);
    
    if (!result.customer) {
        throw new AppError('Customer not found', 404);
    }
    
    res.status(200).json(result);
};

/**
 * PUT /admin/customers/:id
 * Update customer information
 */
const updateCustomer = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent updating sensitive fields
    delete updateData.password;
    delete updateData.admin;
    delete updateData.googleId;

    const result = await customerService.updateCustomer(id, updateData);
    
    res.status(200).json(result);
};

/**
 * PUT /admin/customers/:id/loyalty
 * Update customer loyalty points
 */
const updateLoyaltyPoints = async (req, res) => {
    const { id } = req.params;
    const { points, action = 'add', reason } = req.body;

    if (!points || points <= 0) {
        throw new AppError('Valid points amount is required', 400);
    }

    if (!['add', 'subtract'].includes(action)) {
        throw new AppError('Action must be either "add" or "subtract"', 400);
    }

    const result = await customerService.updateLoyaltyPoints(id, points, action, reason);
    
    res.status(200).json(result);
};

/**
 * PUT /admin/customers/:id/tier
 * Update customer tier
 */
const updateCustomerTier = async (req, res) => {
    const { id } = req.params;
    const { tier } = req.body;

    const validTiers = ['bronze', 'silver', 'gold', 'platinum'];
    if (!tier || !validTiers.includes(tier)) {
        throw new AppError('Valid tier is required (bronze, silver, gold, platinum)', 400);
    }

    const result = await customerService.updateCustomerTier(id, tier);
    
    res.status(200).json(result);
};

/**
 * DELETE /admin/customers/:id
 * Delete customer (soft delete by deactivating)
 */
const deleteCustomer = async (req, res) => {
    const { id } = req.params;
    
    const result = await customerService.deleteCustomer(id);
    
    res.status(200).json(result);
};

/**
 * PUT /admin/customers/:id/ban
 * Ban / Unban customer
 */
const updateCustomerBanStatus = async (req, res) => {
    const { id } = req.params;
    const { isBanned, reason } = req.body;

    if (typeof isBanned !== 'boolean') {
        throw new AppError('Field "isBanned" must be a boolean', 400);
    }

    if (isBanned && (!reason || !reason.trim())) {
        throw new AppError('Ban reason is required when banning a user', 400);
    }

    const result = await customerService.updateCustomerBanStatus(id, isBanned, reason);

    res.status(200).json(result);
};

/**
 * GET /admin/customers/:id/orders
 * Get customer's order history
 */
const getCustomerOrders = async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await customerService.getCustomerOrders(id, {
        page: parseInt(page),
        limit: parseInt(limit)
    });
    
    res.status(200).json(result);
};

/**
 * GET /admin/customers/stats
 * Get customer statistics
 */
const getCustomerStats = async (req, res) => {
    const result = await customerService.getCustomerStats();
    
    res.status(200).json(result);
};

/**
 * POST /admin/customers/:id/reset-password
 * Admin reset customer password
 */
const resetCustomerPassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        throw new AppError('Password must be at least 6 characters', 400);
    }

    const result = await customerService.resetCustomerPassword(id, newPassword);
    
    res.status(200).json(result);
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
    resetCustomerPassword,
    updateCustomerBanStatus
};
