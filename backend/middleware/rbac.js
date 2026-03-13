const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Check if user has specific role
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

/**
 * Check if user has specific permission
 */
const hasPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      
      // Admins have all permissions
      if (user.role === 'admin') {
        return next();
      }

      // Vendor-specific permissions
      if (user.role === 'vendor') {
        const vendor = await Vendor.findOne({ userId: req.userId });
        
        if (!vendor) {
          return res.status(403).json({ error: 'Vendor profile not found' });
        }

        // Check if permission exists
        const hasSpecificPermission = 
          vendor.permissions.includes(requiredPermission) ||
          vendor.customPermissions[requiredPermission];

        if (!hasSpecificPermission) {
          return res.status(403).json({ error: `Permission denied: ${requiredPermission}` });
        }
      }

      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

/**
 * Check if vendor owns the resource
 */
const ownsResource = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.userId });
    
    if (!vendor) {
      return res.status(403).json({ error: 'Vendor profile not found' });
    }

    req.vendorId = vendor._id;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Rate limiting for sensitive actions
 */
const rateLimit = (maxRequests = 100, windowMs = 60000) => {
  const clientRequests = new Map();

  return (req, res, next) => {
    const clientId = req.userId || req.ip;
    const now = Date.now();

    if (!clientRequests.has(clientId)) {
      clientRequests.set(clientId, []);
    }

    const requests = clientRequests.get(clientId)
      .filter(time => now - time < windowMs);

    if (requests.length >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    requests.push(now);
    clientRequests.set(clientId, requests);

    next();
  };
};

/**
 * Log actions for audit trail
 */
const auditLog = (action) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;

    res.send = function(data) {
      // Log after successful response
      if (res.statusCode < 400) {
        const log = {
          userId: req.userId,
          action,
          resourceId: req.params.id,
          method: req.method,
          path: req.path,
          timestamp: new Date(),
          ipAddress: req.ip
        };
        console.log('[AUDIT LOG]', log);
      }
      
      return originalSend.call(this, data);
    };

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  hasPermission,
  ownsResource,
  rateLimit,
  auditLog
};
