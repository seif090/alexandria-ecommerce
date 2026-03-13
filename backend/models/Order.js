const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  
  // Customer
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  
  // Items
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    _id: false
  }],
  
  // Fulfillment
  status: {
    type: String,
    enum: ['pending', 'processing', 'packed', 'shipped', 'delivered', 'returned'],
    default: 'pending'
  },
  fulfillmentStatuses: [{
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    status: String,
    timestamp: Date,
    _id: false
  }],
  
  // Warehouse & Shipping
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  
  shipping: {
    carrier: String,
    trackingNumber: String,
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date,
    shippingCost: Number,
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  
  // Payment
  totalAmount: { type: Number, required: true },
  subtotal: Number,
  shippingFee: Number,
  tax: Number,
  discount: Number,
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: String,
  
  // Refund & Returns
  refund: {
    status: { type: String, enum: ['none', 'requested', 'approved', 'rejected', 'completed'] },
    reason: String,
    amount: Number,
    requestedAt: Date,
    approvedAt: Date,
    completedAt: Date
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  // Additional Info
  notes: String,
  internalNotes: String
});

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'items.vendor': 1 });
orderSchema.index({ createdAt: -1 });

orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
