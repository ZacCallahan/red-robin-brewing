const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Beer = require('../models/Beer');

// @route   GET /api/reviews/beer/:beerId
// @desc    Get all reviews for a specific beer
router.get('/beer/:beerId', async (req, res) => {
  try {
    const reviews = await Review.find({ beer: req.params.beerId })
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reviews
// @desc    Add or update a review
router.post('/', async (req, res) => {
  try {
    const { beerId, rating, notes, username } = req.body;
    
    // For now, we'll use a dummy user ID - we'll fix this when we add authentication
    const dummyUserId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
    
    // Check if user already reviewed this beer
    let review = await Review.findOne({ 
      user: dummyUserId, 
      beer: beerId 
    });
    
    if (review) {
      // Update existing review
      review.rating = rating;
      review.notes = notes;
      review.username = username || 'Anonymous';
      await review.save();
    } else {
      // Create new review
      review = new Review({
        user: dummyUserId,
        beer: beerId,
        rating,
        notes,
        username: username || 'Anonymous'
      });
      await review.save();
    }
    
    // Update beer's average rating
    await updateBeerRating(beerId);
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to calculate and update beer's average rating
async function updateBeerRating(beerId) {
  try {
    const reviews = await Review.find({ beer: beerId });
    
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      await Beer.findByIdAndUpdate(beerId, {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews: reviews.length
      });
    }
  } catch (error) {
    console.error('Error updating beer rating:', error);
  }
}

module.exports = router;