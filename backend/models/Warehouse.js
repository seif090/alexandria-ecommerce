const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  
  // Location
  address: {
    street: String,
    city: { type: String, required: true },
    state: String,
    zipCode: String,
    country: { type: String, default: 'Egypt' },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Capacity
  totalCapacity: { type: Number, required: true },
  usedCapacity: { type: Number, default: 0 },
  activeOrders: { type: Number, default: 0 },
  
  // Operations
  isActive: { type: Boolean, default: true },
  operatingHours: {
    mondayFriday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  
  // Contact
  manager: String,
  email: String,
  phone: String,
  
  // Performance
  averageProcessingTime: { type: Number, default: 0 }, // In hours
  shippingPartners: [String],
  
  // Stock Management
  lowStockAlert: { type: Number, default: 10 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

warehouseSchema.index({ 'address.city': 1 });

module.exports = mongoose.model('Warehouse', warehouseSchema);
