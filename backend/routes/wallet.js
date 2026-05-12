const express = require('express');
const router = new express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const WalletSettings = require('../models/WalletSettings');

router.get('/', auth, async (req, res) => {
  try {
    res.send({ inrBalance: req.user.inrBalance, usdtBalance: req.user.usdtBalance || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public (user-auth) read of the current crypto deposit address
router.get('/deposit-address', auth, async (req, res) => {
  try {
    let settings = await WalletSettings.findById('global');
    if (!settings) {
      settings = await WalletSettings.create({ _id: 'global' });
    }
    res.send({
      cryptoDepositAddress: settings.cryptoDepositAddress,
      network: settings.network
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
