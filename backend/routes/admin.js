const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { generateDemoData } = require('../scripts/seed-demo-data');

// Simple auth for admin
const adminAuth = (req, res, next) => {
  const adminKey = req.header('x-admin-key');
  if (adminKey === 'alex-admin-2026-secret') {
    next();
  } else {
    res.status(401).json({ msg: 'Unauthorized - Invalid admin key' });
  }
};

// --- SEED DEMO DATA ---
router.post('/seed-demo-data', adminAuth, async (req, res) => {
  try {
    const result = await generateDemoData(User, Product, Order, Review);
    res.json({
      success: true,
      message: 'Demo data seeded successfully!',
      stats: {
        vendors: result.createdVendors.length,
        customers: result.createdCustomers.length,
        products: result.createdProducts.length,
        orders: result.createdOrders.length,
        reviews: result.createdReviews.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN ANALYTICS DASHBOARD ---
router.get('/admin-stats', adminAuth, async (req, res) => {
  try {
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({ stockCount: { $lt: 10 } });
    
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    
    // Revenue analytics
    const allOrders = await Order.find();
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;
    
    // Top vendors by sales
    const topVendors = await Order.aggregate([
      { $group: { _id: '$vendor', totalSales: { $sum: '$totalAmount' }, orderCount: { $sum: 1 } } },
      { $sort: { totalSales: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'vendorInfo' } }
    ]);

    // Product performance
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productInfo' } }
    ]);

    // Recent activity
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10).populate('user vendor');
    const totalReviews = await Review.countDocuments();
    const avgRating = await Review.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    res.json({
      overview: {
        totalVendors,
        totalCustomers,
        totalProducts,
        lowStockProducts
      },
      orders: {
        totalOrders,
        completedOrders,
        processingOrders,
        pendingOrders: totalOrders - completedOrders - processingOrders
      },
      revenue: {
        totalRevenue: totalRevenue.toFixed(2),
        avgOrderValue: avgOrderValue.toFixed(2),
        ordersProcessed: completedOrders
      },
      quality: {
        totalReviews,
        avgRating: avgRating && avgRating[0] ? avgRating[0].avgRating.toFixed(1) : 0
      },
      topVendors: topVendors.slice(0, 5),
      topProducts: topProducts.slice(0, 10),
      recentOrders: recentOrders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- EXPORT DATA ---
router.get('/export-orders-csv', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().populate('user vendor items.product');
    
    let csv = 'Order ID,Customer,Vendor,Items,Total,Status,Date\n';
    orders.forEach(order => {
      const items = order.items.map(i => `${i.quantity}x ${i.product.name}`).join(';');
      const row = [
        order._id,
        order.user.name,
        order.vendor.shopName,
        `"${items}"`,
        order.totalAmount,
        order.status,
        new Date(order.createdAt).toLocaleDateString()
      ].join(',');
      csv += row + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SYSTEM HEALTH CHECK ---
router.get('/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    
    res.json({
      status: 'OK',
      database: dbStatus,
      dataPoints: { users: userCount, products: productCount },
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', error: err.message });
  }
});

module.exports = router;
