/**
 * Predictive Surge Alert System for Vendors
 * Monitors district demand and alerts vendors when surge pricing is triggered
 */

const generateSurgeAlert = async (district, category, currentDemand, basePrice) => {
  // Define surge thresholds for Alexandria districts
  const surgeLevels = {
    'Sidi Gaber': { threshold: 85, multiplier: 1.05 },
    'Smouha': { threshold: 80, multiplier: 1.04 },
    'Miami': { threshold: 75, multiplier: 1.03 },
    'El Agami': { threshold: 70, multiplier: 1.02 },
    'Victoria': { threshold: 78, multiplier: 1.035 }
  };

  const districtConfig = surgeLevels[district] || { threshold: 75, multiplier: 1.03 };

  if (currentDemand >= districtConfig.threshold) {
    const surgePrice = Math.round(basePrice * districtConfig.multiplier);
    const recommendation = {
      triggered: true,
      district,
      category,
      demandLevel: currentDemand,
      threshold: districtConfig.threshold,
      surgeMultiplier: districtConfig.multiplier,
      originalPrice: basePrice,
      suggestedSurgePrice: surgePrice,
      estimatedBoost: surgePrice - basePrice,
      message: `🔥 SURGE PRICING ACTIVE in ${district}! Demand at ${currentDemand}%. Consider raising clearance price by ${districtConfig.multiplier * 100 - 100}%.`,
      validity: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2h validity
    };

    return recommendation;
  }

  return { triggered: false, district, demandLevel: currentDemand };
};

const shouldTriggerFlashSale = (inventory, velocity, stockWarning = 10) => {
  if (inventory.stockCount <= stockWarning && velocity.dailyVelocity > 2) {
    return {
      shouldFlash: true,
      urgency: 'CRITICAL',
      reason: 'Low stock + High demand = Flash sale window',
      recommendedDuration: '30min',
      recommendedDiscount: 0.35 // 35% additional
    };
  }

  return { shouldFlash: false };
};

module.exports = { generateSurgeAlert, shouldTriggerFlashSale };
