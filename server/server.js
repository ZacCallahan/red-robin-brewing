const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Red Robin Brewing API is running!' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API endpoint working!' });
});

// Routes will be added here later
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/beers', require('./routes/beers'));
// app.use('/api/reviews', require('./routes/reviews'));

// Database connection (we'll set this up later)
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/red-robin-brewing', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.log(err));

app.listen(PORT, () => {
  console.log(`🍺 Red Robin Brewing API is running on port ${PORT}`);
});