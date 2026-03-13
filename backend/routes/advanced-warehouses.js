const express = require('express');
const router = express.Router();
const Warehouse = require('../models/Warehouse');
const Order = require('../models/Order');
const { authenticate, authorize } = require('../middleware/rbac');

/**
 * GET /api/warehouses
 * Get all warehouses
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const warehouses = await Warehouse.find({ isActive: true })
      .select('-__v')
      .lean();

    // Calculate utilization for each
    const warehousesWithStats = await Promise.all(
      warehouses.map(async (warehouse) => {
        const utilizationPercent = (warehouse.usedCapacity / warehouse.totalCapacity * 100).toFixed(2);
        return {
          ...warehouse,
          utilization: utilizationPercent,
          available: warehouse.totalCapacity - warehouse.usedCapacity
        };
      })
    );

    res.json(warehousesWithStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/warehouses/:id
 * Get warehouse details
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    // Get orders in this warehouse
    const orders = await Order.find({ warehouse: warehouse._id })
      .select('orderNumber status createdAt items')
      .populate('items.vendor', 'shopName');

    const stats = {
      utilizationPercent: (warehouse.usedCapacity / warehouse.totalCapacity * 100).toFixed(2),
      availableCapacity: warehouse.totalCapacity - warehouse.usedCapacity,
      ordersCount: orders.length,
      orders: orders.slice(0, 10) // Latest 10
    };

    res.json({ ...warehouse.toObject(), stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/warehouses
 * Create new warehouse (admin only)
 */
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const {
      name,
      code,
      address,
      totalCapacity,
      manager,
      email,
      phone,
      shippingPartners
    } = req.body;

    const warehouse = new Warehouse({
      name,
      code,
      address,
      totalCapacity,
      manager,
      email,
      phone,
      shippingPartners: shippingPartners || []
    });

    await warehouse.save();
    res.status(201).json(warehouse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/warehouses/:id
 * Update warehouse (admin only)
 */
router.patch('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    // Update allowed fields
    if (req.body.name) warehouse.name = req.body.name;
    if (req.body.address) warehouse.address = { ...warehouse.address, ...req.body.address };
    if (req.body.totalCapacity) warehouse.totalCapacity = req.body.totalCapacity;
    if (req.body.manager) warehouse.manager = req.body.manager;
    if (req.body.email) warehouse.email = req.body.email;
    if (req.body.phone) warehouse.phone = req.body.phone;
    if (req.body.operatingHours) warehouse.operatingHours = req.body.operatingHours;
    if (req.body.shippingPartners) warehouse.shippingPartners = req.body.shippingPartners;
    if (req.body.isActive !== undefined) warehouse.isActive = req.body.isActive;

    await warehouse.save();
    res.json(warehouse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/warehouses/:id/capacity
 * Update warehouse capacity usage
 */
router.patch('/:id/capacity', authenticate, authorize('admin', 'support'), async (req, res) => {
  try {
    const { usedCapacity } = req.body;

    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    if (usedCapacity > warehouse.totalCapacity) {
      return res.status(400).json({ error: 'Used capacity exceeds total capacity' });
    }

    warehouse.usedCapacity = usedCapacity;
    await warehouse.save();

    res.json({
      message: 'Capacity updated',
      warehouse: {
        id: warehouse._id,
        utilized: warehouse.usedCapacity,
        total: warehouse.totalCapacity,
        available: warehouse.totalCapacity - warehouse.usedCapacity,
        percent: (warehouse.usedCapacity / warehouse.totalCapacity * 100).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/warehouses/:id/inventory
 * Get inventory status
 */
router.get('/:id/inventory', authenticate, async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    const utilizationPercent = (warehouse.usedCapacity / warehouse.totalCapacity * 100).toFixed(2);

    const inventory = {
      warehouse: warehouse._id,
      warehouseName: warehouse.name,
      totalCapacity: warehouse.totalCapacity,
      usedCapacity: warehouse.usedCapacity,
      availableCapacity: warehouse.totalCapacity - warehouse.usedCapacity,
      utilizationPercent,
      status: getCapacityStatus(utilizationPercent),
      activeOrders: warehouse.activeOrders,
      lastUpdated: new Date()
    };

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/warehouses/stats/overview
 * Get warehouse network overview
 */
router.get('/stats/overview', authenticate, authorize('admin', 'support'), async (req, res) => {
  try {
    const warehouses = await Warehouse.find({ isActive: true });

    const overview = {
      totalWarehouses: warehouses.length,
      totalCapacity: warehouses.reduce((sum, w) => sum + w.totalCapacity, 0),
      totalUsed: warehouses.reduce((sum, w) => sum + w.usedCapacity, 0),
      totalActive: warehouses.reduce((sum, w) => sum + w.activeOrders, 0),
      warehouses: warehouses.map(w => ({
        id: w._id,
        name: w.name,
        city: w.address.city,
        capacity: w.totalCapacity,
        used: w.usedCapacity,
        utilization: (w.usedCapacity / w.totalCapacity * 100).toFixed(2),
        activeOrders: w.activeOrders,
        status: getCapacityStatus((w.usedCapacity / w.totalCapacity * 100).toFixed(2))
      }))
    };

    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper: Get capacity status
 */
function getCapacityStatus(percent) {
  const num = parseFloat(percent);
  if (num < 50) return 'green';
  if (num < 80) return 'yellow';
  return 'red';
}

module.exports = router;
