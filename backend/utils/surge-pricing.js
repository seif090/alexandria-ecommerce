const Order = require('../models/Order');
const CategoryHeatmap = require('../models/CategoryHeatmap');

/**
 * Dynamic Surge Pricing Engine
 * Adjusts suggested prices based on local Alexandria district demand.
 */
const calculateSurgePrice = async (basePrice, district, category) => {
  try {
    // 1. Get regional demand for this category
    const heatmap = await CategoryHeatmap.findOne({ district, category });
    
    let surgeMultiplier = 1.0;
    
    // 2. Logic: If demandScore > 80, apply a slight surge (+5-10%)
    // Since this is a CLEARANCE app, surge actually means "smaller discount" 
    // for high demand, or "steeper discount" for low demand.
    
    if (heatmap) {
      if (heatmap.demandScore > 85) {
        surgeMultiplier = 0.95; // High demand, discount less (keep price higher)
      } else if (heatmap.demandScore < 50) {
        surgeMultiplier = 1.15; // Low demand, steeper discount (lower price)
      }
    }

    // 3. Time-based surge (e.g., weekend rush in Alexandria)
    const now = new Date();
    const isWeekend = now.getDay() === 5 || now.getDay() === 6; // Fri/Sat in Egypt
    if (isWeekend) {
      surgeMultiplier *= 0.98; // Weekend demand is high, maintain value better
    }

    const calculatedPrice = Math.round(basePrice * surgeMultiplier);
    
    return {
      suggestedPrice: calculatedPrice,
      isPremiumArea: (heatmap?.demandScore > 80),
      reason: (heatmap?.demandScore > 80) ? 'High Regional Demand' : 'Standard Clearance rate'
    };
  } catch (err) {
    return { suggestedPrice: basePrice, reason: 'Error in Surge Calculation' };
  }
};

module.exports = { calculateSurgePrice };
