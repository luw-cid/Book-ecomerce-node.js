const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
    {
        cart: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Cart', 
            required: true 
        },
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product', 
            required: true 
        },
        quantity: { 
            type: Number, 
            required: true, 
            min: 1,
            default: 1
        },
        price: { 
            type: Number, 
            required: true,
            min: 0
        }
    },
    { timestamps: true }
);

cartItemSchema.index({ cart: 1 });
cartItemSchema.index({ product: 1 });

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem;
