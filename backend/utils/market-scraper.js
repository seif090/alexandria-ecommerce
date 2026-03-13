const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Alex Real-Market Scraper
 * Pulls current pricing from major Egyptian/Alexandrian retailers
 * to provide a REAL competitive baseline for clearance vendors.
 */
const getRealMarketPrice = async (query) => {
  try {
    // 1. Fetch from real-time marketplace (Example: B.TECH or similar regional leader)
    // For this advanced build, we simulate a targeted scrape of an Egyptian retail index
    const searchUrl = `https://btech.com/en/catalogsearch/result/?q=${encodeURIComponent(query)}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const prices = [];

    // Target real price selectors from the major regional retailer
    $('.special-price .price').each((i, el) => {
      const priceText = $(el).text().replace(/[^0-9.]/g, '');
      if (priceText) prices.push(parseFloat(priceText));
    });

    if (prices.length === 0) {
      // Fallback: Check standard price if no special price
      $('.price').each((i, el) => {
        const priceText = $(el).text().replace(/[^0-9.]/g, '');
        if (priceText) prices.push(parseFloat(priceText));
      });
    }

    const avgMarketPrice = prices.length > 0 
      ? prices.reduce((a, b) => a + b) / prices.length 
      : null;

    return {
      avgMarketPrice,
      competitorCount: prices.length,
      source: 'Regional Retail Index'
    };
  } catch (err) {
    console.error('Market Scrape Error:', err.message);
    return { avgMarketPrice: null, error: true };
  }
};

module.exports = { getRealMarketPrice };
