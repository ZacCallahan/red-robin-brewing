import React from 'react';
import { ChevronRight } from 'lucide-react';
import StarRating from './StarRating';

// Card component for displaying wine information
const WineCard = ({ wine, onClick }) => (
  <div 
    className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 border-2 border-gray-200 hover:border-purple-600"
    onClick={() => onClick(wine)}
  >
    <div className="p-6 bg-white">
      {/* Header with wine name and vintage */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-2xl text-black font-serif select-none flex-1">
          {wine.name}
        </h3>
        {wine.vintage && (
          <div className="ml-2 flex-shrink-0">
            <div className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
              {wine.vintage}
            </div>
          </div>
        )}
      </div>
      
      {/* Winery name */}
      <p className="text-purple-600 font-semibold mb-4 text-xl select-none">
        {wine.winery}
      </p>
      
      {/* Style and ABV info grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-600 mb-3">Style</div>
          <span className="text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-purple-800 px-3 py-1 rounded-full select-none">
            {wine.style}
          </span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-200">
          <div className="text-xs text-gray-600 mb-1">Alcohol</div>
          <span className="text-lg font-bold text-black select-none">
            {wine.abv}% ABV
          </span>
        </div>
      </div>
      
      {/* Wine-specific info */}
      {(wine.region || wine.sweetness) && (
        <div className="mb-4 space-y-2">
          {wine.region && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Region:</span>
              <span className="text-sm font-medium text-gray-800">{wine.region}</span>
            </div>
          )}
          {wine.sweetness && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Sweetness:</span>
              <span className="text-sm font-medium text-gray-800">{wine.sweetness}</span>
            </div>
          )}
          {wine.grapeVariety && wine.grapeVariety.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Grapes:</span>
              <span className="text-sm font-medium text-gray-800">
                {wine.grapeVariety.slice(0, 2).join(', ')}
                {wine.grapeVariety.length > 2 && ` +${wine.grapeVariety.length - 2} more`}
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Rating section */}
      <div className="border-t border-gray-300 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 select-none">
            Community Rating:
          </span>
          <div className="flex items-center gap-2">
            <StarRating rating={wine.averageRating || 0} />
            <span className="text-sm font-semibold text-black select-none">
              {wine.averageRating ? wine.averageRating.toFixed(1) : '0.0'}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 select-none">
            {wine.totalReviews || 0} reviews
          </span>
          <ChevronRight className="w-5 h-5 text-black group-hover:text-purple-600 transition-colors" />
        </div>
      </div>
    </div>
  </div>
);

export default WineCard;