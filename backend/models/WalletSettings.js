const mongoose = require('mongoose');

// Singleton settings document — only one record ever exists (_id = 'global')
const walletSettingsSchema = new mongoose.Schema({
  _id: { type: String, default: 'global' },
  cryptoDepositAddress: {
    type: String,
    default: 'TNWwL8d4z6Jm12PqH9r5A8y9B4K7t8uF3d'
  },
  network: {
    type: String,
    default: 'TRC20'
  },
  updatedBy: {
    type: String,
    default: ''
  }
}, { timestamps: true, _id: false });

module.exports = mongoose.model('WalletSettings', walletSettingsSchema);
