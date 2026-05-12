const mongoose = require('mongoose');

const withdrawSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    enum: ['inr', 'crypto'],
    default: 'inr'
  },
  currency: {
    type: String,
    default: 'INR'
  },
  // INR withdrawal fields
  details: {
    type: String,
    default: ''
  },
  // Crypto withdrawal fields
  walletAddress: {
    type: String,
    default: ''
  },
  network: {
    type: String,
    default: 'TRC20'
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Withdraw', withdrawSchema);
