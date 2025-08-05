const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Make beer optional since we now support multiple types
  beer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beer',
    required: false
  },
  wine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wine',
    required: false
  },
  spirit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Spirit',
    required: false
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

// Validation to ensure exactly one beverage type is set
reviewSchema.pre('validate', function(next) {
  const beverageFields = [this.beer, this.wine, this.spirit].filter(Boolean);
  if (beverageFields.length !== 1) {
    next(new Error('Review must be associated with exactly one beverage (beer, wine, or spirit)'));
  } else {
    next();
  }
});

// Replace the current indexes with these compound indexes
reviewSchema.index({ user: 1, beer: 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { beer: { $exists: true, $ne: null } }
});

reviewSchema.index({ user: 1, wine: 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { wine: { $exists: true, $ne: null } }
});

reviewSchema.index({ user: 1, spirit: 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { spirit: { $exists: true, $ne: null } }
});

module.exports = mongoose.model('Review', reviewSchema);