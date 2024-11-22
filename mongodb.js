const mongoose = require('mongoose');

// MongoDB connection URI (replace with your URI)
const mongoURI = 'mongodb://localhost:27017/cryptoBot'; // Replace with your URI

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));
