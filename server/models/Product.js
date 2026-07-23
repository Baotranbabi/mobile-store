const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productCode: { type: String, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    images: [{ type: String }],
    description: { type: String },
    specs: {
      screen: String,
      ram: String,
      storage: String,
      battery: String,
      camera: String,
    },
    isFeatured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
