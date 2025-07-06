const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import models
const Beer = require('./models/Beer');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'Red Robin Brewing API is running!' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API endpoint working!' });
});

// Real beers endpoint
app.get('/api/beers', async (req, res) => {
  try {
    const beers = await Beer.find().sort({ createdAt: -1 });
    console.log(`Found ${beers.length} beers in database`);
    res.json(beers);
  } catch (error) {
    console.error('Error fetching beers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add beer endpoint
app.post('/api/beers', async (req, res) => {
  try {
    const { name, brewery, style, abv, ibu, description } = req.body;
    
    const newBeer = new Beer({
      name,
      brewery,
      style,
      abv: parseFloat(abv),
      ibu: parseInt(ibu),
      description,
      addedBy: new mongoose.Types.ObjectId() // Temporary dummy ID
    });
    
    const beer = await newBeer.save();
    console.log('✅ New beer added:', beer.name);
    res.status(201).json(beer);
  } catch (error) {
    console.error('Error adding beer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single beer by ID
app.get('/api/beers/:id', async (req, res) => {
  try {
    const beer = await Beer.findById(req.params.id);
    
    if (!beer) {
      return res.status(404).json({ message: 'Beer not found' });
    }
    
    res.json(beer);
  } catch (error) {
    console.error('Error fetching beer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update beer
app.put('/api/beers/:id', async (req, res) => {
  try {
    const { name, brewery, style, abv, ibu, description } = req.body;
    
    const beer = await Beer.findByIdAndUpdate(
      req.params.id,
      { name, brewery, style, abv: parseFloat(abv), ibu: parseInt(ibu), description },
      { new: true }
    );
    
    if (!beer) {
      return res.status(404).json({ message: 'Beer not found' });
    }
    
    console.log('✅ Beer updated:', beer.name);
    res.json(beer);
  } catch (error) {
    console.error('Error updating beer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete beer
app.delete('/api/beers/:id', async (req, res) => {
  try {
    const beer = await Beer.findByIdAndDelete(req.params.id);
    
    if (!beer) {
      return res.status(404).json({ message: 'Beer not found' });
    }
    
    console.log('✅ Beer deleted:', beer.name);
    res.json({ message: 'Beer removed' });
  } catch (error) {
    console.error('Error deleting beer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.use('/api/reviews', require('./routes/reviews'));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('🍺 MongoDB connected successfully!'))
.catch(err => console.log('❌ MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`🍺 Red Robin Brewing API is running on port ${PORT}`);
});