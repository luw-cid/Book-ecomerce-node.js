/**
 * Format number to Vietnamese currency (VND)
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND'
  });
};

/**
 * Format number to VND without currency symbol
 * @param amount - The amount to format
 * @returns Formatted number string
 */
export const formatNumber = (amount: number): string => {
  return amount.toLocaleString('vi-VN');
};
