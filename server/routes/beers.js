const express = require('express');
const router = express.Router();
const Beer = require('../models/Beer');
const authenticateToken = require('../middleware/auth');

// Get all beers with creator information
router.get('/', async (req, res) => {
  try {
    const beers = await Beer.find()
      .populate('addedBy', 'username firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(beers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single beer by ID
router.get('/:id', async (req, res) => {
  try {
    const beer = await Beer.findById(req.params.id)
      .populate('addedBy', 'username firstName lastName');
    
    if (!beer) {
      return res.status(404).json({ message: 'Beer not found' });
    }
    
    res.json(beer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new beer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, brewery, style, abv, description, sessionable } = req.body;
    
    console.log('🔍 Backend: Raw request body:', req.body);
    console.log('🔍 Backend: Sessionable value:', sessionable, 'type:', typeof sessionable);
    
    // Validate required fields
    if (!name || !brewery || !style || !abv) {
      return res.status(400).json({ message: 'Please provide name, brewery, style, and ABV' });
    }
    
    // Validate ABV range
    if (isNaN(parseFloat(abv)) || parseFloat(abv) < 0 || parseFloat(abv) > 20) {
      return res.status(400).json({ message: 'ABV must be a number between 0 and 20' });
    }
    
    // Create new beer instance
    const newBeer = new Beer({
      name: name.trim(),
      brewery: brewery.trim(),
      style,
      abv: parseFloat(abv),
      description: description ? description.trim() : '',
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
    
    console.log('✅ Backend: Beer created successfully:', beer.name, 'sessionable:', beer.sessionable);
    
    res.status(201).json(beer);
  } catch (error) {
    console.error('❌ Error creating beer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update existing beer
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, brewery, style, abv, description, sessionable } = req.body;
    
    let beer = await Beer.findById(req.params.id);
    
    if (!beer) {
      return res.status(404).json({ message: 'Beer not found' });
    }
    
    // Check authorization - user must own beer or be admin
    if (beer.addedBy.toString() !== req.user._id.toString() && !req.user.isAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this beer' });
    }
    
    console.log('🔄 Updating beer:', req.params.id, 'sessionable:', sessionable);
    
    // Build update data object
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (brewery !== undefined) updateData.brewery = brewery.trim();
    if (style !== undefined) updateData.style = style;
    if (abv !== undefined) {
      const parsedAbv = parseFloat(abv);
      if (isNaN(parsedAbv) || parsedAbv < 0 || parsedAbv > 20) {
        return res.status(400).json({ message: 'ABV must be a number between 0 and 20' });
      }
      updateData.abv = parsedAbv;
    }
    if (description !== undefined) updateData.description = description ? description.trim() : '';
    if (sessionable !== undefined) updateData.sessionable = sessionable;
    
    // Update beer and return with populated creator info
    beer = await Beer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('addedBy', 'username firstName lastName');
    
    console.log('✅ Beer updated successfully:', beer.name, 'sessionable:', beer.sessionable);
    
    res.json(beer);
  } catch (error) {
    console.error('❌ Error updating beer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete beer
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const beer = await Beer.findById(req.params.id);
    
    if (!beer) {
      return res.status(404).json({ message: 'Beer not found' });
    }
    
    // Check authorization - user must own beer or be admin
    if (beer.addedBy.toString() !== req.user._id.toString() && !req.user.isAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this beer' });
    }
    
    await Beer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Beer removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;