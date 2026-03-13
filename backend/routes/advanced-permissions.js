const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/rbac');

/**
 * GET /api/permissions/current
 * Get current user's permissions
 */
router.get('/current', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let permissions = getDefaultPermissions(user.role);

    // Get vendor-specific permissions if vendor
    if (user.role === 'vendor') {
      const vendor = await Vendor.findOne({ userId: req.userId });
      if (vendor) {
        permissions = {
          ...permissions,
          customPermissions: vendor.customPermissions,
          vendorStatus: vendor.status,
          commissionTier: vendor.commissionTier
        };
      }
    }

    res.json({
      userId: req.userId,
      role: user.role,
      permissions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/permissions/:role
 * Get permissions for a specific role (admin only)
 */
router.get('/:role', authenticate, authorize('admin'), async (req, res) => {
  try {
    const permissions = getDefaultPermissions(req.params.role);
    res.json({ role: req.params.role, permissions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/permissions/check
 * Check if user has specific permission
 */
router.post('/check', authenticate, async (req, res) => {
  try {
    const { permission, resource } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let hasPermission = false;

    // Admin has all permissions
    if (user.role === 'admin') {
      hasPermission = true;
    } else {
      const permissions = getDefaultPermissions(user.role);

      // Check basic role permissions
      if (permissions.includes(permission)) {
        hasPermission = true;
      }

      // Check vendor-specific permissions
      if (user.role === 'vendor') {
        const vendor = await Vendor.findOne({ userId: req.userId });
        if (vendor) {
          hasPermission = vendor.permissions.includes(permission) ||
                          vendor.customPermissions[permission] === true ||
                          hasPermission;
        }
      }
    }

    res.json({
      userId: req.userId,
      permission,
      resource,
      hasPermission,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/permissions/vendor/:vendorId
 * Update vendor permissions (admin only)
 */
router.patch('/vendor/:vendorId', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { permissions, customPermissions } = req.body;

    const vendor = await Vendor.findById(req.params.vendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    if (permissions) {
      vendor.permissions = permissions;
    }

    if (customPermissions) {
      vendor.customPermissions = {
        ...vendor.customPermissions,
        ...customPermissions
      };
    }

    await vendor.save();

    res.json({
      message: 'Permissions updated',
      vendor: {
        id: vendor._id,
        shopName: vendor.shopName,
        permissions: vendor.permissions,
        customPermissions: vendor.customPermissions
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/permissions/audit
 * Get permission audit log (admin only)
 */
router.get('/audit/log', authenticate, authorize('admin'), async (req, res) => {
  try {
    // In production, this would query an audit logs collection
    // For now, return sample data
    const auditLog = [
      {
        timestamp: new Date(),
        userId: req.userId,
        action: 'view_analytics',
        resource: 'dashboard',
        result: 'success'
      }
    ];

    res.json(auditLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper: Get default permissions by role
 */
function getDefaultPermissions(role) {
  const rolePermissions = {
    admin: [
      'view_all_data',
      'manage_users',
      'manage_vendors',
      'manage_orders',
      'manage_payments',
      'manage_settings',
      'view_analytics',
      'export_reports',
      'manage_roles',
      'system_audit',
      'refund_orders',
      'suspend_vendors'
    ],
    vendor: [
      'view_own_orders',
      'manage_own_products',
      'manage_own_inventory',
      'process_own_orders',
      'view_own_analytics',
      'manage_own_customers',
      'create_support_ticket',
      'view_shipping_labels'
    ],
    customer: [
      'browse_products',
      'create_orders',
      'view_own_orders',
      'create_reviews',
      'manage_wishlist',
      'create_support_ticket',
      'update_profile',
      'manage_addresses'
    ],
    support: [
      'view_all_orders',
      'view_all_customers',
      'create_support_ticket',
      'manage_support_tickets',
      'view_analytics',
      'process_refunds',
      'update_order_status',
      'contact_vendors'
    ]
  };

  return rolePermissions[role] || [];
}

module.exports = router;
