const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
    {
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true,
            unique: true // Mỗi user chỉ có 1 cart
        },
        items: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "CartItem" 
        }],
        totalItems: {
            type: Number,
            default: 0
        },
        totalPrice: {
            type: Number,
            default: 0
        }
    }, 
    { timestamps: true }
);

// Virtual để tính tổng (nếu không lưu totalPrice)
cartSchema.virtual('itemCount').get(function() {
    return this.items.length;
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
