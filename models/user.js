const mongoose = require('mongoose');

// MongoDB Schema for user preferences
const userSchema = new mongoose.Schema({
  chatId: { type: String, required: true },
  cryptoName: { type: String, required: true },
  priceThreshold: { type: Number, required: true }
});

const User = mongoose.model('User', userSchema);
