const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Beer = require('../models/Beer');
const Wine = require('../models/Wine');
const Spirit = require('../models/Spirit');
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
    const [totalUsers, totalBeers, totalWines, totalSpirits, totalReviews, recentUsers] = await Promise.all([
      User.countDocuments(),
      Beer.countDocuments(),
      Wine.countDocuments(),
      Spirit.countDocuments(),
      Review.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(10).select('firstName lastName username createdAt')
    ]);

    res.json({
      totalUsers,
      totalBeers,
      totalWines,
      totalSpirits,
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

// Get all wines for admin management
router.get('/wines', async (req, res) => {
  try {
    const wines = await Wine.find()
      .populate('addedBy', 'username firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(wines);
  } catch (error) {
    console.error('Error getting wines:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all spirits for admin management
router.get('/spirits', async (req, res) => {
  try {
    const spirits = await Spirit.find()
      .populate('addedBy', 'username firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(spirits);
  } catch (error) {
    console.error('Error getting spirits:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all reviews for admin management
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'username firstName lastName')
      .populate('beer', 'name brewery')
      .populate('wine', 'name winery')
      .populate('spirit', 'name distillery')
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
    
    // Get user's beverages to update other users' review stats
    const userBeers = await Beer.find({ addedBy: id });
    const userWines = await Wine.find({ addedBy: id });
    const userSpirits = await Spirit.find({ addedBy: id });
    
    const userBeerIds = userBeers.map(beer => beer._id);
    const userWineIds = userWines.map(wine => wine._id);
    const userSpiritIds = userSpirits.map(spirit => spirit._id);
    
    // Find all reviews for user's beverages by other users
    const reviewsOnUserItems = await Review.find({
      $or: [
        { beer: { $in: userBeerIds } },
        { wine: { $in: userWineIds } },
        { spirit: { $in: userSpiritIds } }
      ],
      user: { $ne: id }
    });
    
    // Get unique user IDs who reviewed this user's beverages
    const affectedUserIds = [...new Set(reviewsOnUserItems.map(review => review.user.toString()))];
    
    // Delete user's reviews first
    await Review.deleteMany({ user: id });
    
    // Delete reviews on user's beverages
    await Review.deleteMany({
      $or: [
        { beer: { $in: userBeerIds } },
        { wine: { $in: userWineIds } },
        { spirit: { $in: userSpiritIds } }
      ]
    });
    
    // Delete user's beverages
    await Beer.deleteMany({ addedBy: id });
    await Wine.deleteMany({ addedBy: id });
    await Spirit.deleteMany({ addedBy: id });
    
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

// Delete wine with cascade deletion
router.delete('/wines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find all users who reviewed this wine
    const reviewsForWine = await Review.find({ wine: id });
    const affectedUserIds = [...new Set(reviewsForWine.map(review => review.user.toString()))];
    
    // Delete all reviews for this wine
    await Review.deleteMany({ wine: id });
    
    // Delete the wine
    await Wine.findByIdAndDelete(id);
    
    // Update stats for affected users
    await Promise.all(affectedUserIds.map(userId => updateUserStats(userId)));
    
    res.json({ message: 'Wine deleted successfully' });
  } catch (error) {
    console.error('Error deleting wine:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete spirit with cascade deletion
router.delete('/spirits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find all users who reviewed this spirit
    const reviewsForSpirit = await Review.find({ spirit: id });
    const affectedUserIds = [...new Set(reviewsForSpirit.map(review => review.user.toString()))];
    
    // Delete all reviews for this spirit
    await Review.deleteMany({ spirit: id });
    
    // Delete the spirit
    await Spirit.findByIdAndDelete(id);
    
    // Update stats for affected users
    await Promise.all(affectedUserIds.map(userId => updateUserStats(userId)));
    
    res.json({ message: 'Spirit deleted successfully' });
  } catch (error) {
    console.error('Error deleting spirit:', error);
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
    
    // Store beverage and user IDs for updating stats
    const beerId = review.beer;
    const wineId = review.wine;
    const spiritId = review.spirit;
    const userId = review.user;
    
    // Delete the review
    await Review.findByIdAndDelete(id);
    
    // Update beverage statistics
    if (beerId) await updateBeerRating(beerId);
    if (wineId) await updateWineRating(wineId);
    if (spiritId) await updateSpiritRating(spiritId);
    
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

// Update wine information
router.put('/wines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedWine = await Wine.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('addedBy', 'username firstName lastName');
    
    if (!updatedWine) {
      return res.status(404).json({ message: 'Wine not found' });
    }
    
    res.json(updatedWine);
  } catch (error) {
    console.error('Error updating wine:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update spirit information
router.put('/spirits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedSpirit = await Spirit.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('addedBy', 'username firstName lastName');
    
    if (!updatedSpirit) {
      return res.status(404).json({ message: 'Spirit not found' });
    }
    
    res.json(updatedSpirit);
  } catch (error) {
    console.error('Error updating spirit:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Populate database with curated beer collection
router.post('/populate-beers', async (req, res) => {
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

// Populate database with curated wine collection
router.post('/populate-wines', async (req, res) => {
  try {
    console.log('🍷 Starting curated wine import...');
    
    const curatedWines = [
      // 25 Popular Australian & International Wines
      { name: "Yellow Tail Shiraz", winery: "Yellow Tail", style: "Shiraz", abv: 13.5, vintage: 2022, region: "South Eastern Australia", description: "Australia's most exported wine with rich berry flavors and smooth finish." },
      { name: "Penfolds Grange", winery: "Penfolds", style: "Shiraz", abv: 14.5, vintage: 2018, region: "South Australia", description: "Australia's most iconic wine - full-bodied Shiraz with exceptional aging potential." },
      { name: "Wolf Blass Yellow Label Cabernet Sauvignon", winery: "Wolf Blass", style: "Cabernet Sauvignon", abv: 14.0, vintage: 2021, region: "South Australia", description: "Medium-bodied red with blackcurrant flavors and soft tannins." },
      { name: "Jacob's Creek Classic Chardonnay", winery: "Jacob's Creek", style: "Chardonnay", abv: 13.0, vintage: 2022, region: "South Australia", description: "Fresh, fruit-driven Chardonnay with citrus and stone fruit flavors." },
      { name: "Oyster Bay Sauvignon Blanc", winery: "Oyster Bay", style: "Sauvignon Blanc", abv: 12.5, vintage: 2023, region: "Marlborough", description: "Crisp New Zealand Sauvignon Blanc with tropical fruit and herbaceous notes." },
      { name: "Lindeman's Bin 65 Chardonnay", winery: "Lindeman's", style: "Chardonnay", abv: 13.5, vintage: 2022, region: "South Eastern Australia", description: "Easy-drinking Chardonnay with peachy fruit flavors." },
      { name: "McGuigan Black Label Shiraz", winery: "McGuigan", style: "Shiraz", abv: 14.5, vintage: 2021, region: "South Eastern Australia", description: "Rich, full-bodied Shiraz with dark berry and spice notes." },
      { name: "Rosemount Estate Diamond Label Shiraz", winery: "Rosemount Estate", style: "Shiraz", abv: 14.0, vintage: 2021, region: "South Eastern Australia", description: "Smooth, approachable Shiraz with berry fruit and subtle oak." },
      { name: "Hardys VR Cabernet Sauvignon", winery: "Hardys", style: "Cabernet Sauvignon", abv: 13.5, vintage: 2022, region: "South Eastern Australia", description: "Medium-bodied red with blackcurrant and mint flavors." },
      { name: "De Bortoli Noble One", winery: "De Bortoli", style: "Dessert Wine", abv: 10.5, vintage: 2020, region: "Riverina", description: "Award-winning botrytis dessert wine with honeyed sweetness." },
      { name: "Tyrrell's Vat 1 Semillon", winery: "Tyrrell's", style: "Semillon", abv: 10.5, vintage: 2018, region: "Hunter Valley", description: "Iconic Hunter Valley Semillon that develops complexity with age." },
      { name: "Penfolds Bin 389 Cabernet Shiraz", winery: "Penfolds", style: "Cabernet Shiraz", abv: 14.5, vintage: 2019, region: "South Australia", description: "Premium blend known as 'Baby Grange' with rich fruit and oak integration." },
      { name: "Henschke Hill of Grace", winery: "Henschke", style: "Shiraz", abv: 14.5, vintage: 2017, region: "Eden Valley", description: "Ultra-premium Shiraz from 150+ year old vines in Eden Valley." },
      { name: "Leeuwin Estate Art Series Chardonnay", winery: "Leeuwin Estate", style: "Chardonnay", abv: 14.0, vintage: 2021, region: "Margaret River", description: "Elegant Margaret River Chardonnay with citrus and oak complexity." },
      { name: "Cullen Diana Madeline", winery: "Cullen", style: "Cabernet Merlot", abv: 14.0, vintage: 2019, region: "Margaret River", description: "Biodynamic wine with exceptional elegance and aging potential." },
      { name: "Cloudy Bay Sauvignon Blanc", winery: "Cloudy Bay", style: "Sauvignon Blanc", abv: 13.0, vintage: 2023, region: "Marlborough", description: "Benchmark Marlborough Sauvignon Blanc with tropical and citrus notes." },
      { name: "Torbreck RunRig", winery: "Torbreck", style: "Shiraz Viognier", abv: 15.0, vintage: 2018, region: "Barossa Valley", description: "Powerful Barossa Shiraz co-fermented with Viognier." },
      { name: "Moss Wood Cabernet Sauvignon", winery: "Moss Wood", style: "Cabernet Sauvignon", abv: 14.0, vintage: 2019, region: "Margaret River", description: "Elegant Margaret River Cabernet from a pioneering winery." },
      { name: "Yalumba The Octavius", winery: "Yalumba", style: "Shiraz", abv: 14.5, vintage: 2018, region: "Barossa Valley", description: "Premium Barossa Shiraz aged in rare octave barrels." },
      { name: "Cape Mentelle Cabernet Sauvignon", winery: "Cape Mentelle", style: "Cabernet Sauvignon", abv: 14.0, vintage: 2020, region: "Margaret River", description: "Classic Margaret River Cabernet with cassis and cedar notes." },
      { name: "Brokenwood ILR Reserve Semillon", winery: "Brokenwood", style: "Semillon", abv: 10.5, vintage: 2018, region: "Hunter Valley", description: "Premium Hunter Valley Semillon with exceptional aging potential." },
      { name: "Mount Pleasant Elizabeth Semillon", winery: "Mount Pleasant", style: "Semillon", abv: 10.5, vintage: 2017, region: "Hunter Valley", description: "Iconic aged Hunter Valley Semillon with honey and toast complexity." },
      { name: "Wynns Coonawarra Estate Black Label Cabernet", winery: "Wynns", style: "Cabernet Sauvignon", abv: 14.0, vintage: 2018, region: "Coonawarra", description: "Premium Coonawarra Cabernet with eucalyptus and blackcurrant." },
      { name: "Kaesler Old Bastard Shiraz", winery: "Kaesler", style: "Shiraz", abv: 15.5, vintage: 2019, region: "Barossa Valley", description: "Full-bodied Barossa Shiraz from old vine fruit with intense concentration." },
      { name: "Veuve Clicquot Champagne", winery: "Veuve Clicquot", style: "Champagne", abv: 12.0, vintage: null, region: "Champagne", description: "Iconic French champagne with elegant bubbles and rich flavor." }
    ];
    
    // Wine import logic (similar to beer import)
    const insertedWines = [];
    const duplicates = [];
    let errors = 0;
    
    for (const wineData of curatedWines) {
      try {
        const existingWine = await Wine.findOne({ 
          name: wineData.name, 
          winery: wineData.winery,
          vintage: wineData.vintage 
        });
        
        if (existingWine) {
          duplicates.push(`${wineData.name} ${wineData.vintage}`);
        } else {
          const newWine = await Wine.create({
            ...wineData,
            addedBy: req.user._id
          });
          insertedWines.push(newWine);
        }
      } catch (error) {
        console.error(`❌ Error inserting wine ${wineData.name}:`, error.message);
        errors++;
      }
    }
    
    res.json({
      message: 'Wine database populated successfully',
      source: 'Curated Australian & International Wine Collection',
      processed: curatedWines.length,
      inserted: insertedWines.length,
      duplicates: duplicates.length,
      errors: errors,
      sampleItems: insertedWines.slice(0, 5).map(w => ({ 
        name: w.name, 
        winery: w.winery,
        vintage: w.vintage,
        style: w.style 
      }))
    });
    
  } catch (error) {
    console.error('❌ Wine import failed:', error);
    res.status(500).json({ 
      message: 'Server error during wine import',
      error: error.message 
    });
  }
});

// Populate database with curated spirit collection
router.post('/populate-spirits', async (req, res) => {
  try {
    console.log('🥃 Starting curated spirit import...');
    
    const curatedSpirits = [
      // 25 Popular Australian & International Spirits
      { name: "Bundaberg Rum", distillery: "Bundaberg Distilling Company", style: "Dark Rum", abv: 37.0, age: null, region: "Queensland", description: "Australia's most famous rum, distilled in Queensland since 1888." },
      { name: "Four Pillars Rare Dry Gin", distillery: "Four Pillars", style: "Gin", abv: 41.8, age: null, region: "Yarra Valley", description: "Award-winning Australian gin with native botanicals and Asian spices." },
      { name: "Starward Nova", distillery: "Starward", style: "Single Malt Whisky", abv: 41.0, age: null, region: "Melbourne", description: "Melbourne single malt whisky matured in Australian wine barrels." },
      { name: "Lark Classic Cask", distillery: "Lark Distillery", style: "Single Malt Whisky", abv: 43.0, age: null, region: "Tasmania", description: "Pioneer Tasmanian single malt whisky with rich, complex flavors." },
      { name: "Archie Rose Signature Dry Gin", distillery: "Archie Rose", style: "Gin", abv: 40.0, age: null, region: "Sydney", description: "Sydney-distilled gin with native Australian botanicals." },
      { name: "Sullivans Cove French Oak", distillery: "Sullivans Cove", style: "Single Malt Whisky", abv: 47.5, age: null, region: "Tasmania", description: "World Whisky of the Year winner from Tasmania." },
      { name: "Botany Bay Vodka", distillery: "Botany Bay", style: "Vodka", abv: 40.0, age: null, region: "New South Wales", description: "Premium Australian vodka with smooth, clean finish." },
      { name: "Hippocampus Gin", distillery: "Hippocampus", style: "Gin", abv: 41.8, age: null, region: "Tasmania", description: "Tasmanian gin with unique marine botanicals." },
      { name: "Heartwood Convict Redemption", distillery: "Heartwood", style: "Single Malt Whisky", abv: 68.9, age: null, region: "Tasmania", description: "Cask strength Tasmanian whisky with intense flavors." },
      { name: "Manly Spirits Australian Dry Gin", distillery: "Manly Spirits", style: "Gin", abv: 40.0, age: null, region: "Sydney", description: "Sydney gin with native Australian botanicals including sea lettuce." },
      { name: "Nant Single Malt Whisky", distillery: "Nant Distillery", style: "Single Malt Whisky", abv: 43.0, age: null, region: "Tasmania", description: "Highland-style Tasmanian single malt whisky." },
      { name: "West Winds Gin The Sabre", distillery: "West Winds", style: "Gin", abv: 40.0, age: null, region: "Margaret River", description: "Western Australian gin with native botanicals." },
      { name: "Overeem Sherry Cask", distillery: "Overeem", style: "Single Malt Whisky", abv: 43.0, age: null, region: "Tasmania", description: "Tasmanian single malt matured in sherry casks." },
      { name: "Poor Tom's Gin", distillery: "Poor Tom's", style: "Gin", abv: 40.0, age: null, region: "Sydney", description: "Sydney gin with honey and native Australian botanicals." },
      { name: "Beenleigh Rum", distillery: "Beenleigh Artisan Distillery", style: "White Rum", abv: 40.0, age: null, region: "Queensland", description: "Australia's oldest registered distillery producing premium rum." },
      { name: "Johnnie Walker Black Label", distillery: "Johnnie Walker", style: "Blended Scotch Whisky", abv: 40.0, age: 12, region: "Scotland", description: "Rich, complex blended Scotch whisky aged 12 years." },
      { name: "Jack Daniel's Old No. 7", distillery: "Jack Daniel's", style: "Tennessee Whiskey", abv: 40.0, age: null, region: "Tennessee", description: "Classic Tennessee whiskey with charcoal mellowing process." },
      { name: "Tanqueray London Dry Gin", distillery: "Tanqueray", style: "London Dry Gin", abv: 47.3, age: null, region: "England", description: "Classic London Dry gin with juniper and citrus botanicals." },
      { name: "Grey Goose Vodka", distillery: "Grey Goose", style: "Vodka", abv: 40.0, age: null, region: "France", description: "Premium French vodka made from wheat and spring water." },
      { name: "Captain Morgan Spiced Rum", distillery: "Captain Morgan", style: "Spiced Rum", abv: 35.0, age: null, region: "Caribbean", description: "Popular spiced rum with vanilla and warm spice notes." },
      { name: "Bombay Sapphire Gin", distillery: "Bombay Sapphire", style: "London Dry Gin", abv: 40.0, age: null, region: "England", description: "Premium gin with 10 hand-selected botanicals." },
      { name: "Jameson Irish Whiskey", distillery: "Jameson", style: "Irish Whiskey", abv: 40.0, age: null, region: "Ireland", description: "Smooth Irish whiskey triple-distilled for exceptional smoothness." },
      { name: "Hennessy VS Cognac", distillery: "Hennessy", style: "Cognac", abv: 40.0, age: null, region: "France", description: "Classic French cognac with rich fruit and spice notes." },
      { name: "José Cuervo Especial Tequila", distillery: "José Cuervo", style: "Tequila", abv: 38.0, age: null, region: "Mexico", description: "World's best-selling tequila brand from Mexico." },
      { name: "Absolut Vodka", distillery: "Absolut", style: "Vodka", abv: 40.0, age: null, region: "Sweden", description: "Swedish vodka made from winter wheat with rich full-bodied taste." }
    ];
    
    // Spirit import logic (similar to beer import)
    const insertedSpirits = [];
    const duplicates = [];
    let errors = 0;
    
    for (const spiritData of curatedSpirits) {
      try {
        const existingSpirit = await Spirit.findOne({ 
          name: spiritData.name, 
          distillery: spiritData.distillery 
        });
        
        if (existingSpirit) {
          duplicates.push(spiritData.name);
        } else {
          const newSpirit = await Spirit.create({
            ...spiritData,
            addedBy: req.user._id
          });
          insertedSpirits.push(newSpirit);
        }
      } catch (error) {
        console.error(`❌ Error inserting spirit ${spiritData.name}:`, error.message);
        errors++;
      }
    }
    
    res.json({
      message: 'Spirit database populated successfully',
      source: 'Curated Australian & International Spirit Collection',
      processed: curatedSpirits.length,
      inserted: insertedSpirits.length,
      duplicates: duplicates.length,
      errors: errors,
      sampleItems: insertedSpirits.slice(0, 5).map(s => ({ 
        name: s.name, 
        distillery: s.distillery,
        abv: s.abv, 
        style: s.style 
      }))
    });
    
  } catch (error) {
    console.error('❌ Spirit import failed:', error);
    res.status(500).json({ 
      message: 'Server error during spirit import',
      error: error.message 
    });
  }
});

// Legacy endpoint for backward compatibility
router.post('/populate', async (req, res) => {
  // Redirect to beer populate endpoint
  try {
    const result = await api.admin.populateBeers();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error populating beers', error: error.message });
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

// Helper function to update wine rating statistics
async function updateWineRating(wineId) {
  try {
    const reviews = await Review.find({ wine: wineId });
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      await Wine.findByIdAndUpdate(wineId, {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length
      });
    } else {
      await Wine.findByIdAndUpdate(wineId, {
        averageRating: 0,
        totalReviews: 0
      });
    }
  } catch (error) {
    console.error('Error updating wine rating:', error);
  }
}

// Helper function to update spirit rating statistics
async function updateSpiritRating(spiritId) {
  try {
    const reviews = await Review.find({ spirit: spiritId });
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      await Spirit.findByIdAndUpdate(spiritId, {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length
      });
    } else {
      await Spirit.findByIdAndUpdate(spiritId, {
        averageRating: 0,
        totalReviews: 0
      });
    }
  } catch (error) {
    console.error('Error updating spirit rating:', error);
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