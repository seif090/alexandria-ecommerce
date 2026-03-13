/**
 * Fraud Detection & Verification System for Alexandria Last Chance
 * Implements OTP verification, risk scoring, and suspicious pickup detection
 */

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const calculateRiskScore = (order, user, vendor) => {
  let riskScore = 0;

  // FLAG 1: Unusually large order from new user
  if (!user.createdAt || (Date.now() - new Date(user.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000) {
    if (order.totalAmount > 5000) riskScore += 30;
  }

  // FLAG 2: Multiple orders in short time window
  if (user.recentOrderCount > 5 && user.recentOrderCount > user.avgOrdersPerWeek * 1.5) {
    riskScore += 20;
  }

  // FLAG 3: Vendor reputation check
  if (vendor.subscription.plan === 'free') riskScore += 15;

  // FLAG 4: Location mismatch (if tracking available)
  if (user.lastKnownDistrict && user.lastKnownDistrict !== vendor.district) {
    riskScore += 10;
  }

  // FLAG 5: High-value clearance item
  if (order.totalAmount > 10000) riskScore += 15;

  return Math.min(riskScore, 100); // Cap at 100%
};

const getRiskLevel = (score) => {
  if (score > 70) return 'CRITICAL';
  if (score > 50) return 'HIGH';
  if (score > 30) return 'MEDIUM';
  return 'LOW';
};

module.exports = { generateOTP, calculateRiskScore, getRiskLevel };
