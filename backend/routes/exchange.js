const express = require('express');
const router = new express.Router();
const User = require('../models/User');
const Exchange = require('../models/Exchange');
const { auth } = require('../middleware/auth');

const USDT_TO_INR_RATE = 106;

// POST /api/exchange — perform a currency exchange
router.post('/', auth, async (req, res) => {
  try {
    const { fromCurrency, amount } = req.body;
    const numAmount = Number(amount);

    if (!fromCurrency || !['USDT', 'INR'].includes(fromCurrency)) {
      return res.status(400).json({ error: 'Invalid currency pair. Must be USDT or INR.' });
    }

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount. Must be a positive number.' });
    }

    if (fromCurrency === 'USDT') {
      // USDT → INR
      const inrAmount = parseFloat((numAmount * USDT_TO_INR_RATE).toFixed(2));

      // Atomically deduct USDT and add INR
      const user = await User.findOneAndUpdate(
        { _id: req.user._id, usdtBalance: { $gte: numAmount } },
        { $inc: { usdtBalance: -numAmount, inrBalance: inrAmount } },
        { new: true }
      );

      if (!user) {
        return res.status(400).json({ error: 'Insufficient USDT balance.' });
      }

      const exchange = new Exchange({
        userId: req.user._id,
        fromCurrency: 'USDT',
        toCurrency: 'INR',
        fromAmount: numAmount,
        toAmount: inrAmount,
        rate: USDT_TO_INR_RATE,
        status: 'success'
      });

      await exchange.save();

      return res.status(201).json({
        exchange,
        newUsdtBalance: user.usdtBalance,
        newInrBalance: user.inrBalance
      });

    } else {
      // INR → USDT
      const usdtAmount = parseFloat((numAmount / USDT_TO_INR_RATE).toFixed(6));

      // Atomically deduct INR and add USDT
      const user = await User.findOneAndUpdate(
        { _id: req.user._id, inrBalance: { $gte: numAmount } },
        { $inc: { inrBalance: -numAmount, usdtBalance: usdtAmount } },
        { new: true }
      );

      if (!user) {
        return res.status(400).json({ error: 'Insufficient INR balance.' });
      }

      const exchange = new Exchange({
        userId: req.user._id,
        fromCurrency: 'INR',
        toCurrency: 'USDT',
        fromAmount: numAmount,
        toAmount: usdtAmount,
        rate: USDT_TO_INR_RATE,
        status: 'success'
      });

      await exchange.save();

      return res.status(201).json({
        exchange,
        newUsdtBalance: user.usdtBalance,
        newInrBalance: user.inrBalance
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/exchange — get user's exchange history
router.get('/', auth, async (req, res) => {
  try {
    const exchanges = await Exchange.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.send(exchanges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
