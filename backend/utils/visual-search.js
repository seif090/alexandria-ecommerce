/**
 * Simulated Computer Vision Engine for Alexandria Last Chance.
 * In a production environment, this would use TensorFlow.js or a Cloud Vision API.
 */
const mockImageFeatures = (imageUrl) => {
  // Simulating feature vector extraction
  const keywords = ['striped', 'blue', 'cotton', 'summer', 'casual'];
  return keywords.map(kw => kw.toLowerCase());
};

const findVisuallySimilar = async (products, targetImageUrl) => {
  const targetFeatures = mockImageFeatures(targetImageUrl);
  
  return products.map(product => {
    // Basic Jaccard Similarity simulation
    const productTags = product.name.toLowerCase().split(' ').concat(product.category.toLowerCase());
    const matches = targetFeatures.filter(feature => productTags.includes(feature));
    const score = (matches.length / targetFeatures.length) * 100;
    
    return {
      ...product.toObject(),
      visualSimilarityScore: Math.round(score)
    };
  }).sort((a, b) => b.visualSimilarityScore - a.visualSimilarityScore)
    .filter(p => p.visualSimilarityScore > 20)
    .slice(0, 6);
};

module.exports = { findVisuallySimilar };
