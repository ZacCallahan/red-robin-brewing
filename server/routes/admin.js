const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Beer = require('../models/Beer');
const Review = require('../models/Review');
const authenticateToken = require('../middleware/auth');

// Admin middleware to verify admin privileges
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

// Apply authentication and admin middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Get dashboard statistics
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

// Get all users for admin management
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

// Get all beers for admin management
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

// Get all reviews for admin management
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

// Delete user with cascade deletion
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    // Get user's beers to update other users' review stats
    const userBeers = await Beer.find({ addedBy: id });
    const userBeerIds = userBeers.map(beer => beer._id);
    
    // Find all reviews for user's beers by other users
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

// Delete beer with cascade deletion
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

// Delete review with stats update
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

// Update user information
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, username, isAdmin } = req.body;
    
    // Check if email or username already exists
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

// Update beer information
router.put('/beers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brewery, style, abv, description, sessionable } = req.body;
    
    console.log('🔄 Updating beer:', id, 'with sessionable:', sessionable);
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (brewery !== undefined) updateData.brewery = brewery;
    if (style !== undefined) updateData.style = style;
    if (abv !== undefined) updateData.abv = abv;
    if (description !== undefined) updateData.description = description;
    if (sessionable !== undefined) updateData.sessionable = sessionable;
    
    const updatedBeer = await Beer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedBeer) {
      return res.status(404).json({ message: 'Beer not found' });
    }
    
    console.log('✅ Beer updated successfully:', updatedBeer.name, 'sessionable:', updatedBeer.sessionable);
    
    res.json(updatedBeer);
  } catch (error) {
    console.error('Error updating beer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Populate database with curated beer collection
router.post('/populate', async (req, res) => {
  try {
    console.log('🍺 Starting curated beer import...');
    
    const curatedBeers = [
      // Popular Australian Beers
      { name: "XXXX Gold", brewery: "XXXX", style: "Lager", abv: 3.5, ibu: 15, description: "Australia's most popular mid-strength lager with a crisp, refreshing taste." },
      { name: "Victoria Bitter", brewery: "Carlton & United", style: "Lager", abv: 4.9, ibu: 25, description: "VB - Australia's iconic full-strength lager with a distinctive bitter taste." },
      { name: "Carlton Draught", brewery: "Carlton & United", style: "Lager", abv: 4.6, ibu: 18, description: "Made from beer - Australia's favourite draught beer with smooth taste." },
      { name: "Tooheys New", brewery: "Tooheys", style: "Lager", abv: 4.6, ibu: 17, description: "NSW's favourite beer with a clean, refreshing taste." },
      { name: "Great Northern", brewery: "Carlton & United", style: "Lager", abv: 4.2, ibu: 12, description: "Tropical Queensland beer that's crisp and easy drinking." },
      { name: "Coopers Pale Ale", brewery: "Coopers", style: "Ale", abv: 4.5, ibu: 30, description: "Australia's original craft beer - cloudy, flavoursome pale ale." },
      { name: "Coopers Sparkling Ale", brewery: "Coopers", style: "Ale", abv: 5.8, ibu: 35, description: "Premium bottle-conditioned ale with secondary fermentation." },
      { name: "James Boag's Premium", brewery: "James Boag's", style: "Lager", abv: 5.0, ibu: 20, description: "Tasmanian premium lager brewed with pure Tasmanian ingredients." },
      { name: "Little Creatures Pale Ale", brewery: "Little Creatures", style: "Ale", abv: 5.2, ibu: 43, description: "Fremantle's famous hoppy pale ale that started the craft beer revolution." },
      { name: "Stone & Wood Pacific Ale", brewery: "Stone & Wood", style: "Ale", abv: 4.4, ibu: 25, description: "Byron Bay's cloudy ale with tropical hop character and galaxy hops." },
      { name: "Balter XPA", brewery: "Balter", style: "Ale", abv: 5.0, ibu: 30, description: "Gold Coast XPA with easy-drinking hop character." },
      { name: "Pirate Life Pale Ale", brewery: "Pirate Life", style: "Ale", abv: 4.4, ibu: 35, description: "Adelaide's hoppy pale ale with American hop character." },
      { name: "4 Pines Pale Ale", brewery: "4 Pines", style: "Ale", abv: 5.1, ibu: 42, description: "Sydney Northern Beaches pale ale with citrus and pine notes." },
      { name: "Furphy Refreshing Ale", brewery: "Furphy", style: "Ale", abv: 4.4, ibu: 18, description: "Geelong's refreshing ale with balanced hop and malt character." },
      { name: "Mountain Goat Steam Ale", brewery: "Mountain Goat", style: "Ale", abv: 4.5, ibu: 25, description: "Melbourne's original craft beer with unique steam beer character." },
      { name: "Carlton Dry", brewery: "Carlton & United", style: "Lager", abv: 4.5, ibu: 15, description: "Ultra-crisp dry lager with clean finish." },
      { name: "Swan Draught", brewery: "Swan", style: "Lager", abv: 4.5, ibu: 16, description: "Western Australia's pride - clean, crisp lager from Perth." },
      { name: "West End Draught", brewery: "West End", style: "Lager", abv: 4.5, ibu: 17, description: "South Australia's favourite beer since 1859." },
      { name: "Cascade Premium Light", brewery: "Cascade", style: "Lager", abv: 2.8, ibu: 12, description: "Tasmania's own light beer with full flavour despite lower alcohol." },
      { name: "Pure Blonde", brewery: "Carlton & United", style: "Lager", abv: 4.6, ibu: 12, description: "Premium mid-strength with low carb content." },
      
      // Popular International Beers
      { name: "Heineken", brewery: "Heineken", style: "Lager", abv: 5.0, ibu: 23, description: "Dutch premium lager with subtle hop character." },
      { name: "Corona Extra", brewery: "Corona", style: "Lager", abv: 4.6, ibu: 18, description: "Light Mexican lager traditionally served with lime." },
      { name: "Stella Artois", brewery: "Stella Artois", style: "Lager", abv: 5.2, ibu: 24, description: "Belgian lager with a crisp, clean finish." },
      { name: "Budweiser", brewery: "Anheuser-Busch", style: "Lager", abv: 5.0, ibu: 12, description: "Classic American lager with crisp, clean taste." },
      { name: "Coors Light", brewery: "Molson Coors", style: "Lager", abv: 4.2, ibu: 10, description: "Light, refreshing lager brewed in the Rocky Mountains." },
      { name: "Guinness Draught", brewery: "Guinness", style: "Stout", abv: 4.2, ibu: 45, description: "Iconic Irish stout with creamy head and roasted barley flavor." },
      { name: "Founders Breakfast Stout", brewery: "Founders", style: "Stout", abv: 8.3, ibu: 60, description: "Coffee chocolate stout brewed with coffee and chocolate." },
      { name: "Samuel Smith's Imperial Stout", brewery: "Samuel Smith", style: "Stout", abv: 7.0, ibu: 40, description: "Rich, complex stout with chocolate and coffee notes." },
      { name: "Young's Double Chocolate Stout", brewery: "Young's", style: "Stout", abv: 5.2, ibu: 25, description: "Rich stout with real chocolate and luxurious taste." },
      { name: "Asahi Super Dry", brewery: "Asahi", style: "Lager", abv: 5.0, ibu: 16, description: "Japanese lager with clean, dry finish." },
      { name: "Sapporo Premium", brewery: "Sapporo", style: "Lager", abv: 4.9, ibu: 17, description: "Premium Japanese lager with crisp taste." },
      { name: "Tiger Beer", brewery: "Tiger", style: "Lager", abv: 5.0, ibu: 18, description: "Singapore lager popular across Australia's Asian communities." },
      { name: "Blue Moon", brewery: "Blue Moon Brewing", style: "Wheat", abv: 5.4, ibu: 9, description: "Smooth wheat beer with coriander and orange peel." },
      { name: "Hoegaarden", brewery: "Hoegaarden", style: "Wheat", abv: 4.9, ibu: 15, description: "Original Belgian white beer with coriander and orange peel." },
      { name: "Paulaner Hefe-Weizen", brewery: "Paulaner", style: "Wheat", abv: 5.5, ibu: 12, description: "Traditional Bavarian wheat beer with banana and clove notes." },
      { name: "Weihenstephaner Hefeweizen", brewery: "Weihenstephaner", style: "Wheat", abv: 5.4, ibu: 14, description: "Classic wheat beer from world's oldest brewery." },
      { name: "Sierra Nevada Pale Ale", brewery: "Sierra Nevada", style: "Ale", abv: 5.6, ibu: 38, description: "Classic American pale ale that helped define the style." },
      { name: "Stone IPA", brewery: "Stone Brewing", style: "IPA", abv: 6.9, ibu: 77, description: "Bold, hoppy IPA with citrus and pine notes." },
      { name: "Dogfish Head 60 Minute IPA", brewery: "Dogfish Head", style: "IPA", abv: 6.0, ibu: 60, description: "Continuously hopped IPA with citrusy hop character." },
      { name: "Lagunitas IPA", brewery: "Lagunitas", style: "IPA", abv: 6.2, ibu: 51, description: "Well-balanced IPA with citrus and pine notes." },
      { name: "Hazy Little Thing", brewery: "Sierra Nevada", style: "IPA", abv: 6.7, ibu: 35, description: "Juicy, hazy IPA with tropical fruit flavors and a smooth finish." },
      { name: "Brewdog Punk IPA", brewery: "Brewdog", style: "IPA", abv: 5.6, ibu: 65, description: "Scottish punk IPA now brewed in Australia." },
      { name: "Pilsner Urquell", brewery: "Pilsner Urquell", style: "Pilsner", abv: 4.4, ibu: 40, description: "Original pilsner with Saaz hop character." },
      { name: "Carlsberg", brewery: "Carlsberg", style: "Lager", abv: 5.0, ibu: 20, description: "Danish lager probably the best in the world." },
      { name: "Peroni Nastro Azzurro", brewery: "Peroni", style: "Lager", abv: 5.1, ibu: 24, description: "Premium Italian lager popular in Australian restaurants." },
      { name: "Deschutes Black Butte Porter", brewery: "Deschutes", style: "Porter", abv: 5.2, ibu: 30, description: "Smooth porter with chocolate and coffee flavors." },
      { name: "Anchor Porter", brewery: "Anchor", style: "Porter", abv: 5.6, ibu: 30, description: "Classic American porter with chocolate malt character." },
      { name: "Gose Gone Wild", brewery: "Anderson Valley", style: "Sour", abv: 4.2, ibu: 15, description: "Traditional German sour beer with salt and coriander." },
      { name: "SeaQuench Ale", brewery: "Dogfish Head", style: "Sour", abv: 4.9, ibu: 14, description: "Session sour with lime juice, black limes, and sea salt." },
      { name: "Dos Equis", brewery: "Dos Equis", style: "Lager", abv: 4.2, ibu: 15, description: "Mexican lager with smooth, refreshing taste." },
      { name: "Tecate", brewery: "Tecate", style: "Lager", abv: 4.5, ibu: 14, description: "Mexican lager often served with lime and salt." }
    ];
    
    console.log(`📋 Processing ${curatedBeers.length} curated beers...`);
    
    // Insert beers and handle duplicates
    const insertedBeers = [];
    const duplicates = [];
    let errors = 0;
    
    for (const beerData of curatedBeers) {
      try {
        // Check if beer already exists
        const existingBeer = await Beer.findOne({ 
          name: beerData.name, 
          brewery: beerData.brewery 
        });
        
        if (existingBeer) {
          duplicates.push(beerData.name);
        } else {
          const newBeer = await Beer.create({
            ...beerData,
            addedBy: req.user._id
          });
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
      message: 'Beer database populated successfully',
      source: 'Curated Australian & International Beer Collection',
      processed: curatedBeers.length,
      inserted: insertedBeers.length,
      duplicates: duplicates.length,
      errors: errors,
      duplicateNames: duplicates.slice(0, 10),
      sampleBeers: insertedBeers.slice(0, 10).map(b => ({ 
        name: b.name, 
        brewery: b.brewery,
        abv: b.abv, 
        style: b.style 
      }))
    });
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    res.status(500).json({ 
      message: 'Server error during beer import',
      error: error.message 
    });
  }
});

// Fix sessionable field for existing beers
router.post('/fix-sessionable', async (req, res) => {
  try {
    console.log('🔧 Adding sessionable field to existing beers...');
    
    // Update all beers that don't have the sessionable field
    const result = await Beer.updateMany(
      { sessionable: { $exists: false } },
      { $set: { sessionable: false } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} beers with sessionable: false`);
    
    res.json({
      message: 'Successfully added sessionable field to existing beers',
      modifiedCount: result.modifiedCount,
      note: 'All beers set to non-sessionable by default. Use admin dashboard to mark specific beers as sessionable.'
    });
    
  } catch (error) {
    console.error('❌ Error fixing sessionable field:', error);
    res.status(500).json({ 
      message: 'Error fixing sessionable field',
      error: error.message 
    });
  }
});

// Helper function to update beer rating statistics
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

// Helper function to update user statistics
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