const discountModel = require('../models/discountModel');
const orderModel = require('../models/orderModel');

const canUserUseDiscount = async (discount, userId) => {
    if (discount.applicableUsers.length > 0) {
        const isApplicable = discount.applicableUsers.some(u => u.toString() === userId.toString());

        if (!isApplicable) {
            return false;
        }
    }

    if (discount.perUserLimit > 0) {
        const userUsageCount = await orderModel.countDocuments({
            user: userId,
            'discount.code': discount.code
        });

        if (userUsageCount >= discount.perUserLimit) {
            return false;
        }
    }

    if (discount.firstTimeOnly) {
        const orderCount = await orderModel.countDocuments({ user: userId });
        if (orderCount > 0) {
            return false;
        }
    }
    
    return true;
};

const validateDiscount = async (code, userId = null) => {
    const discount = await discountModel.findOne({
        code: code.toUpperCase()
    });

    if (!discount) {
        throw new Error('Invalid discount code');
    }
    if (!discount.isActive) {
        throw new Error('This discount code is no longer active');
    }
    // check dates
    const now = new Date();
    if (now < discount.startAt) {
        throw new Error('This discount code is not yet valid');
    }

    if (now > discount.expiresAt) {
        throw new Error('This discount code has expired');
    }
    //check usage limit
    if (discount.usageLimit !== null && discount.usageCount >= discount.usageLimit) {
        throw new Error('This discount code has reached its usage limit');
    }

    // check user-specific restrictions
    if(userId) {
        const canUse = await canUserUseDiscount(discount, userId);
        if (!canUse) {
            throw new Error('You are not eligible to use this discount code');
        }
    }

    return discount;
};

const isApplicableToCart = async (discount, cartItems) => {
    if (discount.applicableCategories.length === 0 && discount.applicableProducts.length === 0) {
        return true;
    }

    return cartItems.some( item => {
        if (discount.applicableProducts.length > 0) {
            const isApplicable = discount.applicableProducts.some( p => p.toString() === item.product._id.toString());
            if (isApplicable) return true;
        }

        if (discount.applicableCategories.length > 0) {
            const isApplicable = discount.applicableCategories.some( c => c.toString() === item.product.category.toString());
            if(isApplicable) return true;
        }
        return false;
    });
};

const calculateDiscountAmount = (discount, subtotal) => {
    if (subtotal < discount.minOrderAmount) {
        throw new Error(`Minimun order amount is $${ discount.minOrderAmount}`);
    }

    let discountAmount = 0;

    // tính dựa trên type
    if (discount.discountType === 'percentage') {
        discountAmount = (subtotal * discount.percentage) / 100;
    } else if (discount.discountType === 'fixed') {
        discountAmount = discount.fixedAmount;
    }

    // apply max discount limit (nếu có)
    if (discount.maxDiscountAmount && discountAmount > discount.maxDiscountAmount) {
        discountAmount = discount.maxDiscountAmount;
    }

    // đảm bảo discount không vượt quá subtotal
    if (discountAmount > subtotal) {
        discountAmount = subtotal;
    }

    return Math.round(discountAmount * 100) / 100;
};

const applyDiscountToCart = async (code, subtotal, userId = null) => {
    const discount = await validateDiscount(code, userId);

    const discountAmount = calculateDiscountAmount(discount, subtotal);

    // tính final total
    const finalTotal = subtotal - discountAmount;

    return {
      success: true,
      discount: {
        _id: discount._id,
        code: discount.code,
        name: discount.name,
        type: discount.discountType,
        value: discount.discountType === 'percentage' 
          ? discount.percentage 
          : discount.fixedAmount,
        amount: discountAmount,
        minOrderAmount: discount.minOrderAmount,
        maxDiscountAmount: discount.maxDiscountAmount
      },
      subtotal,
      discountAmount,
      total: finalTotal
    };
}

const getPublicDiscounts = async () =>{
    const now = new Date();
    return await discountModel.find({
        isActive: true,
        isPublic: true,
        startAt: { $lte: now },
        expiresAt: { $gte: now},
        $or: [
            { usageLimit: null},
            { $expr: { $lt: ['$usageCount', '$usageLimit']}}
        ]
    }).sort({ createdAt: -1})
    .limit(10);
};

const getActiveDiscounts = async () => {
    const now = new Date();
    return await discountModel.find({
        isActive: true,
        isPublic: true,
        startAt: { $lte: now},
        $or: [
            { expiresAt: { $gte: now } },
            { expiresAt: null }
        ]
    }).sort({ createdAt: -1 });
};

/**
 * Increment discount usage count
 * Gọi sau khi order được tạo thành công
 */
const incrementUsage = async (code) => {
  try {
    await discountModel.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usageCount: 1 } }
    );
  } catch (error) {
    throw error;
  }
};

module.exports = {
    validateDiscount,
    canUserUseDiscount,
    calculateDiscountAmount,
    applyDiscountToCart,
    getActiveDiscounts,
    incrementUsage,
    getPublicDiscounts
}


