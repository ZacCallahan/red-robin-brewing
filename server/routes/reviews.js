const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Beer = require('../models/Beer');
const Wine = require('../models/Wine');
const Spirit = require('../models/Spirit');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all reviews for a specific beer
router.get('/beer/:beerId', async (req, res) => {
  try {
    const reviews = await Review.find({ beer: req.params.beerId })
      .populate('user', 'username firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching beer reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all reviews for a specific wine
router.get('/wine/:wineId', async (req, res) => {
  try {
    const reviews = await Review.find({ wine: req.params.wineId })
      .populate('user', 'username firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching wine reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all reviews for a specific spirit
router.get('/spirit/:spiritId', async (req, res) => {
  try {
    const reviews = await Review.find({ spirit: req.params.spiritId })
      .populate('user', 'username firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching spirit reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update a review
router.post('/', auth, async (req, res) => {
  try {
    const { beerId, wineId, spiritId, rating, notes } = req.body;
    const userId = req.user._id;
    const username = req.user.username;
    
    // Validate that exactly one beverage type is provided
    const beverageIds = [beerId, wineId, spiritId].filter(Boolean);
    if (beverageIds.length !== 1) {
      return res.status(400).json({ message: 'Must specify exactly one beverage (beer, wine, or spirit)' });
    }
    
    // Determine beverage type and create query
    let beverageQuery = {};
    let beverageField = '';
    let beverageId = '';
    
    if (beerId) {
      beverageQuery = { beer: beerId };
      beverageField = 'beer';
      beverageId = beerId;
    } else if (wineId) {
      beverageQuery = { wine: wineId };
      beverageField = 'wine';
      beverageId = wineId;
    } else if (spiritId) {
      beverageQuery = { spirit: spiritId };
      beverageField = 'spirit';
      beverageId = spiritId;
    }
    
    // Check if user already reviewed this beverage
    let review = await Review.findOne({ 
      user: userId, 
      ...beverageQuery
    });
    
    if (review) {
      // Update existing review
      review.rating = rating;
      review.notes = notes;
      await review.save();
    } else {
      // Create new review
      const reviewData = {
        user: userId,
        rating,
        notes,
        username
      };
      reviewData[beverageField] = beverageId;
      
      review = new Review(reviewData);
      await review.save();
    }
    
    // Update beverage statistics
    await updateBeverageRating(beverageId, beverageField);
    
    // Update user statistics
    await updateUserStats(userId);
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user review statistics
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
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
}

// Update beverage rating statistics
async function updateBeverageRating(beverageId, beverageType) {
  try {
    let Model;
    let query = {};
    
    // Determine the model and query based on beverage type
    switch (beverageType) {
      case 'beer':
        Model = Beer;
        query = { beer: beverageId };
        break;
      case 'wine':
        Model = Wine;
        query = { wine: beverageId };
        break;
      case 'spirit':
        Model = Spirit;
        query = { spirit: beverageId };
        break;
      default:
        throw new Error('Invalid beverage type');
    }
    
    const reviews = await Review.find(query);
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      await Model.findByIdAndUpdate(beverageId, {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length
      });
    }
  } catch (error) {
    console.error('Error updating beverage rating:', error);
  }
}

module.exports = router;