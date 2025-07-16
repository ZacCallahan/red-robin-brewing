const mongoose = require('mongoose');

const spiritSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  distillery: {
    type: String,
    required: true,
    trim: true
  },
  style: {
    type: String,
    required: true,
    enum: ['Whiskey', 'Rum', 'Vodka', 'Gin', 'Tequila', 'Brandy', 'Liqueur', 'Other']
  },
  abv: {
    type: Number,
    required: true,
    min: 15,
    max: 80
  },
  age: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    trim: true
  },
  region: {
    type: String,
    trim: true
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

module.exports = mongoose.model('Spirit', spiritSchema);