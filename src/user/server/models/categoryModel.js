const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, require: true, unique: true, trim: true},
        description: { type: String, required: true }, 
        image: { type: String, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);
// Index để tìm kiếm nhanh hơn
categorySchema.index({ isActive: 1 });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
