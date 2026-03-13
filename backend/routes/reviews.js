const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, auth denied' });
  try {
    const decoded = jwt.verify(token, 'secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token invalid' });
  }
};

// Add Review
router.post('/', auth, async (req, res) => {
  try {
    const { product, rating, comment } = req.body;
    const review = new Review({
      product,
      user: req.user.id,
      rating,
      comment
    });
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Get reviews for a product
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
