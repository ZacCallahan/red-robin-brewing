const express = require('express');
const router = express.Router();
const Beer = require('../models/Beer');

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
// @desc    Add new beer
router.post('/', async (req, res) => {
  try {
    const { name, brewery, style, abv, ibu, description } = req.body;
    
    // For now, we'll use a dummy user ID - we'll fix this when we add authentication
    const dummyUserId = '000000000000000000000000';
    
    const newBeer = new Beer({
      name,
      brewery,
      style,
      abv,
      ibu,
      description,
      addedBy: dummyUserId
    });
    
    const beer = await newBeer.save();
    res.status(201).json(beer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/beers/:id
// @desc    Update beer
router.put('/:id', async (req, res) => {
  try {
    const { name, brewery, style, abv, ibu, description } = req.body;
    
    let beer = await Beer.findById(req.params.id);
    
    if (!beer) {
      return res.status(404).json({ message: 'Beer not found' });
    }
    
    beer = await Beer.findByIdAndUpdate(
      req.params.id,
      { name, brewery, style, abv, ibu, description },
      { new: true }
    );
    
    res.json(beer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/beers/:id
// @desc    Delete beer
router.delete('/:id', async (req, res) => {
  try {
    const beer = await Beer.findById(req.params.id);
    
    if (!beer) {
      return res.status(404).json({ message: 'Beer not found' });
    }
    
    await Beer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Beer removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;