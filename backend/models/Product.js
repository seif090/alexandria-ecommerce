const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  discountPrice: { type: Number, required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  expiryDate: { type: Date }, // Especially for supermarkets and restaurants
  stockCount: { type: Number, default: 0 },
  images: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  dealExpiresAt: { type: Date }, // Time-limited clearance
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
