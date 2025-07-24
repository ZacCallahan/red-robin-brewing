const mongoose = require('mongoose');

const beerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  brewery: {
    type: String,
    required: true,
    trim: true
  },
  style: {
    type: String,
    required: true,
       enum: [
      // Beer Styles
      'IPA', 'Stout', 'Wheat', 'Lager', 'Ale', 'Pilsner', 'Sour', 'Porter',
      // Cider Styles
      'Traditional Cider', 'Fruit Cider', 'Hopped Cider', 'Sour Cider',
      // Other
      'Other'
    ]
  },
  abv: {
    type: Number,
    required: true,
    min: 0,
    max: 20
  },
  sessionable: {
  type: Boolean,
  default: false
},
  description: {
    type: String,
    maxlength: 500
  },
  image: {
    type: String,
    default: ''
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Beer', beerSchema);