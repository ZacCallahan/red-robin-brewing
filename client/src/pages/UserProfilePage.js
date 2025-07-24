import React, { useState, useEffect } from 'react';
import StarRating from '../components/StarRating';
import { api } from '../services/api';
import { Beer, Wine, Martini } from 'lucide-react';

const UserProfilePage = ({ selectedUser }) => {
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch reviews for the selected user
    const fetchUserReviews = async () => {
      if (!selectedUser?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const reviews = await api.users.getUserReviews(selectedUser._id);
        setUserReviews(reviews || []);
      } catch (error) {
        console.error('Error fetching user reviews:', error);
        setError('Failed to load user reviews');
        setUserReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserReviews();
  }, [selectedUser]);

  // Helper function to get user initials
  const getUserInitials = (user) => {
    if (!user) return '?';
    
    const firstName = user.firstName?.trim() || '';
    const lastName = user.lastName?.trim() || '';
    
    if (firstName && lastName) {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (lastName) {
      return lastName.charAt(0).toUpperCase();
    } else if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    
    return '?';
  };

  // Helper function to get beverage info from review
  const getBeverageInfo = (review) => {
    if (review.beer) {
      return {
        type: 'beer',
        name: review.beer.name,
        producer: review.beer.brewery,
        style: review.beer.style,
        icon: Beer,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      };
    } else if (review.wine) {
      return {
        type: 'wine',
        name: review.wine.name,
        producer: review.wine.winery,
        style: review.wine.style,
        icon: Wine,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      };
    } else if (review.spirit) {
      return {
        type: 'spirit',
        name: review.spirit.name,
        producer: review.spirit.distillery,
        style: review.spirit.style,
        icon: Martini,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50'
      };
    }
    
    return {
      type: 'unknown',
      name: 'Unknown Beverage',
      producer: 'Unknown Producer',
      style: 'Unknown Style',
      icon: Beer,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    };
  };

  // Get review counts by type
  const reviewCounts = userReviews.reduce((acc, review) => {
    if (review.beer) acc.beer++;
    else if (review.wine) acc.wine++;
    else if (review.spirit) acc.spirit++;
    return acc;
  }, { beer: 0, wine: 0, spirit: 0 });

  // Handle no user selected
  if (!selectedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <p className="text-gray-600">No user selected</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* User Profile Header */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8 border-4 border-gray-200">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl select-none">
                {getUserInitials(selectedUser)}
              </span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 font-serif select-none">
                {selectedUser.firstName} {selectedUser.lastName}
              </h1>
              <p className="text-xl text-red-600 select-none">@{selectedUser.username}</p>
              <p className="text-gray-600 text-sm mt-2 select-none">
                Member since {new Date(selectedUser.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {/* User stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600 select-none">
                {userReviews.length}
              </div>
              <div className="text-sm text-gray-600 select-none">Total Reviews</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-lg font-bold text-red-600 select-none flex items-center justify-center gap-1">
                <Beer className="w-4 h-4" />
                {reviewCounts.beer}
              </div>
              <div className="text-xs text-gray-600 select-none">Beer Reviews</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-lg font-bold text-purple-600 select-none flex items-center justify-center gap-1">
                <Wine className="w-4 h-4" />
                {reviewCounts.wine}
              </div>
              <div className="text-xs text-gray-600 select-none">Wine Reviews</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg text-center">
              <div className="text-lg font-bold text-amber-600 select-none flex items-center justify-center gap-1">
                <Martini className="w-4 h-4" />
                {reviewCounts.spirit}
              </div>
              <div className="text-xs text-gray-600 select-none">Spirit Reviews</div>
            </div>
          </div>
        </div>

        {/* User Reviews Section */}
        <div className="bg-white rounded-xl shadow-xl p-8 border-4 border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif">
            {selectedUser.firstName}'s Reviews
          </h3>
          
          {/* Loading state */}
          {loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-white font-bold">⭐</span>
              </div>
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          ) : error ? (
            /* Error state */
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">Error loading reviews</p>
              <p className="text-gray-500 text-sm">{error}</p>
            </div>
          ) : userReviews.length === 0 ? (
            /* Empty state */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📝</span>
              </div>
              <p className="text-gray-600 mb-2">No reviews yet</p>
              <p className="text-gray-500 text-sm">
                {selectedUser.firstName} hasn't reviewed any beverages yet
              </p>
            </div>
          ) : (
            /* Reviews list */
            <div className="space-y-6">
              {userReviews.map((review) => {
                const beverageInfo = getBeverageInfo(review);
                const Icon = beverageInfo.icon;
                
                return (
                  <div
                    key={review._id}
                    className={`border-2 border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors ${beverageInfo.bgColor}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start gap-3">
                        <Icon className={`w-6 h-6 ${beverageInfo.color} flex-shrink-0 mt-1`} />
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">
                            {beverageInfo.name}
                          </h4>
                          <p className={`font-medium ${beverageInfo.color}`}>
                            {beverageInfo.producer}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {beverageInfo.style}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${beverageInfo.bgColor} ${beverageInfo.color} font-medium mt-1 inline-block`}>
                            {beverageInfo.type.charAt(0).toUpperCase() + beverageInfo.type.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <StarRating rating={review.rating} />
                          <span className={`text-lg font-bold ${beverageInfo.color}`}>
                            {review.rating}/5
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {review.notes && (
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-700 leading-relaxed italic">
                          "{review.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* User Activity Summary */}
        {userReviews.length > 0 && (
          <div className="bg-white rounded-xl shadow-xl p-8 border-4 border-gray-200 text-center mt-8">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-2xl select-none">
                {getUserInitials(selectedUser)}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
              {selectedUser.firstName}'s Beverage Journey
            </h3>
            
            <div className="space-y-4">
              <p className="text-gray-700 text-lg">
                <span className="font-semibold text-red-600">{selectedUser.firstName}</span> has reviewed{' '}
                <span className="font-bold">{userReviews.length}</span> beverage{userReviews.length !== 1 ? 's' : ''}
                {selectedUser.averageRating > 0 && (
                  <>
                    {' '}with an average rating of{' '}
                    <span className="font-bold text-red-600">{selectedUser.averageRating.toFixed(1)} stars</span>
                  </>
                )}
              </p>
              
              {/* Breakdown by category */}
              <div className="flex items-center justify-center gap-6 text-sm">
                {reviewCounts.beer > 0 && (
                  <div className="flex items-center gap-1">
                    <Beer className="w-4 h-4 text-red-600" />
                    <span className="font-semibold">{reviewCounts.beer}</span>
                    <span className="text-gray-600">beer{reviewCounts.beer !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {reviewCounts.wine > 0 && (
                  <div className="flex items-center gap-1">
                    <Wine className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold">{reviewCounts.wine}</span>
                    <span className="text-gray-600">wine{reviewCounts.wine !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {reviewCounts.spirit > 0 && (
                  <div className="flex items-center gap-1">
                    <Martini className="w-4 h-4 text-amber-600" />
                    <span className="font-semibold">{reviewCounts.spirit}</span>
                    <span className="text-gray-600">spirit{reviewCounts.spirit !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {selectedUser.totalBeersAdded > 0 && (
                <p className="text-gray-700">
                  They've also contributed <span className="font-bold text-red-600">{selectedUser.totalBeersAdded}</span>{' '}
                  beverage{selectedUser.totalBeersAdded !== 1 ? 's' : ''} to our collection
                </p>
              )}

              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="text-gray-600">Overall rating style:</span>
                <StarRating rating={Math.round(selectedUser.averageRating || 0)} />
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 italic">
                "Every beverage tells a story, and every review helps others discover their next favorite drink"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;