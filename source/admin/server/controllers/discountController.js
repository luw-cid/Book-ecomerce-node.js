const discountService = require('../services/discountService');
const AppError = require('../errors');

/**
 * GET /admin/discounts
 * Get all discounts with optional filters
 */
const getAllDiscounts = async (req, res) => {
  const { isActive, discountType, validity } = req.query;
  
  const filters = {};
  
  if (isActive !== undefined) {
    filters.isActive = isActive === 'true';
  }
  
  if (discountType) {
    filters.discountType = discountType;
  }
  
  if (validity) {
    filters.validity = validity;
  }
  
  const discounts = await discountService.getAllDiscounts(filters);
  
  res.status(200).json({
    success: true,
    count: discounts.length,
    data: discounts
  });
};

/**
 * GET /admin/discounts/:id
 * Get discount by ID
 */
const getDiscountById = async (req, res) => {
  const { id } = req.params;
  
  const discount = await discountService.getDiscountById(id);
  
  if (!discount) {
    throw new AppError('Discount not found', 404);
  }
  
  res.status(200).json({
    success: true,
    data: discount
  });
};

/**
 * POST /admin/discounts
 * Create new discount
 */
const createDiscount = async (req, res) => {
  const discountData = req.body;
  
  // Validate required fields
  if (!discountData.code || !discountData.name || !discountData.discountType) {
    throw new AppError('Code, name, and discountType are required', 400);
  }
  
  // Validate discountType specific fields
  if (discountData.discountType === 'percentage' && !discountData.percentage) {
    throw new AppError('Percentage is required for percentage discount type', 400);
  }
  
  if (discountData.discountType === 'fixed' && !discountData.fixedAmount) {
    throw new AppError('Fixed amount is required for fixed discount type', 400);
  }
  
  if (!discountData.expiresAt) {
    throw new AppError('Expiration date is required', 400);
  }
  
  // Add createdBy from authenticated admin
  discountData.createdBy = req.user?._id;
  
  const discount = await discountService.createDiscount(discountData);
  
  res.status(201).json({
    success: true,
    message: 'Discount created successfully',
    data: discount
  });
};

/**
 * PUT /admin/discounts/:id
 * Update discount
 */
const updateDiscount = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  // Don't allow updating usage count manually
  delete updateData.usageCount;
  
  const discount = await discountService.updateDiscount(id, updateData);
  
  if (!discount) {
    throw new AppError('Discount not found', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'Discount updated successfully',
    data: discount
  });
};

/**
 * DELETE /admin/discounts/:id
 * Delete discount
 */
const deleteDiscount = async (req, res) => {
  const { id } = req.params;
  
  const discount = await discountService.deleteDiscount(id);
  
  if (!discount) {
    throw new AppError('Discount not found', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'Discount deleted successfully',
    data: discount
  });
};

/**
 * PATCH /admin/discounts/:id/toggle
 * Toggle discount active status
 */
const toggleDiscountStatus = async (req, res) => {
  const { id } = req.params;
  
  const discount = await discountService.toggleDiscountStatus(id);
  
  res.status(200).json({
    success: true,
    message: `Discount ${discount.isActive ? 'activated' : 'deactivated'} successfully`,
    data: discount
  });
};

/**
 * GET /admin/discounts/:id/stats
 * Get discount usage statistics
 */
const getDiscountStats = async (req, res) => {
  const { id } = req.params;
  
  const stats = await discountService.getDiscountStats(id);
  
  res.status(200).json({
    success: true,
    data: stats
  });
};

module.exports = {
  getAllDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  toggleDiscountStatus,
  getDiscountStats
};
