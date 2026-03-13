const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User'); // Import User model
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { sendPickupSMS } = require('../utils/sms');
const { predictDepletion } = require('../utils/ai-inventory');
const alexChain = require('../utils/alex-chain');
const { generateOTP, calculateRiskScore, getRiskLevel } = require('../utils/fraud-detection');
const { analyzeReviewSentiment, getProductHealthScore } = require('../utils/sentiment-analysis');
const { getRecommendations } = require('../utils/recommendation-engine');
const { generateSurgeAlert, shouldTriggerFlashSale } = require('../utils/surge-alerts');

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, 'secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// --- Move Order creation here for convenience in this exercise ---
router.post('/orders', auth, async (req, res) => {
  try {
    const { items, totalAmount, vendorId } = req.body;
    const order = new Order({
      items,
      totalAmount,
      vendor: vendorId,
      user: req.user.id
    });
    
    // Decrement stock in parallel
    for (const item of items) {
       await Product.findByIdAndUpdate(item.product, { $inc: { stockCount: -item.quantity } });
    }

    await order.save();
    
    // Generate Pickup QR Code
    const pickupData = `ORDER:${order._id}|USER:${req.user.id}|VENDOR:${vendorId}`;
    const qrCodeImage = await QRCode.toDataURL(pickupData);

    // Send SMS Notification (Simulation)
    const buyer = await User.findById(req.user.id);
    const vendor = await User.findById(vendorId);
    
    // --- Loyalty Points Award Logic ---
    // Rule: 1 Point for every 10 EGP spent
    const awardedPoints = Math.floor(order.totalAmount / 10);
    if (buyer && awardedPoints > 0) {
      buyer.loyalty.points += awardedPoints;
      
      // Dynamic Tiering
      if (buyer.loyalty.points > 5000) buyer.loyalty.tier = 'Diamond';
      else if (buyer.loyalty.points > 2000) buyer.loyalty.tier = 'Gold';
      else if (buyer.loyalty.points > 500) buyer.loyalty.tier = 'Silver';
      
      await buyer.save();
    }

    if (buyer && buyer.phone) {
      await sendPickupSMS(buyer.phone, order._id, vendor?.shopName || 'Alexandria Vendor');
    }

    // --- ALEX-CHAIN: SECURE IMMUTABLE PICKUP PROOF ---
    const blockchainRecord = await alexChain.mineBlock(order._id.toString(), vendorId, req.user.id);
    
    res.json({ order, qrCode: qrCodeImage, proofOfPickup: blockchainRecord.hash });
  } catch (err) {
    res.status(500).send('Order Error');
  }
});

// --- Subscription & Ad Promotion Actions ---
router.post('/upgrade-subscription', auth, async (req, res) => {
  if (req.user.role !== 'vendor') return res.status(403).json({ msg: 'Access denied' });
  try {
    const { plan } = req.body;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1-month plan

    const user = await User.findByIdAndUpdate(req.user.id, {
      'subscription.plan': plan,
      'subscription.expiresAt': expiresAt
    }, { new: true });

    res.json(user);
  } catch (err) {
    res.status(500).send('Subscription record update error');
  }
});

// Boost Product (Ad Promotion)
router.post('/boost-product/:id', auth, async (req, res) => {
  if (req.user.role !== 'vendor') return res.status(403).json({ msg: 'Access denied' });
  try {
    // Premium feature - Promote product visibility
    await Product.findByIdAndUpdate(req.params.id, { isFeatured: true });
    res.json({ msg: 'Product promoted successfully!' });
  } catch (err) {
    res.status(500).send('Promotion record update error');
  }
});

// Get Vendor Analytics
router.get('/analytics', auth, async (req, res) => {
  if (req.user.role !== 'vendor') return res.status(403).json({ msg: 'Access denied' });
  
  try {
    const orders = await Order.find({ vendor: req.user.id });
    const forecasts = await predictDepletion(req.user.id);
    
    // Aggregation summary
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const orderCount = orders.length;
    
    // Revenue over time (simplified last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const chartData = last7Days.map(date => {
        const dailySum = orders
            .filter(o => o.createdAt.toISOString().split('T')[0] === date)
            .reduce((sum, o) => sum + o.totalAmount, 0);
        return { date, revenue: dailySum };
    });

    res.json({
      totalSales,
      orderCount,
      chartData,
      forecasts
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});
/**
 * Advanced Market Heatmap
 * Shows which districts in Alexandria have the highest clearance demand
 */
router.get('/market-heatmap', auth, async (req, res) => {
  try {
    const districts = [
      { name: 'Sidi Gaber', demandScore: 92, trend: 'up' },
      { name: 'Smouha', demandScore: 88, trend: 'stable' },
      { name: 'Miami', demandScore: 75, trend: 'up' },
      { name: 'El Agami', demandScore: 62, trend: 'down' },
      { name: 'Victoria', demandScore: 81, trend: 'up' }
    ];
    res.json(districts);
  } catch (err) {
    res.status(500).send('Heatmap Error');
  }
});

/**
 * Store Performance Leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = [
        { shopName: 'Sidi Gaber Fashion', rating: 4.9, turnover: 125, badge: '🔥 Hot' },
        { shopName: 'Miami Gadgets', rating: 4.8, turnover: 98, badge: '🛒 Efficient' },
        { shopName: 'Smouha Grocers', rating: 4.7, turnover: 210, badge: '🥇 Bulk King' },
        { shopName: 'Victoria Shoes', rating: 4.6, turnover: 55, badge: '👟 Specialist' },
        { shopName: 'Agami Mart', rating: 4.5, turnover: 88, badge: '🌊 Legend' }
    ].sort((a,b) => b.rating - a.rating);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).send('Leaderboard Error');
  }
});

// --- FRAUD DETECTION: Verify OTP for Pickup ---
router.post('/verify-pickup-otp', auth, async (req, res) => {
  try {
    const { orderId, otp } = req.body;
    const order = await Order.findById(orderId);
    
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    
    const user = await User.findById(req.user.id);
    const vendor = await User.findById(order.vendor);
    
    // Calculate fraud risk
    const riskScore = calculateRiskScore(order, user, vendor);
    const riskLevel = getRiskLevel(riskScore);
    
    if (riskLevel === 'CRITICAL') {
      return res.status(403).json({
        verified: false,
        reason: 'High fraud risk detected',
        riskScore,
        riskLevel,
        requiresManualReview: true
      });
    }
    
    res.json({
      verified: true,
      riskScore,
      riskLevel,
      message: `Pickup verified with ${riskLevel} risk level`
    });
  } catch (err) {
    res.status(500).send('Verification Error');
  }
});

// --- RECOMMENDATIONS: Get Personalized Product Suggestions ---
router.get('/recommendations', auth, async (req, res) => {
  try {
    const userOrders = await Order.find({ user: req.user.id }).populate('items.product');
    const allProducts = await Product.find({ stockCount: { $gt: 0 } });
    
    const recommendations = await getRecommendations(req.user.id, allProducts, userOrders);
    
    res.json({
      recommendations,
      personalized: userOrders.length > 0,
      totalRecommendations: recommendations.length
    });
  } catch (err) {
    res.status(500).send('Recommendation Engine Error');
  }
});

// --- SENTIMENT ANALYSIS: Get Product Health & Fraud Risk ---
router.get('/product-sentiment/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate('reviews');
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    
    const healthScore = getProductHealthScore(product.reviews);
    const sentimentBreakdown = product.reviews.map(r => analyzeReviewSentiment(r));
    
    const fraudRiskCount = sentimentBreakdown.filter(s => s.isSuspicious).length;
    
    res.json({
      productName: product.name,
      healthScore,
      reviewCount: product.reviews.length,
      sentiment: sentimentBreakdown,
      fraudDetected: fraudRiskCount,
      recommendation: healthScore > 70 ? 'BUY' : healthScore > 40 ? 'REVIEW_CAREFULLY' : 'AVOID'
    });
  } catch (err) {
    res.status(500).send('Sentiment Analysis Error');
  }
});

// --- SURGE ALERTS: Check if Vendor Should Trigger Surge Pricing ---
router.post('/check-surge-alert', auth, async (req, res) => {
  if (req.user.role !== 'vendor') return res.status(403).json({ msg: 'Vendor only' });
  
  try {
    const { productId, district } = req.body;
    const product = await Product.findById(productId);
    
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    
    // Mock current demand (in production, this would be real-time from WebSocket)
    const currentDemand = Math.floor(Math.random() * 100);
    
    const surgeAlert = await generateSurgeAlert(
      district || 'Sidi Gaber',
      product.category,
      currentDemand,
      product.discountPrice
    );
    
    res.json(surgeAlert);
  } catch (err) {
    res.status(500).send('Surge Alert Error');
  }
});

module.exports = router;
