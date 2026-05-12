const express = require('express');
const router = new express.Router();
const Deposit = require('../models/Deposit');
const { auth } = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { amount, txHash, type, utr, upiId, screenshot } = req.body;
    const numAmount = Number(amount);

    if (type === 'inr') {
      if (!amount || isNaN(numAmount) || numAmount < 100) {
        return res.status(400).json({ error: 'Minimum INR deposit is 100' });
      }
      if (!utr || !upiId) {
        return res.status(400).json({ error: 'UTR and UPI ID are required for INR deposits' });
      }
    } else {
      if (!amount || isNaN(numAmount) || numAmount < 5 || numAmount > 100000) {
        return res.status(400).json({ error: 'Deposit amount must be between 5 and 100,000 USDT' });
      }
    }

    // Rate Limiting: Prevent duplicate requests within 10 seconds
    const tenSecondsAgo = new Date(Date.now() - 10 * 1000);
    const recentDeposit = await Deposit.findOne({
      userId: req.user._id,
      createdAt: { $gte: tenSecondsAgo }
    });

    if (recentDeposit) {
      return res.status(429).json({ error: 'Please wait 10 seconds before submitting another deposit.' });
    }

    const deposit = new Deposit({
      userId: req.user._id,
      amount: numAmount,
      type: type || 'crypto',
      currency: type === 'inr' ? 'INR' : 'USDT',
      txHash: txHash || '',
      utr: utr || '',
      upiId: upiId || '',
      screenshot: screenshot || '',
      network: type === 'inr' ? 'BANK' : 'TRC20',
      status: 'pending'
    });

    await deposit.save();
    res.status(201).json(deposit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const deposits = await Deposit.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.send(deposits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
