import React, { useState } from 'react';
import { Search, Clock, Filter } from 'lucide-react';
import BeerCard from '../components/BeerCard';

const BeersPage = ({ beers, handleBeerSelect }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [showSessionableOnly, setShowSessionableOnly] = useState(false);
  const [beverageType, setBeverageType] = useState('all'); // New filter: 'all', 'beer', 'cider'
  
  // Get unique styles for filter dropdown
  const availableStyles = [...new Set(beers.map(beer => beer.style))].sort();

  // Helper function to determine if a style is a cider
  const isCiderStyle = (style) => {
    const ciderStyles = [
      'Traditional Cider', 'Fruit Cider', 'Hopped Cider', 'Sour Cider', 
      'Perry', 'Ice Cider', 'Cyser'
    ];
    return ciderStyles.includes(style);
  };

  // Filter beers based on search and filters
  const filteredBeers = beers.filter(beer => {
    const matchesSearch = !localSearchTerm || 
      beer.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      beer.brewery.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      beer.style.toLowerCase().includes(localSearchTerm.toLowerCase());

    const matchesStyle = !selectedStyle || beer.style === selectedStyle;
    const matchesRating = !minRating || (beer.averageRating || 0) >= minRating;
    const matchesSessionable = !showSessionableOnly || beer.sessionable;
    
    // New beverage type filter
    const matchesBeverageType = 
      beverageType === 'all' || 
      (beverageType === 'cider' && isCiderStyle(beer.style)) ||
      (beverageType === 'beer' && !isCiderStyle(beer.style));

    return matchesSearch && matchesStyle && matchesRating && matchesSessionable && matchesBeverageType;
  });

  // Sort beers based on selected criteria
  const sortedBeers = [...filteredBeers].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.averageRating || 0) - (a.averageRating || 0);
      case 'reviews':
        return (b.totalReviews || 0) - (a.totalReviews || 0);
      case 'recent':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'abv-low':
        return (a.abv || 0) - (b.abv || 0);
      case 'abv-high':
        return (b.abv || 0) - (a.abv || 0);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Count different types for display
  const sessionableCount = beers.filter(beer => beer.sessionable).length;
  const ciderCount = beers.filter(beer => isCiderStyle(beer.style)).length;
  const beerCount = beers.length - ciderCount;
    
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between max-w-5xl mx-auto">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-4xl font-bold text-white mb-2 font-serif select-none">All Beer + Cider</h2>
              <p className="text-red-100 text-lg select-none">Explore our full beer and cider database</p>
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-center gap-6">
              {/* Breakdown Bubbles - Vertical stack with smaller size */}
              <div className="flex flex-row md:flex-col gap-2">
                <div className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-center text-xs min-w-[80px]">
                  <div className="text-gray-600 text-xs">
                    <span className="font-semibold text-sm">{beerCount}</span> 🍺 Beers
                  </div>
                </div>
                <div className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-center text-xs min-w-[80px]">
                  <div className="text-gray-600 text-xs">
                    <span className="font-semibold text-sm">{ciderCount}</span> 🍎 Ciders
                  </div>
                </div>
                <div className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-center text-xs min-w-[80px]">
                  <div className="text-gray-600 text-xs">
                    <span className="font-semibold text-sm">{sessionableCount}</span> ⏱️ Sessionable
                  </div>
                </div>
              </div>
              
              {/* Total Count Bubble - On the right */}
              <div className="bg-black text-white px-8 py-4 rounded-xl text-center shadow-lg">
                <div className="text-4xl font-bold">{beers.length}</div>
                <div className="text-base text-gray-300 uppercase tracking-wider font-medium">Total Beverages</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-black mb-2 select-none">Search</label>
              <div className="relative">
                <Search className="w-5 h-5 text-black absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search beers, ciders, breweries, or styles..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-black mb-2 select-none">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              >
                <option value="name">Name (A-Z)</option>
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviewed</option>
                <option value="recent">Recently Added</option>
                <option value="abv-low">Lowest ABV</option>
                <option value="abv-high">Highest ABV</option>
              </select>
            </div>

            {/* Filter by Style */}
            <div>
              <label className="block text-sm font-medium text-black mb-2 select-none">Style</label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              >
                <option value="">All Styles</option>
                {availableStyles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Beverage Type and Sessionable Filters */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-black mb-3 select-none flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Beverage Type & Filters
            </label>
            <div className="flex items-center gap-4 flex-wrap">
              {/* Beverage Type Buttons */}
              <button
                onClick={() => setBeverageType('all')}
                className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 text-sm font-medium select-none ${
                  beverageType === 'all'
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 hover:border-black text-gray-600 hover:text-black'
                }`}
              >
                All ({beers.length})
              </button>
              <button
                onClick={() => setBeverageType('beer')}
                className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 text-sm font-medium select-none ${
                  beverageType === 'beer'
                    ? 'border-red-500 bg-red-500 text-white'
                    : 'border-gray-300 hover:border-red-500 text-gray-600 hover:text-red-600'
                }`}
              >
                🍺 Beer Only ({beerCount})
              </button>
              <button
                onClick={() => setBeverageType('cider')}
                className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 text-sm font-medium select-none ${
                  beverageType === 'cider'
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-gray-300 hover:border-orange-500 text-gray-600 hover:text-orange-600'
                }`}
              >
                🍎 Cider Only ({ciderCount})
              </button>
              
              {/* Separator */}
              <div className="hidden sm:block w-px h-8 bg-gray-300 mx-2"></div>
              
              {/* Sessionable Filter */}
              <button
                onClick={() => setShowSessionableOnly(!showSessionableOnly)}
                className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 text-sm font-medium select-none flex items-center gap-2 ${
                  showSessionableOnly
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 hover:border-green-500 text-gray-600 hover:text-green-600'
                }`}
              >
                <Clock className="w-4 h-4" />
                Sessionable Only
              </button>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-black mb-3 select-none">Minimum Rating</label>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              {[0, 1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg border-2 transition-all duration-200 text-xs sm:text-sm font-medium select-none flex-shrink-0 ${
                    minRating === rating
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 hover:border-black text-gray-600 hover:text-black'
                  }`}
                >
                  {rating === 0 ? 'All' : `${rating}⭐+`}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {(localSearchTerm || selectedStyle || minRating > 0 || showSessionableOnly || beverageType !== 'all') && (
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  setLocalSearchTerm('');
                  setSelectedStyle('');
                  setMinRating(0);
                  setShowSessionableOnly(false);
                  setBeverageType('all');
                  setSortBy('name');
                }}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-semibold transition-colors select-none"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-700 font-medium select-none">
            Showing <span className="text-black font-bold select-none">{sortedBeers.length}</span> of <span className="text-black font-bold select-none">{beers.length}</span> {beverageType === 'all' ? 'beverages' : beverageType === 'beer' ? 'beers' : 'ciders'}
            {localSearchTerm && ` matching "${localSearchTerm}"`}
            {selectedStyle && ` in ${selectedStyle} style`}
            {minRating > 0 && ` rated ${minRating}+ stars`}
            {showSessionableOnly && ` that are sessionable`}
          </p>
        </div>

        {/* Beer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBeers.length > 0 ? (
            sortedBeers.map((beer) => (
              <BeerCard key={beer._id} beer={beer} onClick={handleBeerSelect} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2 select-none">
                  No {beverageType === 'all' ? 'beverages' : beverageType === 'beer' ? 'beers' : 'ciders'} found
                </h3>
                <p className="text-gray-600 mb-4 select-none">
                  {localSearchTerm 
                    ? `No ${beverageType === 'all' ? 'beverages' : beverageType === 'beer' ? 'beers' : 'ciders'} match your search "${localSearchTerm}"`
                    : showSessionableOnly
                    ? `No sessionable ${beverageType === 'all' ? 'beverages' : beverageType === 'beer' ? 'beers' : 'ciders'} match your filters`
                    : 'Try adjusting your filters'
                  }
                </p>
                <button
                  onClick={() => {
                    setLocalSearchTerm('');
                    setSelectedStyle('');
                    setMinRating(0);
                    setShowSessionableOnly(false);
                    setBeverageType('all');
                  }}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 font-semibold transition-colors select-none"
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BeersPage;