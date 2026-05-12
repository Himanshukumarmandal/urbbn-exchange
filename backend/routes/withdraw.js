const express = require('express');
const router = new express.Router();
const Withdraw = require('../models/Withdraw');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { amount, type, details, walletAddress } = req.body;
    const numAmount = Number(amount);
    const withdrawType = type || 'inr';

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Invalid withdrawal amount' });
    }

    if (withdrawType === 'inr') {
      if (!details || !details.trim()) {
        return res.status(400).json({ error: 'UPI ID or Bank details are required' });
      }

      // Atomically deduct from INR balance
      const user = await User.findOneAndUpdate(
        { _id: req.user._id, inrBalance: { $gte: numAmount } },
        { $inc: { inrBalance: -numAmount } },
        { new: true }
      );

      if (!user) {
        return res.status(400).json({ error: 'Insufficient INR balance' });
      }

      const withdrawal = new Withdraw({
        userId: req.user._id,
        amount: numAmount,
        type: 'inr',
        currency: 'INR',
        details: details.trim(),
        walletAddress: '',
        network: '',
        status: 'pending'
      });

      await withdrawal.save();
      return res.status(201).json(withdrawal);

    } else if (withdrawType === 'crypto') {
      if (!walletAddress || !walletAddress.trim()) {
        return res.status(400).json({ error: 'Wallet address is required' });
      }
      if (numAmount < 5) {
        return res.status(400).json({ error: 'Minimum crypto withdrawal is 5 USDT' });
      }

      // Atomically deduct from USDT balance
      const user = await User.findOneAndUpdate(
        { _id: req.user._id, usdtBalance: { $gte: numAmount } },
        { $inc: { usdtBalance: -numAmount } },
        { new: true }
      );

      if (!user) {
        return res.status(400).json({ error: 'Insufficient USDT balance' });
      }

      const withdrawal = new Withdraw({
        userId: req.user._id,
        amount: numAmount,
        type: 'crypto',
        currency: 'USDT',
        details: '',
        walletAddress: walletAddress.trim(),
        network: 'TRC20',
        status: 'pending'
      });

      await withdrawal.save();
      return res.status(201).json(withdrawal);
    } else {
      return res.status(400).json({ error: 'Invalid withdrawal type' });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const withdrawals = await Withdraw.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.send(withdrawals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
