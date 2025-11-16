const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {

        name: { 
            type: String, 
            required: true,
            trim: true,
            maxlength: 200
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        author: {
            type: String,
            required: true,
            trim: true
        },
        publisher: {
            type: String,
            trim: true
        },
        publicationDate: {
            type: Date,
            required: false
        },
        bookLanguage: {
            type: String,
            required: false,
            trim: true
        },
        pages: {
            type: Number,
            min: 0
        },
        description: { 
            type: String, 
            required: true,
            trim: true
        },
        price: { 
            type: Number, 
            required: true,
            min: 0
        },
        originalPrice: { // Giá gốc (trước khi giảm giá)
            type: Number,
            min: 0
        },
        stock: { 
            type: Number, 
            default: 0,
            min: 0
        },
        sold: { // Số lượng đã bán
            type: Number,
            default: 0,
            min: 0
        },
        category: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Category",
            required: true
        },
        discount: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Discount" 
        },
        images: {
            type: [String],
            validate: {
                validator: function(v) {
                    return v && v.length > 0; // Phải có ít nhất 1 ảnh
                },
                message: 'Product must have at least one image'
            }
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        reviewCount: {
            type: Number,
            default: 0,
            min: 0
        },
        newProduct: { 
            type: Boolean, 
            default: false
        },
        isBestseller: { 
            type: Boolean, 
            default: false
        },
        isFlashSale: { 
            type: Boolean, 
            default: false
        },
        isActive: {
            type: Boolean,
            default: true
        },
        tags: [{ 
            type: String,
            trim: true,
            lowercase: true
        }],
        specifications: {
            language: String,
            pages: Number,
            format: String, // Paperback, Hardcover, Ebook
            isbn: String,
            weight: Number,
            dimensions: String
        },
        flashSaleEndTime: { type: Date },
        flashSalePrice: { type: Number },
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

// Indexes để tối ưu tìm kiếm
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ sold: -1 }); // Sắp xếp theo bán chạy
productSchema.index({ rating: -1 }); // Sắp xếp theo đánh giá
productSchema.index({ createdAt: -1 }); // Sắp xếp theo mới nhất
productSchema.index({ name: 'text', author: 'text', description: 'text' }); // Full-text search

// Virtual: Tính % giảm giá
productSchema.virtual('discountPercentage').get(function() {
    if (this.originalPrice && this.price < this.originalPrice) {
        return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    }
    return 0;
});

// Virtual: Kiểm tra còn hàng
productSchema.virtual('inStock').get(function() {
    return this.stock > 0;
});

// Virtual: Giá sau khi giảm (nếu có discount)
productSchema.virtual('finalPrice').get(function() {
    // Nếu có discount, tính giá sau giảm
    // Logic này sẽ được implement khi có Discount model
    return this.price;
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;