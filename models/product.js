const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
  },
  {
    timestamps: true, // Kích hoạt timestamps
  }
);

module.exports = mongoose.model('Product', ProductSchema);
