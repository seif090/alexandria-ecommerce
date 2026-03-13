/**
 * Sentiment Analysis Engine for Alexandria Last Chance Reviews
 * Analyzes customer feedback to detect fraud, satisfaction, and product quality issues
 */

const analyzeReviewSentiment = (review) => {
  const text = review.comment.toLowerCase();
  
  const positiveWords = ['excellent', 'amazing', 'great', 'love', 'perfect', 'fantastic', 'best', 'fast', 'reliable', 'quality', 'حا', 'رائع', 'ممتاز'];
  const negativeWords = ['fake', 'broken', 'defect', 'fraud', 'scam', 'waste', 'terrible', 'awful', 'damaged', 'slow', 'مقلد', 'مكسور', 'خدعة'];
  const fraudWords = ['fake', 'counterfeit', 'not original', 'scam', 'fraud', 'returned', 'wrong item', 'ليس أصلي', 'غير أصلي'];

  let positiveCount = 0;
  let negativeCount = 0;
  let fraudFlags = 0;

  positiveWords.forEach(word => {
    if (text.includes(word)) positiveCount++;
  });

  negativeWords.forEach(word => {
    if (text.includes(word)) negativeCount++;
  });

  fraudWords.forEach(word => {
    if (text.includes(word)) fraudFlags++;
  });

  // Calculate sentiment score (-100 to 100)
  const netScore = (positiveCount - negativeCount) * 20;
  const sentimentScore = Math.max(-100, Math.min(100, netScore + (review.rating - 3) * 20));

  return {
    score: sentimentScore,
    sentiment: sentimentScore > 20 ? 'POSITIVE' : sentimentScore < -20 ? 'NEGATIVE' : 'NEUTRAL',
    isSuspicious: fraudFlags > 0 || (negativeCount > 2 && review.rating > 3),
    fraudRisk: fraudFlags > 0 ? 'HIGH' : negativeCount > 2 ? 'MEDIUM' : 'LOW'
  };
};

const getProductHealthScore = (reviews) => {
  if (!reviews || reviews.length === 0) return 50;

  const sentiments = reviews.map(r => analyzeReviewSentiment(r));
  const avgSentiment = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
  const suspiciousCount = sentiments.filter(s => s.isSuspicious).length;

  const healthScore = 50 + (avgSentiment / 2) - (suspiciousCount * 5);
  return Math.max(0, Math.min(100, healthScore));
};

module.exports = { analyzeReviewSentiment, getProductHealthScore };
