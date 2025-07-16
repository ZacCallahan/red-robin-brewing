    const mongoose = require('mongoose');

const wineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  winery: {
    type: String,
    required: true,
    trim: true
  },
  style: {
    type: String,
    required: true,
    enum: ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert', 'Fortified', 'Orange', 'Other']
  },
  abv: {
    type: Number,
    required: true,
    min: 0,
    max: 20
  },
  vintage: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear() + 2
  },
  region: {
    type: String,
    trim: true
  },
  sweetness: {
    type: String,
    enum: ['Bone Dry', 'Dry', 'Off-Dry', 'Medium-Dry', 'Medium-Sweet', 'Sweet', 'Very Sweet']
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

module.exports = mongoose.model('Wine', wineSchema);