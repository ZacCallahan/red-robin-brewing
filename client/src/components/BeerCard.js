import React from 'react';
import { ChevronRight } from 'lucide-react';
import StarRating from './StarRating';

// Card component for displaying beer information
const BeerCard = ({ beer, onClick }) => (
  <div 
    className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 border-2 border-gray-200 hover:border-black"
    onClick={() => onClick(beer)}
  >
    <div className="p-6 bg-white">
      {/* Header with beer name and sessionable badge */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-2xl text-black font-serif select-none flex-1">
          {beer.name}
        </h3>
        {beer.sessionable && (
          <div className="ml-2 flex-shrink-0">
          <div className="bg-gray-200 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium">
              SESSIONABLE
            </div>
          </div>
        )}
      </div>
      
      {/* Brewery name */}
      <p className="text-red-600 font-semibold mb-4 text-xl select-none">
        {beer.brewery}
      </p>
      
      {/* Style and ABV info grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-600 mb-3">Style</div>
          <span className="text-sm font-medium text-gray-700 bg-gray-200 px-3 py-1 rounded-lg select-none">
            {beer.style}
          </span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-200">
          <div className="text-xs text-gray-600 mb-1">Alcohol</div>
          <span className="text-lg font-bold text-black select-none">
            {beer.abv}% ABV
          </span>
        </div>
      </div>
      
      {/* Rating section */}
      <div className="border-t border-gray-300 pt-4">
        <div className="mb-2">
          <span className="text-sm font-medium text-gray-700 select-none block mb-2">
            Community Rating:
          </span>
          <div className="mb-1">
            <StarRating rating={beer.averageRating || 0} />
          </div>
          <div className="text-sm font-semibold text-black select-none">
            {beer.averageRating ? beer.averageRating.toFixed(1) : '0.0'}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 select-none">
            {beer.totalReviews || 0} reviews
          </span>
          <ChevronRight className="w-5 h-5 text-black group-hover:text-red-600 transition-colors" />
        </div>
      </div>
    </div>
  </div>
);

export default BeerCard;