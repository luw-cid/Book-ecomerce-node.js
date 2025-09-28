const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "OrderItem" }],
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["pending", "paid", "shipped", "delivered", "cancelled"], 
    default: "pending" 
  },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
