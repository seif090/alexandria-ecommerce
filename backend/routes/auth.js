const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, shopName, category } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ name, email, password, role, shopName, category });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, 'secret-key', { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name, email, role, shopName, category } });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, 'secret-key', { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email, role: user.role, shopName: user.shopName } });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
