import React, { useState } from 'react';
import { Search, Martini } from 'lucide-react';
import SpiritCard from '../components/SpiritCard';

const SpiritsPage = ({ spirits, handleSpiritSelect }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [showAgedOnly, setShowAgedOnly] = useState(false);
  
  // Get unique styles for filter dropdown
  const availableStyles = [...new Set(spirits.map(spirit => spirit.style))].sort();

  // Filter spirits based on search and filters
  const filteredSpirits = spirits.filter(spirit => {
    const matchesSearch = !localSearchTerm || 
      spirit.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      spirit.distillery.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      spirit.style.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      (spirit.category && spirit.category.toLowerCase().includes(localSearchTerm.toLowerCase())) ||
      (spirit.region && spirit.region.toLowerCase().includes(localSearchTerm.toLowerCase()));

    const matchesStyle = !selectedStyle || spirit.style === selectedStyle;
    const matchesRating = !minRating || (spirit.averageRating || 0) >= minRating;
    const matchesAge = !showAgedOnly || (spirit.age && spirit.age > 0);

    return matchesSearch && matchesStyle && matchesRating && matchesAge;
  });

  // Sort spirits based on selected criteria
  const sortedSpirits = [...filteredSpirits].sort((a, b) => {
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
      case 'age':
        return (b.age || 0) - (a.age || 0);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between max-w-5xl mx-auto">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-4xl font-bold text-white mb-2 font-serif select-none">All Spirits</h2>
              <p className="text-amber-100 text-lg select-none">Explore our spirits collection</p>
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-center gap-6">
              {/* Breakdown Bubbles - Vertical stack with smaller size */}
              <div className="flex flex-row md:flex-col gap-2">
                <div className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-center text-xs min-w-[80px]">
                  <div className="text-gray-600 text-xs">
                    <span className="font-semibold text-sm">{spirits.filter(spirit => spirit.style?.toLowerCase().includes('whiskey') || spirit.style?.toLowerCase().includes('whisky') || spirit.style?.toLowerCase().includes('bourbon')).length}</span> 🥃 Whiskey
                  </div>
                </div>
                <div className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-center text-xs min-w-[80px]">
                  <div className="text-gray-600 text-xs">
                    <span className="font-semibold text-sm">{spirits.filter(spirit => spirit.style?.toLowerCase().includes('vodka') || spirit.style?.toLowerCase().includes('gin') || spirit.style?.toLowerCase().includes('rum')).length}</span> 🍸 Clear
                  </div>
                </div>
                <div className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-center text-xs min-w-[80px]">
                  <div className="text-gray-600 text-xs">
                    <span className="font-semibold text-sm">{spirits.filter(spirit => spirit.age && spirit.age > 0).length}</span> ⏰ Aged
                  </div>
                </div>
              </div>
              
              {/* Total Count Bubble - On the right */}
              <div className="bg-black text-white px-8 py-4 rounded-xl text-center shadow-lg">
                <div className="text-4xl font-bold">{spirits.length}</div>
                <div className="text-base text-gray-300 uppercase tracking-wider font-medium">Total Spirits</div>
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
                  placeholder="Search spirits, distilleries, styles, or regions..."
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
                <option value="age">Oldest First</option>
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

          {/* Rating Filter and Aged Toggle */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* Rating Filter */}
            <div>
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

            {/* Aged Filter */}
            <div>
              <label className="block text-sm font-medium text-black mb-3 select-none">Spirit Type</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowAgedOnly(false)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 text-sm font-medium select-none ${
                    !showAgedOnly
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 hover:border-black text-gray-600 hover:text-black'
                  }`}
                >
                  All Spirits
                </button>
                <button
                  onClick={() => setShowAgedOnly(true)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 text-sm font-medium select-none flex items-center gap-2 ${
                    showAgedOnly
                      ? 'border-amber-600 bg-amber-600 text-white'
                      : 'border-gray-300 hover:border-amber-600 text-gray-600 hover:text-amber-600'
                  }`}
                >
                  <Martini className="w-4 h-4" />
                  Aged Only
                </button>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {(localSearchTerm || selectedStyle || minRating > 0 || showAgedOnly) && (
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  setLocalSearchTerm('');
                  setSelectedStyle('');
                  setMinRating(0);
                  setShowAgedOnly(false);
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
            Showing <span className="text-black font-bold select-none">{sortedSpirits.length}</span> of <span className="text-black font-bold select-none">{spirits.length}</span> spirits
            {localSearchTerm && ` matching "${localSearchTerm}"`}
            {selectedStyle && ` in ${selectedStyle} style`}
            {minRating > 0 && ` rated ${minRating}+ stars`}
            {showAgedOnly && ` that are aged`}
          </p>
        </div>

        {/* Spirit Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSpirits.length > 0 ? (
            sortedSpirits.map((spirit) => (
              <SpiritCard key={spirit._id} spirit={spirit} onClick={handleSpiritSelect} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Martini className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2 select-none">No spirits found</h3>
                <p className="text-gray-600 mb-4 select-none">
                  {localSearchTerm 
                    ? `No spirits match your search "${localSearchTerm}"`
                    : showAgedOnly
                    ? 'No aged spirits match your filters'
                    : 'Try adjusting your filters'
                  }
                </p>
                <button
                  onClick={() => {
                    setLocalSearchTerm('');
                    setSelectedStyle('');
                    setMinRating(0);
                    setShowAgedOnly(false);
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

export default SpiritsPage;