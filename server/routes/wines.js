const express = require('express');
const router = express.Router();
const Wine = require('../models/Wine');
const authenticateToken = require('../middleware/auth');

// Get all wines with creator information
router.get('/', async (req, res) => {
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

// Get single wine by ID
router.get('/:id', async (req, res) => {
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

// Create new wine
router.post('/', authenticateToken, async (req, res) => {
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

// Update existing wine
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, winery, style, abv, vintage, region, sweetness, description } = req.body;
    
    // Find wine and check ownership
    const existingWine = await Wine.findById(req.params.id);
    
    if (!existingWine) {
      return res.status(404).json({ message: 'Wine not found' });
    }
    
    // Check authorization - user must own wine or be admin
    if (existingWine.addedBy.toString() !== req.user._id.toString() && !req.user.isAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this wine' });
    }
    
    console.log('🔄 Updating wine:', req.params.id);
    
    const updateData = {
      name: name.trim(),
      winery: winery.trim(),
      style,
      abv: parseFloat(abv),
      vintage: vintage ? parseInt(vintage) : undefined,
      region: region ? region.trim() : undefined,
      sweetness: sweetness || undefined,
      description: description ? description.trim() : ''
    };
    
    const wine = await Wine.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('addedBy', 'username firstName lastName');
    
    console.log('✅ Wine updated by', req.user.username, ':', wine.name);
    res.json(wine);
  } catch (error) {
    console.error('❌ Error updating wine:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid wine ID' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete wine
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Find wine and check ownership
    const wine = await Wine.findById(req.params.id);
    
    if (!wine) {
      return res.status(404).json({ message: 'Wine not found' });
    }
    
    // Check authorization - user must own wine or be admin
    if (wine.addedBy.toString() !== req.user._id.toString() && !req.user.isAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this wine' });
    }
    
    await Wine.findByIdAndDelete(req.params.id);
    
    console.log('✅ Wine deleted by', req.user.username, ':', wine.name);
    res.json({ message: 'Wine removed successfully' });
  } catch (error) {
    console.error('Error deleting wine:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid wine ID' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;