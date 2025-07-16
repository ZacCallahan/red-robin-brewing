const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import models
const Beer = require('./models/Beer');
const Wine = require('./models/Wine');
const Spirit = require('./models/Spirit');
const User = require('./models/User');

// Import auth middleware
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(cors());
app.use(express.json());

// Basic health check routes
app.get('/', (req, res) => {
  res.json({ message: 'Red Robin Brewing API is running!' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API endpoint working!' });
});

// Get all beers with creator information
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

// Get all wines with creator information
app.get('/api/wines', async (req, res) => {
  try {
    const wines = await Wine.find()
      .populate('addedBy', 'username firstName lastName')
      .sort({ createdAt: -1 });
    console.log(`Found ${wines.length} wines in database`);
    res.json(wines);
  } catch (error) {
    console.error('Error fetching wines:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all spirits with creator information
app.get('/api/spirits', async (req, res) => {
  try {
    const spirits = await Spirit.find()
      .populate('addedBy', 'username firstName lastName')
      .sort({ createdAt: -1 });
    console.log(`Found ${spirits.length} spirits in database`);
    res.json(spirits);
  } catch (error) {
    console.error('Error fetching spirits:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new beer with authentication and sessionable support
app.post('/api/beers', auth, async (req, res) => {
  try {
    const { name, brewery, style, abv, description, sessionable } = req.body;
    
    console.log('🔍 Backend: Raw request body:', req.body);
    console.log('🔍 Backend: Sessionable value:', sessionable, 'type:', typeof sessionable);
    
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
      description,
      sessionable: sessionable === true,
      addedBy: req.user._id
    });
    
    console.log('🔍 Backend: Beer before save:', {
      name: newBeer.name,
      sessionable: newBeer.sessionable
    });
    
    const beer = await newBeer.save();
    
    // Populate creator information for response
    await beer.populate('addedBy', 'username firstName lastName');
    
    console.log('✅ New beer added by', req.user.username, ':', beer.name, 'sessionable:', beer.sessionable);
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

// Create new wine with authentication
app.post('/api/wines', auth, async (req, res) => {
  try {
    const { name, winery, style, abv, vintage, region, sweetness, description } = req.body;
    
    console.log('🍷 Backend: Raw request body:', req.body);
    
    // Validate required fields
    if (!name || !winery || !style || !abv) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, winery, style, and abv are required' 
      });
    }
    
    // Validate ABV range for wines
    if (isNaN(parseFloat(abv)) || parseFloat(abv) < 0 || parseFloat(abv) > 20) {
      return res.status(400).json({ message: 'ABV must be a number between 0 and 20' });
    }
    
    // Validate vintage if provided
    if (vintage && (isNaN(parseInt(vintage)) || parseInt(vintage) < 1800 || parseInt(vintage) > new Date().getFullYear() + 2)) {
      return res.status(400).json({ message: 'Vintage must be a valid year' });
    }
    
    const newWine = new Wine({
      name: name.trim(),
      winery: winery.trim(),
      style,
      abv: parseFloat(abv),
      vintage: vintage ? parseInt(vintage) : undefined,
      region: region ? region.trim() : undefined,
      sweetness: sweetness || undefined,
      description: description ? description.trim() : '',
      addedBy: req.user._id
    });
    
    console.log('🍷 Backend: Wine before save:', {
      name: newWine.name,
      winery: newWine.winery
    });
    
    const wine = await newWine.save();
    
    // Populate creator information for response
    await wine.populate('addedBy', 'username firstName lastName');
    
    console.log('✅ New wine added by', req.user.username, ':', wine.name);
    res.status(201).json(wine);
  } catch (error) {
    console.error('❌ Error creating wine:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'A wine with this name from this winery already exists' 
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new spirit with authentication
app.post('/api/spirits', auth, async (req, res) => {
  try {
    const { name, distillery, style, abv, age, category, region, description } = req.body;
    
    console.log('🥃 Backend: Raw request body:', req.body);
    
    // Validate required fields
    if (!name || !distillery || !style || !abv) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, distillery, style, and abv are required' 
      });
    }
    
    // Validate ABV range for spirits
    if (isNaN(parseFloat(abv)) || parseFloat(abv) < 15 || parseFloat(abv) > 80) {
      return res.status(400).json({ message: 'ABV must be a number between 15 and 80 for spirits' });
    }
    
    // Validate age if provided
    if (age && (isNaN(parseFloat(age)) || parseFloat(age) < 0)) {
      return res.status(400).json({ message: 'Age must be a positive number' });
    }
    
    const newSpirit = new Spirit({
      name: name.trim(),
      distillery: distillery.trim(),
      style,
      abv: parseFloat(abv),
      age: age ? parseFloat(age) : undefined,
      category: category ? category.trim() : undefined,
      region: region ? region.trim() : undefined,
      description: description ? description.trim() : '',
      addedBy: req.user._id
    });
    
    console.log('🥃 Backend: Spirit before save:', {
      name: newSpirit.name,
      distillery: newSpirit.distillery
    });
    
    const spirit = await newSpirit.save();
    
    // Populate creator information for response
    await spirit.populate('addedBy', 'username firstName lastName');
    
    console.log('✅ New spirit added by', req.user.username, ':', spirit.name);
    res.status(201).json(spirit);
  } catch (error) {
    console.error('❌ Error creating spirit:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'A spirit with this name from this distillery already exists' 
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

// Get single wine by ID
app.get('/api/wines/:id', async (req, res) => {
  try {
    const wine = await Wine.findById(req.params.id)
      .populate('addedBy', 'username firstName lastName');
    
    if (!wine) {
      return res.status(404).json({ message: 'Wine not found' });
    }
    
    res.json(wine);
  } catch (error) {
    console.error('Error fetching wine:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid wine ID' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single spirit by ID
app.get('/api/spirits/:id', async (req, res) => {
  try {
    const spirit = await Spirit.findById(req.params.id)
      .populate('addedBy', 'username firstName lastName');
    
    if (!spirit) {
      return res.status(404).json({ message: 'Spirit not found' });
    }
    
    res.json(spirit);
  } catch (error) {
    console.error('Error fetching spirit:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid spirit ID' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Update beer with authorization check and sessionable support
app.put('/api/beers/:id', auth, async (req, res) => {
  try {
    const { name, brewery, style, abv, description, sessionable } = req.body;
    
    // Find beer and check ownership
    const existingBeer = await Beer.findById(req.params.id);
    
    if (!existingBeer) {
      return res.status(404).json({ message: 'Beer not found' });
    }
    
    // Check authorization - user must own beer or be admin
    if (existingBeer.addedBy.toString() !== req.user._id.toString() && !req.user.isAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this beer' });
    }
    
    console.log('🔄 Updating beer:', req.params.id, 'sessionable:', sessionable);
    
    const updateData = {
      name, 
      brewery, 
      style, 
      abv: parseFloat(abv), 
      description
    };
    
    // Only update sessionable if provided
    if (sessionable !== undefined) {
      updateData.sessionable = sessionable;
    }
    
    const beer = await Beer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('addedBy', 'username firstName lastName');
    
    console.log('✅ Beer updated by', req.user.username, ':', beer.name, 'sessionable:', beer.sessionable);
    res.json(beer);
  } catch (error) {
    console.error('Error updating beer:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid beer ID' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete beer with authorization check
app.delete('/api/beers/:id', auth, async (req, res) => {
  try {
    // Find beer and check ownership
    const beer = await Beer.findById(req.params.id);
    
    if (!beer) {
      return res.status(404).json({ message: 'Beer not found' });
    }
    
    // Check authorization - user must own beer or be admin
    if (beer.addedBy.toString() !== req.user._id.toString() && !req.user.isAdmin && req.user.role !== 'admin') {
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

// Get user profile with authentication
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

// Get user's beers with authentication
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

// Get user's wines with authentication
app.get('/api/users/my-wines', auth, async (req, res) => {
  try {
    const wines = await Wine.find({ addedBy: req.user._id })
      .populate('addedBy', 'username firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(wines);
  } catch (error) {
    console.error('Error fetching user wines:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's spirits with authentication
app.get('/api/users/my-spirits', auth, async (req, res) => {
  try {
    const spirits = await Spirit.find({ addedBy: req.user._id })
      .populate('addedBy', 'username firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(spirits);
  } catch (error) {
    console.error('Error fetching user spirits:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's reviews with authentication
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

// Search users for friend functionality
app.get('/api/users/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }
    
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
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

// Get public user profile by ID
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

// Route modules
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/beers', require('./routes/beers'));
app.use('/api/wines', require('./routes/wines'));
app.use('/api/spirits', require('./routes/spirits'));

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

// Database connection with enhanced error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('🍺 MongoDB connected successfully!');
    console.log('🔐 Authentication system enabled');
    console.log('📊 User profiles and friend system ready');
    console.log('🛡️ Admin system ready');
    console.log('🍷 Wine management ready');
    console.log('🥃 Spirit management ready');
  })
  .catch(err => {
    console.log('❌ MongoDB connection error:', err.message);
    console.log('🔧 Please check your .env file configuration');
    console.log('💡 Make sure MONGODB_URI is set correctly');
    process.exit(1);
  });

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('💾 MongoDB connection closed');
    process.exit(0);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🍺 Red Robin Brewing API is running on port ${PORT}`);
  console.log(`📝 Available endpoints:`);
  console.log(`   Auth: POST /api/auth/register, POST /api/auth/login`);
  console.log(`   Beers: GET /api/beers, POST /api/beers (auth required)`);
  console.log(`   Wines: GET /api/wines, POST /api/wines (auth required)`);
  console.log(`   Spirits: GET /api/spirits, POST /api/spirits (auth required)`);
  console.log(`   Reviews: GET /api/reviews/beer/:id, POST /api/reviews (auth required)`);
  console.log(`   Users: GET /api/users/profile (auth required)`);
  console.log(`   Admin: /api/admin/* (admin auth required)`);
}); 