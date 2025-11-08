const discountModel = require('../models/discountModel');
const orderModel = require('../models/orderModel');

const getAllDiscounts = async (filters = {}) => {
  try {
    const query = {};
    
    // Filter by status
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    
    // Filter by type
    if (filters.discountType) {
      query.discountType = filters.discountType;
    }
    
    // Filter by validity
    if (filters.validity === 'active') {
      const now = new Date();
      query.startAt = { $lte: now };
      query.expiresAt = { $gte: now };
    } else if (filters.validity === 'expired') {
      query.expiresAt = { $lt: new Date() };
    } else if (filters.validity === 'upcoming') {
      query.startAt = { $gt: new Date() };
    }
    
    return await discountModel.find(query)
      .sort({ createdAt: -1 });
  } catch (error) {
    throw error;
  }
};

/**
 * Get discount by ID (Admin)
 */
const getDiscountById = async (id) => {
  try {
    return await discountModel.findById(id);
  } catch (error) {
    throw error;
  }
};

/**
 * Create new discount (Admin)
 */
const createDiscount = async (discountData) => {
  try {
    // Auto uppercase code
    if (discountData.code) {
      discountData.code = discountData.code.toUpperCase();
    }
    
    const discount = new discountModel(discountData);
    return await discount.save();
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Discount code already exists');
    }
    throw error;
  }
};

/**
 * Update discount (Admin)
 */
const updateDiscount = async (id, updateData) => {
  try {
    // Auto uppercase code if updating
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }
    
    return await discountModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Discount code already exists');
    }
    throw error;
  }
};

/**
 * Delete discount (Admin)
 */
const deleteDiscount = async (id) => {
  try {
    return await discountModel.findByIdAndDelete(id);
  } catch (error) {
    throw error;
  }
};

/**
 * Toggle discount status (Admin)
 * Quick enable/disable
 */
const toggleDiscountStatus = async (id) => {
  try {
    const discount = await discountModel.findById(id);
    if (!discount) {
      throw new Error('Discount not found');
    }
    
    discount.isActive = !discount.isActive;
    return await discount.save();
  } catch (error) {
    throw error;
  }
};

/**
 * Get discount statistics (Admin)
 * Usage analytics
 */
const getDiscountStats = async (id) => {
  try {
    const discount = await discountModel.findById(id);
    if (!discount) {
      throw new Error('Discount not found');
    }
    
    // Get total revenue from this discount
    const orders = await orderModel.find({ 'discount.code': discount.code });
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalDiscountGiven = orders.reduce((sum, order) => sum + (order.discount?.amount || 0), 0);
    
    return {
      code: discount.code,
      name: discount.name,
      usageCount: discount.usageCount,
      usageLimit: discount.usageLimit,
      totalOrders: orders.length,
      totalRevenue,
      totalDiscountGiven,
      isActive: discount.isActive,
      expiresAt: discount.expiresAt
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  toggleDiscountStatus,
  getDiscountStats,
}