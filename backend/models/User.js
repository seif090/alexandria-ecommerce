const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'vendor', 'admin'], default: 'user' },
  shopName: { type: String }, // For vendors
  category: { type: String }, // For vendors (fashions, electronics, etc.)
  subscription: {
    plan: { type: String, enum: ['free', 'premium', 'pro'], default: 'free' },
    expiresAt: { type: Date }
  },
  shopLogo: { type: String },
  shopDescription: { type: String },
  loyalty: {
    points: { type: Number, default: 0 },
    tier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Diamond'], default: 'Bronze' },
    referralCode: { type: String, unique: true, sparse: true }
  },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
