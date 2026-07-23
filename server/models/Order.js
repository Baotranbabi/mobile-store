const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    name: String,
    image: String,
    price: Number,
    quantity: Number,
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, unique: true },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    customerInfo: {
      fullName: String,
      phone: String,
      email: String,
      address: String,
    },
    items: [orderItemSchema],
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "BANK"],
      default: "COD",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
