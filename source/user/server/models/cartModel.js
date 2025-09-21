const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "CartItem" }],
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);
