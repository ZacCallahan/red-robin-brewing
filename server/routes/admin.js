const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Beer = require('../models/Beer');
const Review = require('../models/Review');
const authenticateToken = require('../middleware/auth');

// Admin middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || (!user.isAdmin && user.role !== 'admin')) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Apply auth middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalBeers, totalReviews, recentUsers] = await Promise.all([
      User.countDocuments(),
      Beer.countDocuments(),
      Review.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(10).select('firstName lastName username createdAt')
    ]);

    res.json({
      totalUsers,
      totalBeers,
      totalReviews,
      recentUsers
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/beers
// @desc    Get all beers
router.get('/beers', async (req, res) => {
  try {
    const beers = await Beer.find()
      .populate('addedBy', 'username firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(beers);
  } catch (error) {
    console.error('Error getting beers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/reviews
// @desc    Get all reviews
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'username firstName lastName')
      .populate('beer', 'name brewery')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user with proper cascade deletion
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Don't allow admin to delete themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    // Get user's beers to update other users' review stats
    const userBeers = await Beer.find({ addedBy: id });
    const userBeerIds = userBeers.map(beer => beer._id);
    
    // Find all reviews for user's beers (by other users)
    const reviewsOnUserBeers = await Review.find({ 
      beer: { $in: userBeerIds },
      user: { $ne: id }
    });
    
    // Get unique user IDs who reviewed this user's beers
    const affectedUserIds = [...new Set(reviewsOnUserBeers.map(review => review.user.toString()))];
    
    // Delete user's reviews first
    await Review.deleteMany({ user: id });
    
    // Delete reviews on user's beers
    await Review.deleteMany({ beer: { $in: userBeerIds } });
    
    // Delete user's beers
    await Beer.deleteMany({ addedBy: id });
    
    // Delete the user
    await User.findByIdAndDelete(id);
    
    // Update stats for affected users
    await Promise.all(affectedUserIds.map(userId => updateUserStats(userId)));
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/beers/:id
// @desc    Delete a beer with proper cascade deletion
router.delete('/beers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find all users who reviewed this beer
    const reviewsForBeer = await Review.find({ beer: id });
    const affectedUserIds = [...new Set(reviewsForBeer.map(review => review.user.toString()))];
    
    // Delete all reviews for this beer
    await Review.deleteMany({ beer: id });
    
    // Delete the beer
    await Beer.findByIdAndDelete(id);
    
    // Update stats for affected users
    await Promise.all(affectedUserIds.map(userId => updateUserStats(userId)));
    
    res.json({ message: 'Beer deleted successfully' });
  } catch (error) {
    console.error('Error deleting beer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/reviews/:id
// @desc    Delete a review with proper stats update
router.delete('/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Store beer and user IDs for updating stats
    const beerId = review.beer;
    const userId = review.user;
    
    // Delete the review
    await Review.findByIdAndDelete(id);
    
    // Update beer statistics
    await updateBeerRating(beerId);
    
    // Update user statistics
    await updateUserStats(userId);
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update a user
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, username, isAdmin } = req.body;
    
    // Check if email or username already exists (excluding current user)
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: id } },
        { $or: [{ email }, { username }] }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? 'Email already exists' : 'Username already exists'
      });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, email, username, isAdmin },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/beers/:id
// @desc    Update a beer
router.put('/beers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brewery, style, abv, ibu, description } = req.body;
    
    const updatedBeer = await Beer.findByIdAndUpdate(
      id,
      { name, brewery, style, abv, ibu, description },
      { new: true, runValidators: true }
    );
    
    if (!updatedBeer) {
      return res.status(404).json({ message: 'Beer not found' });
    }
    
    res.json(updatedBeer);
  } catch (error) {
    console.error('Error updating beer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const axios = require('axios');

// @route   POST /api/admin/populate
// @desc    Populate database with beers from Punk API
router.post('/populate', async (req, res) => {
  try {
    console.log('🍺 Starting beer import from Punk API...');
    
    // Test connection first
    console.log('🔗 Testing API connection...');
    const testResponse = await axios.get('https://api.punkapi.com/v2/beers?per_page=1', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Beer-Review-App/1.0'
      }
    });
    
    console.log('✅ API connection successful');
    
    // Fetch all beers in batches
    const allBeers = [];
    let page = 1;
    let hasMore = true;
    const perPage = 80; // Max allowed by Punk API
    
    while (hasMore && page <= 4) { // Limit to 4 pages (320 beers max)
      console.log(`📥 Fetching page ${page}...`);
      
      const response = await axios.get(`https://api.punkapi.com/v2/beers?page=${page}&per_page=${perPage}`, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Beer-Review-App/1.0'
        }
      });
      
      const punkBeers = response.data;
      console.log(`📋 Page ${page}: Retrieved ${punkBeers.length} beers`);
      
      if (punkBeers.length === 0) {
        hasMore = false;
      } else {
        allBeers.push(...punkBeers);
        page++;
      }
      
      // If we got less than the full page, we're done
      if (punkBeers.length < perPage) {
        hasMore = false;
      }
    }
    
    console.log(`📊 Total beers fetched from API: ${allBeers.length}`);
    
    if (allBeers.length === 0) {
      return res.status(400).json({ 
        message: 'No beers found from Punk API',
        error: 'The API returned no data'
      });
    }
    
    // Transform Punk API data to our beer format
    const beersToInsert = allBeers.map(beer => ({
      name: beer.name,
      brewery: 'BrewDog',
      style: beer.tagline || 'Craft Beer',
      abv: beer.abv || 0,
      ibu: beer.ibu || null,
      description: beer.description || 'No description available',
      addedBy: req.user._id,
      apiSource: 'punk',
      apiId: beer.id
    }));
    
    // Insert beers, handling duplicates
    const insertedBeers = [];
    const duplicates = [];
    let errors = 0;
    
    console.log(`💾 Processing ${beersToInsert.length} beers...`);
    
    for (const beerData of beersToInsert) {
      try {
        // Check if beer already exists
        const existingBeer = await Beer.findOne({ 
          name: beerData.name, 
          brewery: beerData.brewery 
        });
        
        if (existingBeer) {
          duplicates.push(beerData.name);
        } else {
          const newBeer = await Beer.create(beerData);
          insertedBeers.push(newBeer);
        }
      } catch (error) {
        console.error(`❌ Error inserting beer ${beerData.name}:`, error.message);
        errors++;
      }
    }
    
    console.log(`✅ Import complete!`);
    console.log(`📈 Stats: ${insertedBeers.length} added, ${duplicates.length} duplicates, ${errors} errors`);
    
    res.json({
      message: 'Beer import completed successfully',
      source: 'Punk API (BrewDog)',
      fetched: allBeers.length,
      inserted: insertedBeers.length,
      duplicates: duplicates.length,
      errors: errors,
      duplicateNames: duplicates.slice(0, 10),
      sampleBeers: insertedBeers.slice(0, 5).map(b => ({ 
        name: b.name, 
        brewery: b.brewery,
        abv: b.abv, 
        style: b.style 
      }))
    });
    
  } catch (error) {
    console.error('❌ Punk API import failed:', error.message);
    
    // Provide specific error messages based on error type
    let errorMessage = 'Failed to import beers from Punk API';
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Cannot connect to Punk API. Please check your internet connection or try again later.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Request to Punk API timed out. Please try again.';
    } else if (error.response) {
      errorMessage = `Punk API returned error: ${error.response.status} ${error.response.statusText}`;
    }
    
    res.status(500).json({ 
      message: errorMessage,
      error: error.message,
      suggestion: 'Try again in a few minutes, or check if the Punk API is currently available.'
    });
  }
});

// Helper functions
async function updateBeerRating(beerId) {
  try {
    const reviews = await Review.find({ beer: beerId });
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      await Beer.findByIdAndUpdate(beerId, {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length
      });
    } else {
      await Beer.findByIdAndUpdate(beerId, {
        averageRating: 0,
        totalReviews: 0
      });
    }
  } catch (error) {
    console.error('Error updating beer rating:', error);
  }
}

async function updateUserStats(userId) {
  try {
    const reviews = await Review.find({ user: userId });
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      await User.findByIdAndUpdate(userId, {
        totalReviews: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10
      });
    } else {
      await User.findByIdAndUpdate(userId, {
        totalReviews: 0,
        averageRating: 0
      });
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
}

module.exports = router;