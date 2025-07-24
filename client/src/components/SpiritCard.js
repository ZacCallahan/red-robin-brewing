import React from 'react';
import { ChevronRight, Clock } from 'lucide-react';
import StarRating from './StarRating';

// Card component for displaying spirit information
const SpiritCard = ({ spirit, onClick }) => (
  <div 
    className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 border-2 border-gray-200 hover:border-amber-600"
    onClick={() => onClick(spirit)}
  >
    <div className="p-6 bg-white">
      {/* Header with spirit name and age badge */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-2xl text-black font-serif select-none flex-1">
          {spirit.name}
        </h3>
        {spirit.age && spirit.age > 0 && (
          <div className="ml-2 flex-shrink-0">
            <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {spirit.age}Y
            </div>
          </div>
        )}
      </div>
      
      {/* Distillery name */}
      <p className="text-amber-600 font-semibold mb-4 text-xl select-none">
        {spirit.distillery}
      </p>
      
      {/* Style and ABV info grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-600 mb-3">Style</div>
          <span className="text-sm font-medium text-gray-700 bg-gray-200 px-3 py-1 rounded-lg select-none">
            {spirit.style}
          </span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-200">
          <div className="text-xs text-gray-600 mb-1">Alcohol</div>
          <span className="text-lg font-bold text-black select-none">
            {spirit.abv}% ABV
          </span>
        </div>
      </div>
      
      {/* Spirit-specific info */}
      {(spirit.category || spirit.region) && (
        <div className="mb-4 space-y-2">
          {spirit.category && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Category:</span>
              <span className="text-sm font-medium text-gray-800">{spirit.category}</span>
            </div>
          )}
          {spirit.region && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Region:</span>
              <span className="text-sm font-medium text-gray-800">{spirit.region}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Rating section - Fixed overflow with proper containment */}
      <div className="border-t border-gray-300 pt-4">
        <div className="mb-2">
          <span className="text-sm font-medium text-gray-700 select-none block mb-2">
            Community Rating:
          </span>
          <div className="mb-1">
            <StarRating rating={spirit.averageRating || 0} />
          </div>
          <div className="text-sm font-semibold text-black select-none break-words">
            {spirit.averageRating ? spirit.averageRating.toFixed(1) : '0.0'}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 select-none">
            {spirit.totalReviews || 0} reviews
          </span>
          <ChevronRight className="w-5 h-5 text-black group-hover:text-amber-600 transition-colors" />
        </div>
      </div>
    </div>
  </div>
);

export default SpiritCard;