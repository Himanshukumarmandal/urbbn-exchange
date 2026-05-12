const express = require('express');
const router = new express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Check if it's the first user, make them admin
    const count = await User.countDocuments();
    const role = count === 0 ? 'admin' : 'user';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({ email, password: hashedPassword, role });
    await user.save();

    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET || 'secret123');
    res.status(201).json({ user: { id: user._id, email: user.email, role: user.role, inrBalance: user.inrBalance, usdtBalance: user.usdtBalance || 0 }, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Admins must login via the admin portal' });
    }

    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET || 'secret123');
    res.send({ user: { id: user._id, email: user.email, role: user.role, inrBalance: user.inrBalance, usdtBalance: user.usdtBalance || 0 }, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/me', auth, async (req, res) => {
  res.send({ user: { id: req.user._id, email: req.user.email, role: req.user.role, inrBalance: req.user.inrBalance, usdtBalance: req.user.usdtBalance || 0 }});
});

module.exports = router;
