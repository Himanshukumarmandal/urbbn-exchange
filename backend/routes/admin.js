const express = require('express');
const router = new express.Router();
const Deposit = require('../models/Deposit');
const Withdraw = require('../models/Withdraw');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const WalletSettings = require('../models/WalletSettings');

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

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET || 'secret123');
    res.send({ user: { id: user._id, email: user.email, role: user.role, inrBalance: user.inrBalance }, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/deposits', adminAuth, async (req, res) => {
  try {
    const deposits = await Deposit.find({}).populate('userId', 'email').sort({ createdAt: -1 });
    res.send(deposits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/approve/:id', adminAuth, async (req, res) => {
  try {
    const deposit = await Deposit.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      { $set: { status: 'success' } },
      { new: true }
    );
    
    if (!deposit) {
      return res.status(400).json({ error: 'Deposit not found or already processed' });
    }

    const inrAmount = deposit.type === 'inr' 
      ? Number(deposit.amount.toFixed(2))
      : Number((deposit.amount * 106).toFixed(2));

    // Credit the correct balance: INR deposits → inrBalance, Crypto deposits → usdtBalance
    const balanceField = deposit.type === 'inr' ? 'inrBalance' : 'usdtBalance';
    const user = await User.findOneAndUpdate(
      { _id: deposit.userId },
      { $inc: { [balanceField]: deposit.type === 'inr' ? inrAmount : Number(deposit.amount.toFixed(8)) } },
      { new: true }
    );

    if (!user) {
      await Deposit.findByIdAndUpdate(deposit._id, { $set: { status: 'pending' } });
      return res.status(404).json({ error: 'User not found' });
    }

    res.send(deposit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reject/:id', adminAuth, async (req, res) => {
  try {
    const deposit = await Deposit.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      { $set: { status: 'failed' } },
      { new: true }
    );
    
    if (!deposit) {
      return res.status(400).json({ error: 'Deposit not found or already processed' });
    }

    res.send(deposit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Withdraw Routes

router.get('/withdraws', adminAuth, async (req, res) => {
  try {
    const withdraws = await Withdraw.find({}).populate('userId', 'email').sort({ createdAt: -1 });
    console.log(`Fetched ${withdraws.length} withdrawals for admin`);
    res.send(withdraws);
  } catch (error) {
    console.error('Withdraw fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/approve-withdraw/:id', adminAuth, async (req, res) => {
  try {
    const withdrawal = await Withdraw.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      { $set: { status: 'success' } },
      { new: true }
    );
    
    if (!withdrawal) {
      return res.status(400).json({ error: 'Withdrawal not found or already processed' });
    }

    res.send(withdrawal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reject-withdraw/:id', adminAuth, async (req, res) => {
  try {
    const withdrawal = await Withdraw.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      { $set: { status: 'failed' } },
      { new: true }
    );
    
    if (!withdrawal) {
      return res.status(400).json({ error: 'Withdrawal not found or already processed' });
    }

    // Refund the correct balance based on withdrawal type
    const refundField = withdrawal.type === 'crypto' ? 'usdtBalance' : 'inrBalance';
    await User.findByIdAndUpdate(withdrawal.userId, { $inc: { [refundField]: withdrawal.amount } });

    res.send(withdrawal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Wallet Settings ──────────────────────────────────────────────────────────

// GET current deposit wallet address (admin only)
router.get('/wallet-settings', adminAuth, async (req, res) => {
  try {
    let settings = await WalletSettings.findById('global');
    if (!settings) {
      // Auto-create with defaults on first access
      settings = await WalletSettings.create({ _id: 'global' });
    }
    res.send(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST update deposit wallet address (admin only)
router.post('/wallet-settings', adminAuth, async (req, res) => {
  try {
    const { cryptoDepositAddress, network } = req.body;

    if (!cryptoDepositAddress || !cryptoDepositAddress.trim()) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const settings = await WalletSettings.findByIdAndUpdate(
      'global',
      {
        $set: {
          cryptoDepositAddress: cryptoDepositAddress.trim(),
          network: (network || 'TRC20').trim(),
          updatedBy: req.user?.email || 'admin'
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.send(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
