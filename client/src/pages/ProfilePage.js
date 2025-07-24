import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StarRating from '../components/StarRating';
import BeerCard from '../components/BeerCard';
import { Beer, Wine, Martini } from 'lucide-react';

const ProfilePage = ({ isLoggedIn, user, handleNavigation, handleBeerSelect }) => {
  const [userReviews, setUserReviews] = useState([]);
  const [userBeers, setUserBeers] = useState([]);
  const [userWines, setUserWines] = useState([]);
  const [userSpirits, setUserSpirits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      loadUserProfile();
    }
  }, [isLoggedIn]);

  // Load user profile data
  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's reviews and beverages in parallel
      const [reviewsResponse, beersResponse, winesResponse, spiritsResponse] = await Promise.all([
        api.users.getMyReviews(),
        api.users.getMyBeers(),
        api.users.getMyWines(),
        api.users.getMySpirits()
      ]);

      setUserReviews(reviewsResponse);
      setUserBeers(beersResponse);
      setUserWines(winesResponse);
      setUserSpirits(spiritsResponse);

    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

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

  // Redirect if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h2>
          <button 
            onClick={() => handleNavigation('login')}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  // Get user's top rated reviews for display
  const topRatedReviews = userReviews
    .filter(review => review.rating >= 4)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  // Get review counts by type
  const reviewCounts = userReviews.reduce((acc, review) => {
    if (review.beer) acc.beer++;
    else if (review.wine) acc.wine++;
    else if (review.spirit) acc.spirit++;
    return acc;
  }, { beer: 0, wine: 0, spirit: 0 });

  const totalBeveragesAdded = userBeers.length + userWines.length + userSpirits.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8 border-4 border-gray-200">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center select-none">
              <span className="text-white font-bold text-2xl select-none">{getUserInitials(user)}</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 font-serif select-none">{user?.firstName} {user?.lastName}</h1>
              <p className="text-xl text-red-600 select-none">@{user?.username}</p>
              <p className="text-gray-600 select-none">{user?.email}</p>
            </div>
          </div>
          
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center select-none">
              <div className="text-2xl font-bold text-gray-900 select-none">{userReviews.length}</div>
              <div className="text-sm text-gray-600 select-none">Total Reviews</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center select-none">
              <div className="text-xl font-bold text-red-600 select-none flex items-center justify-center gap-1">
                <Beer className="w-4 h-4" />
                {reviewCounts.beer}
              </div>
              <div className="text-xs text-gray-600 select-none">Beer Reviews</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center select-none">
              <div className="text-xl font-bold text-purple-600 select-none flex items-center justify-center gap-1">
                <Wine className="w-4 h-4" />
                {reviewCounts.wine}
              </div>
              <div className="text-xs text-gray-600 select-none">Wine Reviews</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg text-center select-none">
              <div className="text-xl font-bold text-amber-600 select-none flex items-center justify-center gap-1">
                <Martini className="w-4 h-4" />
                {reviewCounts.spirit}
              </div>
              <div className="text-xs text-gray-600 select-none">Spirit Reviews</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center select-none">
              <div className="text-2xl font-bold text-gray-900 select-none">
                {userReviews.length > 0 
                  ? (userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <div className="text-sm text-gray-600 select-none">Avg Rating</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center select-none">
              <div className="text-2xl font-bold text-green-600 select-none">{topRatedReviews.length}</div>
              <div className="text-sm text-gray-600 select-none">Top Picks (4+ ⭐)</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Favorite Beverages */}
          <div className="bg-white rounded-xl shadow-xl p-8 border-4 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif select-none">🏆 My Top Picks</h3>
            {topRatedReviews.length > 0 ? (
              <div className="space-y-4">
                {topRatedReviews.map((review, index) => {
                  const beverageInfo = getBeverageInfo(review);
                  const Icon = beverageInfo.icon;
                  
                  return (
                    <div key={review._id} className={`flex items-center gap-4 p-4 rounded-lg ${beverageInfo.bgColor}`}>
                      <div className="w-8 h-8 bg-gray-700 text-white rounded-full flex items-center justify-center font-bold select-none">
                        {index + 1}
                      </div>
                      <Icon className={`w-5 h-5 ${beverageInfo.color}`} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 select-none">{beverageInfo.name}</h4>
                        <p className="text-sm text-gray-600 select-none">{beverageInfo.producer}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating rating={review.rating} size="w-4 h-4" />
                          <span className="text-sm font-semibold select-none">({review.rating}/5)</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${beverageInfo.bgColor} ${beverageInfo.color} font-medium`}>
                            {beverageInfo.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8 select-none">No highly rated beverages yet. Start reviewing to see your favorites here!</p>
            )}
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-xl shadow-xl p-8 border-4 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif select-none">📝 Recent Reviews</h3>
            {userReviews.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {userReviews.slice(0, 5).map((review) => {
                  const beverageInfo = getBeverageInfo(review);
                  const Icon = beverageInfo.icon;
                  
                  return (
                    <div key={review._id} className="border-b border-gray-200 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${beverageInfo.color}`} />
                          <h4 className="font-semibold text-gray-900 select-none">{beverageInfo.name}</h4>
                        </div>
                        <StarRating rating={review.rating} size="w-4 h-4" />
                      </div>
                      <p className="text-sm text-gray-600 mb-1 select-none">{beverageInfo.producer}</p>
                      {review.notes && (
                        <p className="text-sm text-gray-700 italic select-none">"{review.notes}"</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${beverageInfo.bgColor} ${beverageInfo.color} font-medium`}>
                          {beverageInfo.type}
                        </span>
                        <p className="text-xs text-gray-500 select-none">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {userReviews.length > 5 && (
                  <button className="text-red-600 hover:text-red-800 font-semibold text-sm">
                    View all {userReviews.length} reviews →
                  </button>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8 select-none">No reviews yet. Start reviewing beverages to see them here!</p>
            )}
          </div>
        </div>

        {/* My Added Beverages */}
        {totalBeveragesAdded > 0 && (
          <div className="bg-white rounded-xl shadow-xl p-8 mt-8 border-4 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif select-none">🍺🍷🥃 Beverages I've Added</h3>
            
            {/* Category tabs/sections */}
            <div className="space-y-8">
              {userBeers.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Beer className="w-5 h-5 text-red-600" />
                    <h4 className="text-xl font-bold text-gray-900">Beers ({userBeers.length})</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userBeers.map((beer) => (
                      <BeerCard key={beer._id} beer={beer} onClick={handleBeerSelect} />
                    ))}
                  </div>
                </div>
              )}

              {userWines.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Wine className="w-5 h-5 text-purple-600" />
                    <h4 className="text-xl font-bold text-gray-900">Wines ({userWines.length})</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userWines.map((wine) => (
                      <div
                        key={wine._id}
                        className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 border-2 border-gray-200 hover:border-purple-600"
                        onClick={() => handleBeerSelect && handleBeerSelect(wine)} // Reuse the handler for wines
                      >
                        <div className="p-6 bg-white">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-2xl text-black font-serif select-none flex-1">
                              {wine.name}
                            </h3>
                          </div>
                          
                          <p className="text-purple-600 font-semibold mb-4 text-xl select-none">
                            {wine.winery}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                              <div className="text-xs text-gray-600 mb-1">Style</div>
                              <span className="text-sm font-medium text-gray-700 bg-gray-200 px-3 py-1 rounded-lg select-none">
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
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {userSpirits.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Martini className="w-5 h-5 text-amber-600" />
                    <h4 className="text-xl font-bold text-gray-900">Spirits ({userSpirits.length})</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userSpirits.map((spirit) => (
                      <div
                        key={spirit._id}
                        className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 border-2 border-gray-200 hover:border-amber-600"
                        onClick={() => handleBeerSelect && handleBeerSelect(spirit)} // Reuse the handler for spirits
                      >
                        <div className="p-6 bg-white">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-2xl text-black font-serif select-none flex-1">
                              {spirit.name}
                            </h3>
                          </div>
                          
                          <p className="text-amber-600 font-semibold mb-4 text-xl select-none">
                            {spirit.distillery}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                              <div className="text-xs text-gray-600 mb-1">Style</div>
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
                          
                          <div className="border-t border-gray-300 pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700 select-none">
                                Community Rating:
                              </span>
                              <div className="flex items-center gap-2">
                                <StarRating rating={spirit.averageRating || 0} />
                                <span className="text-sm font-semibold text-black select-none">
                                  {spirit.averageRating ? spirit.averageRating.toFixed(1) : '0.0'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 select-none">
                                {spirit.totalReviews || 0} reviews
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;