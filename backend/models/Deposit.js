const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
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
    enum: ['crypto', 'inr'],
    default: 'crypto'
  },
  txHash: {
    type: String,
    default: ''
  },
  network: {
    type: String,
    default: 'TRC20'
  },
  upiId: {
    type: String,
    default: ''
  },
  utr: {
    type: String,
    default: ''
  },
  screenshot: {
    type: String,
    default: ''
  },
  currency: {
    type: String,
    default: 'USDT'
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Deposit', depositSchema);
