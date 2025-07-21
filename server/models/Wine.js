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
    enum: [
      // Red Wine Styles
      'Shiraz',
      'Cabernet Sauvignon', 
      'Cabernet Shiraz',
      'Cabernet Merlot',
      'Shiraz Viognier',
      'Pinot Noir',
      'Merlot',
      'Grenache',
      'Sangiovese',
      'Tempranillo',
      'Barbera',
      'Nebbiolo',
      'Malbec',
      'Petit Verdot',
      'Durif',
      
      // White Wine Styles
      'Chardonnay',
      'Sauvignon Blanc',
      'Semillon',
      'Riesling',
      'Pinot Grigio',
      'Pinot Gris',
      'Gewürztraminer',
      'Viognier',
      'Verdelho',
      'Chenin Blanc',
      'Moscato',
      'Albariño',
      
      // Sparkling & Other
      'Champagne',
      'Sparkling Shiraz',
      'Sparkling Chardonnay',
      'Sparkling Pinot Noir',
      'Cava',
      'Prosecco',
      'Rosé',
      'Dessert Wine',
      'Fortified',
      'Port',
      'Sherry',
      'Orange Wine',
      'Other'
    ]
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