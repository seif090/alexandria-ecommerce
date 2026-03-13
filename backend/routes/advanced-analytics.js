const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const { authenticate, authorize } = require('../middleware/rbac');

/**
 * GET /api/analytics/metrics
 * Get real-time analytics metrics
 */
router.get('/metrics', authenticate, authorize('admin', 'vendor', 'support'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const query = req.userRole === 'vendor' 
      ? { 'items.vendor': req.vendorId, createdAt: { $gte: today } }
      : { createdAt: { $gte: today } };

    const orders = await Order.find(query);
    
    const metrics = {
      totalSales: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      totalRevenue: orders.reduce((sum, order) => {
        return sum + (order.paymentStatus === 'completed' ? order.totalAmount : 0);
      }, 0),
      totalOrders: orders.length,
      totalCustomers: new Set(orders.map(o => o.user.toString())).size,
      timestamp: new Date()
    };

    res.json([
      { label: 'Sales', value: metrics.totalSales, change: 12.5, trend: 'up', icon: '📊', color: 'cyan' },
      { label: 'Revenue', value: metrics.totalRevenue, change: 8.2, trend: 'up', icon: '💰', color: 'green' },
      { label: 'Orders', value: metrics.totalOrders, change: -3.1, trend: 'down', icon: '📦', color: 'yellow' },
      { label: 'Customers', value: metrics.totalCustomers, change: 5.4, trend: 'up', icon: '👥', color: 'purple' }
    ]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/sales/trends
 * Get sales trend data for charts
 */
router.get('/sales/trends', authenticate, authorize('admin', 'vendor', 'support'), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query = req.userRole === 'vendor' 
      ? { 'items.vendor': req.vendorId, createdAt: { $gte: startDate } }
      : { createdAt: { $gte: startDate } };

    const orders = await Order.find(query).sort({ createdAt: 1 });

    // Group by date
    const trends = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!trends[date]) {
        trends[date] = 0;
      }
      trends[date] += order.paymentStatus === 'completed' ? order.totalAmount : 0;
    });

    const data = Object.entries(trends).map(([date, amount]) => ({
      date,
      sales: amount
    }));

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/revenue/breakdown
 * Get revenue breakdown by source
 */
router.get('/revenue/breakdown', authenticate, authorize('admin', 'vendor', 'support'), async (req, res) => {
  try {
    const query = req.userRole === 'vendor' 
      ? { 'items.vendor': req.vendorId }
      : {};

    const orders = await Order.find(query)
      .populate('items.vendor', 'shopName')
      .lean();

    // Group by vendor/source
    const breakdown = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const source = item.vendor?.shopName || 'Direct';
        if (!breakdown[source]) {
          breakdown[source] = 0;
        }
        if (order.paymentStatus === 'completed') {
          breakdown[source] += item.price * item.quantity;
        }
      });
    });

    const data = Object.entries(breakdown)
      .map(([source, amount]) => ({ name: source, value: amount }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/products/top
 * Get top performing products
 */
router.get('/products/top', authenticate, authorize('admin', 'vendor', 'support'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    
    const query = req.userRole === 'vendor' 
      ? { 'items.vendor': req.vendorId }
      : {};

    const orders = await Order.find(query)
      .populate('items.product', 'name images price')
      .lean();

    const productStats = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product._id.toString();
        if (!productStats[productId]) {
          productStats[productId] = {
            name: item.product.name,
            sales: 0,
            revenue: 0,
            quantity: 0,
            image: item.product.images?.[0]
          };
        }
        if (order.paymentStatus === 'completed') {
          productStats[productId].sales++;
          productStats[productId].revenue += item.price * item.quantity;
          productStats[productId].quantity += item.quantity;
        }
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/search
 * Advanced search and filtering
 */
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q, filters } = req.query;
    let query = {};

    if (q) {
      query.orderNumber = { $regex: q, $options: 'i' };
    }

    if (filters) {
      const filterObj = JSON.parse(filters);
      if (filterObj.status) query.status = filterObj.status;
      if (filterObj.minAmount) query.totalAmount = { $gte: filterObj.minAmount };
      if (filterObj.maxAmount) {
        query.totalAmount = { ...query.totalAmount, $lte: filterObj.maxAmount };
      }
    }

    if (req.userRole === 'vendor') {
      query['items.vendor'] = req.vendorId;
    }

    const results = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.vendor', 'shopName')
      .lean()
      .limit(50);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
