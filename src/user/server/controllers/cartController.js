const cartService = require('../services/cartService');
const AppError = require('../errors');

const getCart = async (req, res) => {
    const userId = req.user._id;

    const cart = await cartService.getOrCreateCart(userId);
    res.status(200).json({
        success: true,
        cart
    });
};

const addToCart = async (req, res) => {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    if (!productId) {
        throw new AppError('Product ID is required', 400);
    }

    const qty = parseInt(quantity) || 1;

    if (qty < 1) {
        throw new AppError('Quantity must be at least 1', 400);
    }

    const cart = await cartService.addToCart(userId, productId, qty);
    res.status(200).json({
        success: true,
        message: 'Item added to cart successfully',
        cart
    });
};

const updateCartItem = async (req, res) => {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    // validate
    if (!quantity || quantity < 1) {
        throw new AppError('Valid quantity is required', 400);
    }

    const cart = await cartService.updateCartItemQuantity(userId, itemId, parseInt(quantity));
    res.status(200).json({
        success: true,
        message: 'Cart item updated successfully',
        cart
    });
}

// DELETE /api/cart/remove/:itemId - Xóa sản phẩm khỏi giỏ hàng
const removeFromCart = async (req, res) => {
    const userId = req.user._id;
    const { itemId } = req.params;

    const cart = await cartService.removeFromCart(userId, itemId);

    res.status(200).json({
        success: true,
        message: 'Item removed from cart successfully',
        cart
    });
};

// DELETE /api/cart/clear - Xóa toàn bộ giỏ hàng
const clearCart = async (req, res) => {
    const userId = req.user._id;

    const cart = await cartService.clearCart(userId);

    res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
        cart
    });
};

// GET /api/cart/count - Lấy số lượng items trong giỏ hàng
const getCartCount = async (req, res) => {
    const userId = req.user._id;

    const count = await cartService.getCartItemCount(userId);

    res.status(200).json({
        success: true,
        count
    });
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartCount
};