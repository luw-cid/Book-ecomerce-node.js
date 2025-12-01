/**
 * Format số thành tiền VND
 * @param amount - Số tiền (có thể là number hoặc string)
 * @returns Chuỗi đã format (VD: "250.000 ₫")
 */
export function formatVND(amount: number | string | undefined | null): string {
    // Handle edge cases
    if (amount === undefined || amount === null) return '₫0';

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    // Check if valid number
    if (isNaN(numAmount)) return '₫0';

    // Format: Add thousand separators + VND symbol
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0, // VND không có xu
        maximumFractionDigits: 0
    }).format(numAmount);
}

/**
 * Convert USD sang VND (nếu backend vẫn trả USD)
 * Tỷ giá mặc định: 1 USD = 24,000 VND
 */
export function convertUSDtoVND(usdAmount: number, exchangeRate: number = 24000): number {
    return Math.round(usdAmount * exchangeRate);
}