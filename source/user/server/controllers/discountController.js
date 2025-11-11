const AppError = require('../errors');
const discountService = require('../services/discountService');

const applyDiscount = async (req, res) => {
    const { code , subtotal} = req.body;
    if (!code || !subtotal) {
        return res.status(400).json({
            success: false,
            message: 'Discount code and subtotal are required'
        });
    }

    const userId = req.user?._id || null;

    const result = await discountService.applyDiscountToCart(code, subtotal, userId);
    if (!result) throw new AppError('Discount applied failed', 500)

    res.status(200).json({
        success: true,
        message: 'Discount applied successfully',
        data: result
    });
};

const validateDiscountCode = async (req, res) => {
  const { code } = req.params;
  
  if (!code) {
    throw new AppError('Discount code is required', 400);
  }

  const userId = req.user?._id || null;

  const discount = await discountService.validateDiscount(code, userId);
  
  if (!discount) {
    throw new AppError('Invalid discount code', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Discount code is valid',
    data: {
      code: discount.code,
      name: discount.name,
      description: discount.description,
      type: discount.discountType,
      value: discount.discountType === 'percentage' 
        ? discount.percentage 
        : discount.fixedAmount,
      minOrderAmount: discount.minOrderAmount,
      maxDiscountAmount: discount.maxDiscountAmount,
      expiresAt: discount.expiresAt
    }
  });
};

const getPublicDiscounts = async (req, res) => {
  const discounts = await discountService.getPublicDiscounts();

  res.status(200).json({
    success: true,
    count: discounts.length,
    data: discounts
  });
};


const getDiscounts = async (req, res) => {
  const discounts = await discountService.getActiveDiscounts();

  res.status(200).json({
    success: true,
    count: discounts.length,
    discounts: discounts
  });
};

module.exports = {
    applyDiscount,
    validateDiscountCode,
    getPublicDiscounts,
    getDiscounts
}