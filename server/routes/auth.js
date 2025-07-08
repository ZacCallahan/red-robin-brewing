const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');

// @route   GET /api/auth/users/search
// @desc    Search users (excluding current user)
router.get('/users/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user._id; // Get current user ID from auth middleware
    
    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }
    
    // Search users by username, firstName, or lastName
    // Exclude the current user from results
    const users = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { firstName: { $regex: q, $options: 'i' } },
            { lastName: { $regex: q, $options: 'i' } }
          ]
        },
        { _id: { $ne: currentUserId } } // Exclude current user
      ]
    }).select('username firstName lastName createdAt').limit(10);
    
    // Calculate real stats for each user
    const Review = require('../models/Review');
    const Beer = require('../models/Beer');
    
    const usersWithStats = await Promise.all(users.map(async (user) => {
      // Get user's reviews using 'user' field (not 'userId')
      const userReviews = await Review.find({ user: user._id });
      
      // Get beers added by user
      const userBeers = await Beer.find({ createdBy: user._id });
      
      // Calculate average rating
      const totalRating = userReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = userReviews.length > 0 ? totalRating / userReviews.length : 0;
      
      return {
        ...user.toObject(),
        totalReviews: userReviews.length,
        totalBeersAdded: userBeers.length,
        averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
      };
    }));
    
    res.json(usersWithStats);
    
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Server error during user search' });
  }
});

// @route   GET /api/auth/users/:userId/reviews
// @desc    Get reviews for a specific user
router.get('/users/:userId/reviews', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const Review = require('../models/Review');
    const Beer = require('../models/Beer');
    
    // Query using 'user' field (not 'userId') and populate 'beer' field (not 'beerId')
    const reviews = await Review.find({ user: userId })
      .sort({ createdAt: -1 }) // Most recent first
      .populate('beer', 'name brewery style') // Populate beer details
      .lean(); // Use lean for better performance
    
    // Map the response to match what the frontend expects
    const reviewsWithBeerDetails = reviews.map(review => ({
      ...review,
      _id: review._id,
      rating: review.rating,
      comment: review.notes, // Map 'notes' to 'comment' for frontend compatibility
      createdAt: review.createdAt,
      beer: review.beer // This will have the populated beer data
    }));
    
    res.json(reviewsWithBeerDetails);
    
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching user reviews' });
  }
});

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: user.getPublicProfile()
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   POST /api/auth/friend-request/:userId
// @desc    Send friend request
router.post('/friend-request/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    
    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }
    
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if already friends
    if (targetUser.friends.includes(currentUserId)) {
      return res.status(400).json({ message: 'Already friends' });
    }
    
    // Check if request already exists
    const existingRequest = targetUser.friendRequests.find(
      req => req.from.toString() === currentUserId.toString()
    );
    
    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }
    
    // Add friend request
    targetUser.friendRequests.push({ from: currentUserId });
    await targetUser.save();
    
    res.json({ message: 'Friend request sent' });
    
  } catch (error) {
    console.error('Friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/accept-friend/:userId
// @desc    Accept friend request
router.post('/accept-friend/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    
    const currentUser = await User.findById(currentUserId);
    const otherUser = await User.findById(userId);
    
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove friend request
    currentUser.friendRequests = currentUser.friendRequests.filter(
      req => req.from.toString() !== userId
    );
    
    // Add to friends lists
    currentUser.friends.push(userId);
    otherUser.friends.push(currentUserId);
    
    await currentUser.save();
    await otherUser.save();
    
    res.json({ message: 'Friend request accepted' });
    
  } catch (error) {
    console.error('Accept friend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/friends
// @desc    Get user's friends
router.get('/friends', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'username firstName lastName totalReviews averageRating')
      .populate('friendRequests.from', 'username firstName lastName');
    
    res.json({
      friends: user.friends,
      friendRequests: user.friendRequests
    });
    
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', async (req, res) => {
  try {
    // This route will use auth middleware
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;