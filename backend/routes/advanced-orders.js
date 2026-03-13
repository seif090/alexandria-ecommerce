const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Warehouse = require('../models/Warehouse');
const Vendor = require('../models/Vendor');
const { authenticate, authorize } = require('../middleware/rbac');

/**
 * GET /api/orders
 * Get orders with filtering and pagination
 */
router.get('/', authenticate, async (req, res) => {
  try {
    let query = {};

    // Role-based filtering
    if (req.userRole === 'vendor') {
      query['items.vendor'] = req.vendorId;
    } else if (req.userRole === 'customer') {
      query.user = req.userId;
    }

    // Status filtering
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.vendor', 'shopName')
      .populate('items.product', 'name images price')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.json({
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/orders/:id
 * Get order details
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.vendor', 'shopName email phone')
      .populate('items.product', 'name images price')
      .populate('warehouse', 'name city');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization
    if (req.userRole === 'vendor' && !order.items.some(item => item.vendor._id.toString() === req.vendorId.toString())) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.userRole === 'customer' && order.user._id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/orders
 * Create new order
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    const order = new Order({
      user: req.userId,
      items,
      totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      shipping: { shippingAddress },
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Auto-assign warehouse based on shipping address
    const warehouse = await Warehouse.findOne({ 'address.city': shippingAddress.city });
    if (warehouse) {
      order.warehouse = warehouse._id;
      warehouse.activeOrders += 1;
      await warehouse.save();
    }

    await order.save();

    // Emit real-time event via app's io instance
    const io = req.app.get('io');
    if (io) {
      io.emit('order:created', order);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/orders/:id/status
 * Update order status
 */
router.patch('/:id/status', authenticate, authorize('admin', 'vendor', 'support'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'packed', 'shipped', 'delivered', 'returned'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check vendor authorization
    if (req.userRole === 'vendor') {
      const hasAccess = order.items.some(item => item.vendor.toString() === req.vendorId.toString());
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const oldStatus = order.status;
    order.status = status;

    // Add fulfillment status record
    if (!order.fulfillmentStatuses) {
      order.fulfillmentStatuses = [];
    }

    // Get vendor for this update
    let vendorId = null;
    if (req.userRole === 'vendor') {
      const vendor = await Vendor.findOne({ userId: req.userId });
      vendorId = vendor._id;
    }

    order.fulfillmentStatuses.push({
      vendor: vendorId,
      status: `${oldStatus} → ${status}`,
      timestamp: new Date()
    });

    // Update warehouse if status is delivered
    if (status === 'delivered' && order.warehouse) {
      const warehouse = await Warehouse.findById(order.warehouse);
      if (warehouse && warehouse.activeOrders > 0) {
        warehouse.activeOrders -= 1;
        await warehouse.save();
      }
    }

    await order.save();

    // Emit real-time event via app's io instance
    const io = req.app.get('io');
    if (io) {
      io.emit('order:updated', { orderId: order._id, status, timestamp: new Date() });
    }

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/orders/:id/shipping
 * Update shipping information
 */
router.patch('/:id/shipping', authenticate, authorize('admin', 'support'), async (req, res) => {
  try {
    const { carrier, trackingNumber, estimatedDeliveryDate } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (carrier) order.shipping.carrier = carrier;
    if (trackingNumber) order.shipping.trackingNumber = trackingNumber;
    if (estimatedDeliveryDate) order.shipping.estimatedDeliveryDate = estimatedDeliveryDate;

    await order.save();

    // Emit real-time event via app's io instance
    const io = req.app.get('io');
    if (io) {
      io.emit('order:shipping-updated', { orderId: order._id, shipping: order.shipping });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/orders/:id/refund
 * Request or process refund
 */
router.post('/:id/refund', authenticate, async (req, res) => {
  try {
    const { reason, requestType } = req.body; // requestType: 'request' or 'approve'

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Customer can request refund
    if (requestType === 'request' && order.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!order.refund) {
      order.refund = {};
    }

    if (requestType === 'request') {
      order.refund.status = 'requested';
      order.refund.reason = reason;
      order.refund.requestedAt = new Date();
    } else if (requestType === 'approve') {
      // Only admin/support can approve
      if (req.userRole !== 'admin' && req.userRole !== 'support') {
        return res.status(403).json({ error: 'Access denied' });
      }

      order.refund.status = 'approved';
      order.refund.approvedAt = new Date();
      order.refund.amount = order.totalAmount;
      order.paymentStatus = 'refunded';
    }

    await order.save();

    // Emit real-time event via app's io instance
    const io = req.app.get('io');
    if (io) {
      io.emit('order:refund-updated', { orderId: order._id, refund: order.refund });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/orders/stats
 * Get fulfillment statistics
 */
router.get('/stats/fulfillment', authenticate, authorize('admin', 'support'), async (req, res) => {
  try {
    const orders = await Order.find({});

    const stats = {
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      packed: orders.filter(o => o.status === 'packed').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      returned: orders.filter(o => o.status === 'returned').length
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
