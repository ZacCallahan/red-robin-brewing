const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import models
const Beer = require('./models/Beer');
const User = require('./models/User');

// Import auth middleware
const auth = require('./middleware/auth');

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
    const beers = await Beer.find()
      .populate('addedBy', 'username firstName lastName')
      .sort({ createdAt: -1 });
    console.log(`Found ${beers.length} beers in database`);
    res.json(beers);
  } catch (error) {
    console.error('Error fetching beers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add beer endpoint (now requires authentication)
app.post('/api/beers', auth, async (req, res) => {
  try {
    const { name, brewery, style, abv, ibu, description } = req.body;
    
    // Validate required fields
    if (!name || !brewery || !style || !abv) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, brewery, style, and abv are required' 
      });
    }
    
    const newBeer = new Beer({
      name,
      brewery,
      style,
      abv: parseFloat(abv),
      ibu: ibu ? parseInt(ibu) : undefined,
      description,
      addedBy: req.user._id // Use the actual authenticated user
    });
    
    const beer = await newBeer.save();
    
    // Populate the addedBy field for the response
    await beer.populate('addedBy', 'username firstName lastName');
    
    console.log('✅ New beer added by', req.user.username, ':', beer.name);
    res.status(201).json(beer);
  } catch (error) {
    console.error('Error adding beer:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'A beer with this name from this brewery already exists' 
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single beer by ID
app.get('/api/beers/:id', async (req, res) => {
  try {
    const beer = await Beer.findById(req.params.id)
      .populate('addedBy', 'username firstName lastName');
    
    if (!beer) {
      return res.status(404).json({ message: 'Beer not found' });
    }
    
    res.json(beer);
  } catch (error) {
    console.error('Error fetching beer:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid beer ID' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Update beer (requires authentication and ownership or admin)
app.put('/api/beers/:id', auth, async (req, res) => {
  try {
    const { name, brewery, style, abv, ibu, description } = req.body;
    
    // Find the beer first to check ownership
    const existingBeer = await Beer.findById(req.params.id);
    
    if (!existingBeer) {
      return res.status(404).json({ message: 'Beer not found' });
    }
    
    // Check if user owns this beer (you can add admin role check here later)
    if (existingBeer.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this beer' });
    }
    
    const beer = await Beer.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        brewery, 
        style, 
        abv: parseFloat(abv), 
        ibu: ibu ? parseInt(ibu) : undefined, 
        description 
      },
      { new: true, runValidators: true }
    ).populate('addedBy', 'username firstName lastName');
    
    console.log('✅ Beer updated by', req.user.username, ':', beer.name);
    res.json(beer);
  } catch (error) {
    console.error('Error updating beer:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid beer ID' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete beer (requires authentication and ownership or admin)
app.delete('/api/beers/:id', auth, async (req, res) => {
  try {
    // Find the beer first to check ownership
    const beer = await Beer.findById(req.params.id);
    
    if (!beer) {
      return res.status(404).json({ message: 'Beer not found' });
    }
    
    // Check if user owns this beer (you can add admin role check here later)
    if (beer.addedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this beer' });
    }
    
    await Beer.findByIdAndDelete(req.params.id);
    
    console.log('✅ Beer deleted by', req.user.username, ':', beer.name);
    res.json({ message: 'Beer removed successfully' });
  } catch (error) {
    console.error('Error deleting beer:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid beer ID' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile (requires authentication)
app.get('/api/users/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('friends', 'username firstName lastName totalReviews averageRating');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's beers (requires authentication)
app.get('/api/users/my-beers', auth, async (req, res) => {
  try {
    const beers = await Beer.find({ addedBy: req.user._id })
      .populate('addedBy', 'username firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(beers);
  } catch (error) {
    console.error('Error fetching user beers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's reviews (requires authentication)
app.get('/api/users/my-reviews', auth, async (req, res) => {
  try {
    const Review = require('./models/Review');
    
    const reviews = await Review.find({ user: req.user._id })
      .populate('beer', 'name brewery style')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users (for friend functionality)
app.get('/api/users/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }
    
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude current user
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { firstName: { $regex: q, $options: 'i' } },
            { lastName: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
    .select('username firstName lastName totalReviews averageRating')
    .limit(10);
    
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get public user profile
app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -email -friendRequests')
      .populate('friends', 'username firstName lastName');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Routes
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin')); // NEW: Admin routes

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({ message: 'Validation Error', errors });
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }
  
  // Default error
  res.status(500).json({ message: 'Something went wrong!' });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('🍺 MongoDB connected successfully!');
    console.log('🔐 Authentication system enabled');
    console.log('📊 User profiles and friend system ready');
    console.log('🛡️ Admin system ready'); // NEW: Admin system log
  })
  .catch(err => {
    console.log('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('💾 MongoDB connection closed');
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`🍺 Red Robin Brewing API is running on port ${PORT}`);
  console.log(`📝 Available endpoints:`);
  console.log(`   Auth: POST /api/auth/register, POST /api/auth/login`);
  console.log(`   Beers: GET /api/beers, POST /api/beers (auth required)`);
  console.log(`   Reviews: GET /api/reviews/beer/:id, POST /api/reviews (auth required)`);
  console.log(`   Users: GET /api/users/profile (auth required)`);
  console.log(`   Admin: /api/admin/* (admin auth required)`); // NEW: Admin endpoints log
});