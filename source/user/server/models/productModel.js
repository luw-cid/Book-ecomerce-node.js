const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: String,
        price: { type: Number, required: true },
        stock: { type: Number, default: 0 },
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
        discount: { type: mongoose.Schema.Types.ObjectId, ref: "Discount" },
        images: [String],      
        isNew: { type: Boolean, default: false},
        isBestseller: { type: Boolean, default: false},
        isFlashSale: { type: Boolean, default: false},
        tags: [{ type: String}], 
    },
    {timestamps: true}
)

const Product = mongoose.model("Product", productSchema);

module.exports = Product;