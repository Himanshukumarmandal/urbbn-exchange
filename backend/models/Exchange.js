const mongoose = require('mongoose');

const exchangeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fromCurrency: {
    type: String,
    enum: ['USDT', 'INR'],
    required: true
  },
  toCurrency: {
    type: String,
    enum: ['USDT', 'INR'],
    required: true
  },
  fromAmount: {
    type: Number,
    required: true,
    min: 0
  },
  toAmount: {
    type: Number,
    required: true,
    min: 0
  },
  rate: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  }
}, { timestamps: true });

module.exports = mongoose.model('Exchange', exchangeSchema);
