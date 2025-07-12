const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');

// Search users by username or name
router.get('/users/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user._id;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }
    
    // Search users by username, firstName, or lastName, excluding current user
    const users = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { firstName: { $regex: q, $options: 'i' } },
            { lastName: { $regex: q, $options: 'i' } }
          ]
        },
        { _id: { $ne: currentUserId } }
      ]
    }).select('username firstName lastName createdAt').limit(10);
    
    // Calculate statistics for each user
    const Review = require('../models/Review');
    const Beer = require('../models/Beer');
    
    const usersWithStats = await Promise.all(users.map(async (user) => {
      // Get user's reviews
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
        averageRating: Math.round(averageRating * 10) / 10
      };
    }));
    
    res.json(usersWithStats);
    
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Server error during user search' });
  }
});

// Get reviews for a specific user
router.get('/users/:userId/reviews', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const Review = require('../models/Review');
    const Beer = require('../models/Beer');
    
    // Query reviews and populate beer details
    const reviews = await Review.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('beer', 'name brewery style')
      .lean();
    
    // Map response for frontend compatibility
    const reviewsWithBeerDetails = reviews.map(review => ({
      ...review,
      _id: review._id,
      rating: review.rating,
      comment: review.notes,
      createdAt: review.createdAt,
      beer: review.beer
    }));
    
    res.json(reviewsWithBeerDetails);
    
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching user reviews' });
  }
});

// Register new user with email verification
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken' 
      });
    }
    
    // Create new unverified user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      isEmailVerified: false
    });
    
    // Generate verification token
    const verificationToken = user.generateEmailVerificationToken();
    
    // Save user
    await user.save();
    
    // Send verification email
    const emailSent = await sendVerificationEmail(user, verificationToken);
    
    if (!emailSent) {
      console.error('Failed to send verification email to:', user.email);
      return res.status(201).json({
        message: 'Account created! However, there was an issue sending the verification email. Please contact support.',
        email: user.email,
        emailError: true
      });
    }
    
    // Success response
    res.status(201).json({
      message: 'Account created! Please check your email for verification link.',
      email: user.email
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Verify email with token
router.get('/verify-email', async (req, res) => {
  try {
    const { token, email } = req.query;
    
    if (!token || !email) {
      return res.status(400).json({ message: 'Missing verification token or email' });
    }
    
    // Find user with matching token and email
    const user = await User.findOne({
      email: decodeURIComponent(email),
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification token' 
      });
    }
    
    // Verify the user
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();
    
    // Send welcome email
    await sendWelcomeEmail(user);
    
    res.json({ 
      message: 'Email verified successfully! You can now log in.',
      verified: true
    });
    
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// Login user with email verification check
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
    
    // Check email verification
    if (!user.isEmailVerified) {
      return res.status(400).json({ 
        message: 'Please verify your email before logging in. Check your inbox for the verification link.',
        emailNotVerified: true,
        email: user.email
      });
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

// Send friend request
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

// Accept friend request
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

// Get user's friends and friend requests
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

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ 
        message: 'If an account with that email exists, we have sent a password reset link.',
        email: email
      });
    }
    
    // Check if user is verified
    if (!user.isEmailVerified) {
      return res.status(400).json({ 
        message: 'Please verify your email address before resetting your password.',
        emailNotVerified: true
      });
    }
    
    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();
    
    // Send reset email
    const emailSent = await sendPasswordResetEmail(user, resetToken);
    
    if (!emailSent) {
      console.error('Failed to send password reset email to:', user.email);
      return res.status(500).json({ 
        message: 'Failed to send password reset email. Please try again later.',
        emailError: true
      });
    }
    
    res.json({ 
      message: 'If an account with that email exists, we have sent a password reset link.',
      email: email
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;
    
    if (!token || !email || !newPassword) {
      return res.status(400).json({ message: 'Token, email, and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find user with matching token and email
    const user = await User.findOne({
      email: email.toLowerCase(),
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired password reset token' 
      });
    }
    
    // Update password and clear reset fields
    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
    
    console.log(`✅ Password reset successful for user: ${user.email}`);
    
    res.json({ 
      message: 'Password reset successful! You can now log in with your new password.',
      success: true
    });
    
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;