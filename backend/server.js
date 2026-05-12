require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const depositRoutes = require('./routes/deposit');
const withdrawRoutes = require('./routes/withdraw');
const adminRoutes = require('./routes/admin');
const walletRoutes = require('./routes/wallet');
const exchangeRoutes = require('./routes/exchange');

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in environment variables.');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

app.use('/api/auth', authRoutes);
app.use('/api/deposit', depositRoutes);
app.use('/api/withdraw', withdrawRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/exchange', exchangeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
