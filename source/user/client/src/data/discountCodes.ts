export interface DiscountCode {
  id: string;
  code: string; // 5-character alphanumeric
  discountType: 'percentage' | 'fixed';
  discountValue: number; // percentage (0-100) or fixed amount
  usageLimit: number; // max 10 per requirement
  usedCount: number;
  active: boolean;
  createdAt: string;
  description: string;
}

export const discountCodes: DiscountCode[] = [
  {
    id: "1",
    code: "BOOK5",
    discountType: "percentage",
    discountValue: 15,
    usageLimit: 10,
    usedCount: 3,
    active: true,
    createdAt: "2024-01-01T00:00:00Z",
    description: "15% off any book purchase"
  },
  {
    id: "2",
    code: "NEW25",
    discountType: "fixed",
    discountValue: 5,
    usageLimit: 8,
    usedCount: 2,
    active: true,
    createdAt: "2024-01-05T00:00:00Z",
    description: "$5 off for new customers"
  },
  {
    id: "3",
    code: "SAVE7",
    discountType: "percentage",
    discountValue: 20,
    usageLimit: 5,
    usedCount: 5,
    active: true,
    createdAt: "2024-01-10T00:00:00Z",
    description: "20% off (expired usage limit)"
  },
  {
    id: "4",
    code: "FLASH",
    discountType: "percentage",
    discountValue: 25,
    usageLimit: 10,
    usedCount: 1,
    active: true,
    createdAt: "2024-01-15T00:00:00Z",
    description: "25% flash sale discount"
  }
];

export const validateDiscountCode = (code: string): {
  isValid: boolean;
  discount?: DiscountCode;
  message: string;
} => {
  const discount = discountCodes.find(d => d.code.toLowerCase() === code.toLowerCase());
  
  if (!discount) {
    return { isValid: false, message: "Invalid discount code" };
  }
  
  if (!discount.active) {
    return { isValid: false, message: "This discount code is no longer active" };
  }
  
  if (discount.usedCount >= discount.usageLimit) {
    return { isValid: false, message: "This discount code has reached its usage limit" };
  }
  
  return { 
    isValid: true, 
    discount, 
    message: `Code applied! ${discount.description}` 
  };
};

export const calculateDiscount = (discount: DiscountCode, subtotal: number): number => {
  if (discount.discountType === 'percentage') {
    return subtotal * (discount.discountValue / 100);
  } else {
    return Math.min(discount.discountValue, subtotal); // Don't allow discount to exceed subtotal
  }
};