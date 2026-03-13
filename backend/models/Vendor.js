const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  shopName: { type: String, required: true },
  shopDescription: { type: String },
  shopLogo: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  
  // Address
  address: {
    street: String,
    city: { type: String, required: true },
    state: String,
    zipCode: String,
    country: { type: String, default: 'Egypt' }
  },
  
  // Commission & Payment
  commissionTier: { 
    type: String, 
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], 
    default: 'Bronze'
  },
  commissionRate: { 
    type: Number, 
    default: 10 // Percentage
  },
  bankAccount: {
    accountHolder: String,
    accountNumber: String,
    bankName: String,
    iban: String
  },
  
  // Status & Verification
  status: {
    type: String,
    enum: ['active', 'pending', 'suspended', 'rejected'],
    default: 'pending'
  },
  verificationStatus: {
    kyc: { type: Boolean, default: false },
    businessLicense: { type: Boolean, default: false },
    bankVerified: { type: Boolean, default: false }
  },
  suspensionReason: String,
  
  // Performance Metrics
  performance: {
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    deliveryRate: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 }, // In hours
    returnRate: { type: Number, default: 0 },
    cancelRate: { type: Number, default: 0 }
  },
  
  // Financial
  totalEarnings: { type: Number, default: 0 },
  monthlyEarnings: { type: Number, default: 0 },
  pendingPayout: { type: Number, default: 0 },
  lastPayoutDate: Date,
  
  // Products
  totalProducts: { type: Number, default: 0 },
  activeProducts: { type: Number, default: 0 },
  
  // Permissions
  permissions: [{ type: String }],
  customPermissions: {
    canCreateProducts: { type: Boolean, default: true },
    canViewAnalytics: { type: Boolean, default: true },
    canManageOrders: { type: Boolean, default: true },
    canProcessRefunds: { type: Boolean, default: false },
    canExportData: { type: Boolean, default: false }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

vendorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Vendor', vendorSchema);
