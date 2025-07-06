const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  beer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beer',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  username: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one review per user per beer
reviewSchema.index({ user: 1, beer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);