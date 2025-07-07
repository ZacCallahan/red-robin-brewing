import React, { useState } from 'react';
import { Search } from 'lucide-react';
import BeerCard from '../components/BeerCard';

const BeersPage = ({ beers, handleBeerSelect }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [minRating, setMinRating] = useState(0);
  
  // Get unique styles for filter dropdown
  const availableStyles = [...new Set(beers.map(beer => beer.style))].sort();

  // Filter beers based on search and filters
  const filteredBeers = beers.filter(beer => {
    const matchesSearch = !localSearchTerm || 
      beer.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      beer.brewery.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      beer.style.toLowerCase().includes(localSearchTerm.toLowerCase());

    const matchesStyle = !selectedStyle || beer.style === selectedStyle;
    const matchesRating = !minRating || (beer.averageRating || 0) >= minRating;

    return matchesSearch && matchesStyle && matchesRating;
  });

  // Sort beers
  const sortedBeers = [...filteredBeers].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.averageRating || 0) - (a.averageRating || 0);
      case 'reviews':
        return (b.totalReviews || 0) - (a.totalReviews || 0);
      case 'recent':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });
    
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header with black accent - made smaller */}
        <div className="bg-gradient-to-r from-black to-gray-800 rounded-xl p-2 mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2 font-serif select-none">All Beers ({beers.length})</h2>
          <p className="text-gray-300 select-none">Explore our complete craft beer collection</p>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-black mb-2 select-none">Search</label>
              <div className="relative">
                <Search className="w-5 h-5 text-red-500 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search beers, breweries, or styles..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-black mb-2 select-none">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="name">Name (A-Z)</option>
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviewed</option>
                <option value="recent">Recently Added</option>
              </select>
            </div>

            {/* Filter by Style */}
            <div>
              <label className="block text-sm font-medium text-black mb-2 select-none">Style</label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">All Styles</option>
                {availableStyles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-black mb-3 select-none">Minimum Rating</label>
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  className={`px-3 py-1.5 rounded-lg border-2 transition-all duration-200 text-sm font-medium select-none ${
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
          {(localSearchTerm || selectedStyle || minRating > 0) && (
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  setLocalSearchTerm('');
                  setSelectedStyle('');
                  setMinRating(0);
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
            Showing <span className="text-black font-bold select-none">{sortedBeers.length}</span> of <span className="text-black font-bold select-none">{beers.length}</span> beers
            {localSearchTerm && ` matching "${localSearchTerm}"`}
            {selectedStyle && ` in ${selectedStyle} style`}
            {minRating > 0 && ` rated ${minRating}+ stars`}
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
                <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2 select-none">No beers found</h3>
                <p className="text-gray-600 mb-4 select-none">
                  {localSearchTerm 
                    ? `No beers match your search "${localSearchTerm}"`
                    : 'Try adjusting your filters'
                  }
                </p>
                <button
                  onClick={() => {
                    setLocalSearchTerm('');
                    setSelectedStyle('');
                    setMinRating(0);
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