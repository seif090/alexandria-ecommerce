/**
 * Smart Recommendation Engine using Collaborative Filtering
 * Tracks purchase history and suggests products based on user preferences
 */

const getRecommendations = async (userId, allProducts, userOrders) => {
  if (!userOrders || userOrders.length === 0) {
    // New user - return trending high-discount items
    return allProducts
      .sort((a, b) => {
        const discountA = ((a.originalPrice - a.discountPrice) / a.originalPrice) * 100;
        const discountB = ((b.originalPrice - b.discountPrice) / b.originalPrice) * 100;
        return discountB - discountA;
      })
      .slice(0, 8);
  }

  // Extract user preferences from order history
  const userCategories = {};
  const userPriceRange = { min: Infinity, max: 0 };

  userOrders.forEach(order => {
    order.items.forEach(item => {
      if (item.product) {
        const cat = item.product.category;
        userCategories[cat] = (userCategories[cat] || 0) + 1;
        userPriceRange.min = Math.min(userPriceRange.min, item.product.discountPrice);
        userPriceRange.max = Math.max(userPriceRange.max, item.product.discountPrice);
      }
    });
  });

  // Generate recommendation score based on matches
  const recommendations = allProducts
    .map(product => {
      let score = 0;

      // Category matching
      if (userCategories[product.category]) {
        score += userCategories[product.category] * 10;
      }

      // Price range similarity
      if (product.discountPrice >= userPriceRange.min && product.discountPrice <= userPriceRange.max) {
        score += 15;
      }

      // Discount depth appeal (assume power users like steep discounts)
      const discountPercent = ((product.originalPrice - product.discountPrice) / product.originalPrice) * 100;
      if (discountPercent > 40) score += 20;

      return { ...product.toObject(), recommendationScore: score };
    })
    .filter(p => p.recommendationScore > 0)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 12);

  return recommendations;
};

module.exports = { getRecommendations };
