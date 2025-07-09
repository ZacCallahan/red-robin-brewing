const express = require('express');
const router = express.Router();
const Beer = require('../models/Beer');
const authenticateToken = require('../middleware/auth');

// @route   GET /api/beers
// @desc    Get all beers
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

// @route   GET /api/beers/:id
// @desc    Get single beer
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

// @route   POST /api/beers
// @desc    Add new beer (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, brewery, style, abv, description, sessionable } = req.body;
    
    console.log('🔍 Backend: Raw request body:', req.body);
    console.log('🔍 Backend: Sessionable value:', sessionable, 'type:', typeof sessionable);
    
    // Validation
    if (!name || !brewery || !style || !abv) {
      return res.status(400).json({ message: 'Please provide name, brewery, style, and ABV' });
    }
    
    if (isNaN(parseFloat(abv)) || parseFloat(abv) < 0 || parseFloat(abv) > 20) {
      return res.status(400).json({ message: 'ABV must be a number between 0 and 20' });
    }
    
    const newBeer = new Beer({
      name: name.trim(),
      brewery: brewery.trim(),
      style,
      abv: parseFloat(abv),
      description: description ? description.trim() : '',
      sessionable: sessionable === true, // EXPLICIT BOOLEAN CONVERSION
      addedBy: req.user._id
    });
    
    console.log('🔍 Backend: Beer before save:', {
      name: newBeer.name,
      sessionable: newBeer.sessionable
    });
    
    const beer = await newBeer.save();
    
    // Populate the addedBy field for the response
    await beer.populate('addedBy', 'username firstName lastName');
    
    console.log('✅ Backend: Beer created successfully:', beer.name, 'sessionable:', beer.sessionable);
    
    res.status(201).json(beer);
  } catch (error) {
    console.error('❌ Error creating beer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/beers/:id
// @desc    Update beer (requires authentication)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, brewery, style, abv, description, sessionable } = req.body;
    
    let beer = await Beer.findById(req.params.id);
    
    if (!beer) {
      return res.status(404).json({ message: 'Beer not found' });
    }
    
    // Check if user owns this beer or is admin
    if (beer.addedBy.toString() !== req.user._id.toString() && !req.user.isAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this beer' });
    }
    
    console.log('🔄 Updating beer:', req.params.id, 'sessionable:', sessionable);
    
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

// @route   DELETE /api/beers/:id
// @desc    Delete beer (requires authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const beer = await Beer.findById(req.params.id);
    
    if (!beer) {
      return res.status(404).json({ message: 'Beer not found' });
    }
    
    // Check if user owns this beer or is admin
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