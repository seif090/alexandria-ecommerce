const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * AI Predictive Inventory System
 * Analyzes historical sales velocity to predict when a product will run out.
 * Formula: Current Stock / (Sales in last 7 days / 7)
 */
const predictDepletion = async (vendorId) => {
  try {
    const products = await Product.find({ vendor: vendorId });
    const forecasts = [];

    for (const product of products) {
      // Get sales for this product in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentOrders = await Order.find({
        vendor: vendorId,
        'items.product': product._id,
        createdAt: { $gte: sevenDaysAgo }
      });

      // Calculate quantity sold
      let quantitySold = 0;
      recentOrders.forEach(order => {
        const item = order.items.find(i => i.product.toString() === product._id.toString());
        if (item) quantitySold += item.quantity;
      });

      const dailyVelocity = quantitySold / 7;
      let daysRemaining = 'N/A';
      let riskLevel = 'Low';

      if (dailyVelocity > 0) {
        daysRemaining = Math.ceil(product.stock / dailyVelocity);
        if (daysRemaining <= 2) riskLevel = 'CRITICAL';
        else if (daysRemaining <= 5) riskLevel = 'High';
      }

      forecasts.push({
        name: product.name,
        stock: product.stock,
        velocity: dailyVelocity.toFixed(2),
        daysRemaining,
        riskLevel
      });
    }

    return forecasts;
  } catch (err) {
    console.error('Prediction Error:', err);
    return [];
  }
};

module.exports = { predictDepletion };
