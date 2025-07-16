const express = require('express');
const router = express.Router();
const Spirit = require('../models/Spirit');
const authenticateToken = require('../middleware/auth');

// Get all spirits with creator information
router.get('/', async (req, res) => {
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

// Get single spirit by ID
router.get('/:id', async (req, res) => {
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

// Create new spirit
router.post('/', authenticateToken, async (req, res) => {
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

// Update existing spirit
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, distillery, style, abv, age, category, region, description } = req.body;
    
    // Find spirit and check ownership
    const existingSpirit = await Spirit.findById(req.params.id);
    
    if (!existingSpirit) {
      return res.status(404).json({ message: 'Spirit not found' });
    }
    
    // Check authorization - user must own spirit or be admin
    if (existingSpirit.addedBy.toString() !== req.user._id.toString() && !req.user.isAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this spirit' });
    }
    
    console.log('🔄 Updating spirit:', req.params.id);
    
    const updateData = {
      name: name.trim(),
      distillery: distillery.trim(),
      style,
      abv: parseFloat(abv),
      age: age ? parseFloat(age) : undefined,
      category: category ? category.trim() : undefined,
      region: region ? region.trim() : undefined,
      description: description ? description.trim() : ''
    };
    
    const spirit = await Spirit.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('addedBy', 'username firstName lastName');
    
    console.log('✅ Spirit updated by', req.user.username, ':', spirit.name);
    res.json(spirit);
  } catch (error) {
    console.error('❌ Error updating spirit:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid spirit ID' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete spirit
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Find spirit and check ownership
    const spirit = await Spirit.findById(req.params.id);
    
    if (!spirit) {
      return res.status(404).json({ message: 'Spirit not found' });
    }
    
    // Check authorization - user must own spirit or be admin
    if (spirit.addedBy.toString() !== req.user._id.toString() && !req.user.isAdmin && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this spirit' });
    }
    
    await Spirit.findByIdAndDelete(req.params.id);
    
    console.log('✅ Spirit deleted by', req.user.username, ':', spirit.name);
    res.json({ message: 'Spirit removed successfully' });
  } catch (error) {
    console.error('Error deleting spirit:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid spirit ID' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;