import React from 'react';
import { ChevronRight, Clock } from 'lucide-react';
import StarRating from './StarRating';

const BeerCard = ({ beer, onClick }) => (
  <div 
    className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 border-2 border-gray-200 hover:border-black"
    onClick={() => onClick(beer)}
  >
    <div className="p-6 bg-white">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-2xl text-black font-serif select-none flex-1">{beer.name}</h3>
        {beer.sessionable && (
          <div className="ml-2 flex-shrink-0">
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              SESSIONABLE
            </div>
          </div>
        )}
      </div>
      
      <p className="text-red-600 font-semibold mb-4 text-xl select-none">{beer.brewery}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-600 mb-1">Style</div>
          <span className="text-sm font-bold text-white bg-gradient-to-r from-black to-gray-800 px-3 py-1 rounded-full select-none">{beer.style}</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-200">
          <div className="text-xs text-gray-600 mb-1">Alcohol</div>
          <span className="text-lg font-bold text-black select-none">{beer.abv}% ABV</span>
        </div>
      </div>
      
      <div className="border-t border-gray-300 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 select-none">Community Rating:</span>
          <div className="flex items-center gap-2">
            <StarRating rating={beer.averageRating || 0} />
            <span className="text-sm font-semibold text-black select-none">
              {beer.averageRating ? beer.averageRating.toFixed(1) : '0.0'}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 select-none">{beer.totalReviews || 0} reviews</span>
          <ChevronRight className="w-5 h-5 text-black group-hover:text-red-600 transition-colors" />
        </div>
      </div>
    </div>
  </div>
);

export default BeerCard;