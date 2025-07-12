const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Beer = require('../models/Beer');
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
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update a review
router.post('/', auth, async (req, res) => {
  try {
    const { beerId, rating, notes } = req.body;
    const userId = req.user._id;
    const username = req.user.username;
    
    // Check if user already reviewed this beer
    let review = await Review.findOne({ 
      user: userId, 
      beer: beerId 
    });
    
    if (review) {
      // Update existing review
      review.rating = rating;
      review.notes = notes;
      await review.save();
    } else {
      // Create new review
      review = new Review({
        user: userId,
        beer: beerId,
        rating,
        notes,
        username
      });
      await review.save();
    }
    
    // Update beer statistics
    await updateBeerRating(beerId);
    
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

// Update beer rating statistics
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
    }
  } catch (error) {
    console.error('Error updating beer rating:', error);
  }
}

module.exports = router;