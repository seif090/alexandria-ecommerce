const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Order = require('../models/Order');
const { authenticate, authorize, hasPermission, ownsResource } = require('../middleware/rbac');

/**
 * GET /api/vendors
 * Get list of vendors (admin) or own vendor (vendor)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    let query = { status: 'active' };
    
    if (req.userRole === 'admin') {
      // Admin can filter all vendors
      if (req.query.status) query.status = req.query.status;
      
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const vendors = await Vendor.find(query)
        .select('-bankAccount')
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

      const total = await Vendor.countDocuments(query);

      return res.json({
        data: vendors,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } else if (req.userRole === 'vendor') {
      // Vendor sees only their own profile
      const vendor = await Vendor.findOne({ userId: req.userId });
      if (!vendor) {
        return res.status(404).json({ error: 'Vendor profile not found' });
      }
      return res.json([vendor]);
    }

    res.status(403).json({ error: 'Access denied' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/vendors/:id
 * Get vendor by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .select('-bankAccount -customPermissions')
      .lean();

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Get vendor metrics
    const orders = await Order.countDocuments({ 'items.vendor': vendor._id });
    const revenue = await Order.aggregate([
      { $match: { 'items.vendor': vendor._id, paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    vendor.stats = {
      totalOrders: orders,
      totalRevenue: revenue[0]?.total || 0
    };

    res.json(vendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/vendors
 * Create new vendor (admin only)
 */
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { userId, shopName, email, city, commissionTier } = req.body;

    const newVendor = new Vendor({
      userId,
      shopName,
      email,
      address: { city },
      commissionTier: commissionTier || 'Bronze',
      commissionRate: getCommissionRate(commissionTier),
      permissions: ['view_own_analytics', 'manage_own_products', 'view_own_orders']
    });

    await newVendor.save();
    res.status(201).json(newVendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/vendors/:id
 * Update vendor (admin or vendor own profile)
 */
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Check authorization
    if (req.userRole === 'vendor' && vendor.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update allowed fields
    if (req.body.shopName) vendor.shopName = req.body.shopName;
    if (req.body.shopDescription) vendor.shopDescription = req.body.shopDescription;
    if (req.body.address) vendor.address = { ...vendor.address, ...req.body.address };
    if (req.body.shopLogo) vendor.shopLogo = req.body.shopLogo;

    // Admin only updates
    if (req.userRole === 'admin') {
      if (req.body.status) vendor.status = req.body.status;
      if (req.body.commissionTier) vendor.commissionTier = req.body.commissionTier;
      if (req.body.verificationStatus) vendor.verificationStatus = { ...vendor.verificationStatus, ...req.body.verificationStatus };
    }

    await vendor.save();
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/vendors/:id/commission
 * Update vendor commission tier (admin only)
 */
router.patch('/:id/commission', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { tier } = req.body;
    const validTiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];

    if (!validTiers.includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    vendor.commissionTier = tier;
    vendor.commissionRate = getCommissionRate(tier);
    await vendor.save();

    res.json({ message: 'Commission updated', vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/vendors/:id/permissions
 * Update vendor permissions (admin only)
 */
router.patch('/:id/permissions', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { permissions, customPermissions } = req.body;

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    if (permissions) vendor.permissions = permissions;
    if (customPermissions) vendor.customPermissions = { ...vendor.customPermissions, ...customPermissions };

    await vendor.save();
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/vendors/:id/suspend
 * Suspend vendor (admin only)
 */
router.patch('/:id/suspend', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { reason } = req.body;

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    vendor.status = 'suspended';
    vendor.suspensionReason = reason;
    await vendor.save();

    res.json({ message: 'Vendor suspended', vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/vendors/:id/performance
 * Get vendor performance metrics
 */
router.get('/:id/performance', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Calculate performance metrics
    const orders = await Order.find({ 'items.vendor': vendor._id });
    const completedOrders = orders.filter(o => o.status === 'delivered');
    const returnedOrders = orders.filter(o => o.status === 'returned');
    const cancelledOrders = orders.filter(o => o.refund?.status === 'completed');

    const performance = {
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      returnedOrders: returnedOrders.length,
      cancelledOrders: cancelledOrders.length,
      deliveryRate: orders.length ? (completedOrders.length / orders.length * 100).toFixed(2) : 0,
      returnRate: orders.length ? (returnedOrders.length / orders.length * 100).toFixed(2) : 0,
      cancelRate: orders.length ? (cancelledOrders.length / orders.length * 100).toFixed(2) : 0,
      averageRating: vendor.performance.averageRating,
      responseTime: vendor.performance.responseTime // in hours
    };

    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper: Get commission rate by tier
 */
function getCommissionRate(tier) {
  const rates = {
    'Bronze': 10,
    'Silver': 12,
    'Gold': 15,
    'Platinum': 18
  };
  return rates[tier] || 10;
}

module.exports = router;
