const cartModel = require('../models/cartModel');
const cartItemModel = require('../models/cartItemModel');
const productModel = require('../models/productModel');

const getOrCreateCart = async (userId) => {
    let cart = await cartModel.findOne({ user: userId})
        .populate({
            path: 'items',
            populate: {
                path: 'product',
                select: 'name author price images stock'
            }
        });
    if (!cart) {
        cart = new cartModel({
            user: userId,
            items: [],
            totalItems: 0,
            totalPrice: 0,
        })
        await cart.save();
    }
    return cart;
};

const calculateCartTotals = async (cartId) => {
    const cart = await cartModel.findById(cartId).populate('items');

    if (!cart) return null;

    let totalItems = 0;
    let totalPrice = 0;

    for (const item of cart.items) {
        const cartItem = await cartItemModel.findById(item._id);
        if (cartItem) {
            totalItems += cartItem.quantity;
            totalPrice += cartItem.price * cartItem.quantity;
        }
    }

    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;
    await cart.save();

    return cart;
}

const addToCart = async (userId, productId, quantity = 1) => {
    // Lấy hoặc tạo cart
    const cart = await getOrCreateCart(userId);

    // Check sp tồn tại chưa
    const product = await productModel.findById(productId);
    if (!product) {
        throw new Error('Product not found');
    }

    // Check stock
    if (product.stock < quantity) {
        throw new Error('Not enough stock');
    }

    // Check sp có trong cart chưa
    const existingItemIndex = cart.items.findIndex(item =>
        item.product && item.product.toString() === productId.toString()
    )

    let cartItem;

    if (existingItemIndex > -1) {
        // Sp đã có trong cart -> update quantity
        cartItem = await cartItemModel.findById(cart.items[existingItemIndex]);
        if (!cartItem) {
            throw new Error('Cart item not found');
        }

        const newQuantity = cartItem.quantity + quantity;

        // check stock cho số lượng mới
        if (product.stock < newQuantity) {
            throw new Error('Not enough stock');
        }

        cartItem.quantity = newQuantity;
        await cartItem.save();
    } else {
        // Sp chưa có -> tạo mới CartItem
        cartItem = new cartItemModel({
            cart: cart._id,
            product: productId,
            quantity: quantity,
            price: product.price
        })
        await cartItem.save();

        cart.items.push(cartItem._id);
        await cart.save();
    }

    // Tính lại tổng
    await calculateCartTotals(cart._id);
    return await getOrCreateCart(userId); 
};

// update product quantity in cart
const updateCartItemQuantity = async (userId, cartItemId, quantity) => {
    // Validate quantity
    if (quantity < 1) {
        throw new Error('Quantity must be at least 1');
    }

    const cart = await getOrCreateCart(userId);

    // Tìm CartItem 
    const cartItem = await cartItemModel.findById(cartItemId).populate('product');

    if(!cartItem) {
        throw new Error('Cart item not found')
    };

    // Check cartItem có thuộc cart của user không
    if (cartItem.cart.toString() !== cart._id.toString()) {
        throw new Error('Unauthorized');
    }

    // check stock
    if (cartItem.product.stock < quantity) {
        throw new Error('Not enough stock');
    }

    // update quantity
    cartItem.quantity = quantity;
    await cartItem.save();
    
    await calculateCartTotals(cart._id);

    return await getOrCreateCart(userId);
}

//  remove product from cart
const removeFromCart = async (userId, cartItemId) => {
    const cart = await getOrCreateCart(userId);

    const cartItem = await cartItemModel.findById(cartItemId);

    if (!cartItem) {
        throw new Error('Cart item not found');
    }
    // Checl quyền
    if (cartItem.cart.toString() !== cart._id.toString()) {
        throw new Error('Unauthorized');
    }

    // Remove CartItem(cartItemModel) khỏi Cart.items(cartModel)
    cart.items = cart.items.filter(
        item => item.toString() !== cartItemId.toString()
    );
    await cart.save();

    // remove CartItem
    await cartItemModel.findByIdAndDelete(cartItemId);

    // Tính tổng lại
    await calculateCartTotals(cart._id);

    return await getOrCreateCart(userId);
};

// Remove all product from cart
const clearCart = async (userId) => {
    const cart = await getOrCreateCart(userId);
    await cartItemModel.deleteMany({ cart: cart._id});

    // Reset cart
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    await cart.save();

    return cart;
}

// get item quantity in cart
const getCartItemCount = async (userId) => {
    const cart = await cartModel.findOne({ user: userId });
    return cart ? cart.totalItems : 0;
}

module.exports = {
    getOrCreateCart,
    calculateCartTotals,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    getCartItemCount
};