const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  method: { type: String, enum: ["credit_card", "paypal", "cod"], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
