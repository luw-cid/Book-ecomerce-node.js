const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  percentage: { type: Number, min: 0, max: 100 },
  expiresAt: Date,
}, { timestamps: true });

module.exports = mongoose.model("Discount", discountSchema);
