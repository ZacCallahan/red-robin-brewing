import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StarRating from '../components/StarRating';
import BeerCard from '../components/BeerCard';

const ProfilePage = ({ isLoggedIn, user, handleNavigation, handleBeerSelect }) => {
  const [userStats, setUserStats] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [userBeers, setUserBeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      loadUserProfile();
    }
  }, [isLoggedIn]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's reviews and beers in parallel
      const [reviewsResponse, beersResponse, profileResponse] = await Promise.all([
        api.users.getMyReviews(),
        api.users.getMyBeers(),
        api.auth.getProfile()
      ]);

      setUserReviews(reviewsResponse);
      setUserBeers(beersResponse);
      setUserStats(profileResponse);

    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h2>
          <button 
            onClick={() => handleNavigation('login')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  const topRatedReviews = userReviews
    .filter(review => review.rating >= 4)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

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
            <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center select-none">
              <span className="text-white font-bold text-2xl select-none">{user?.username?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 font-serif select-none">{user?.firstName} {user?.lastName}</h1>
              <p className="text-xl text-red-600 select-none">@{user?.username}</p>
              <p className="text-gray-600 select-none">{user?.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-red-50 p-4 rounded-lg text-center select-none">
              <div className="text-2xl font-bold text-red-600 select-none">{userReviews.length}</div>
              <div className="text-sm text-gray-600 select-none">Reviews</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center select-none">
              <div className="text-2xl font-bold text-red-600 select-none">{userBeers.length}</div>
              <div className="text-sm text-gray-600 select-none">Beers Added</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center select-none">
              <div className="text-2xl font-bold text-red-600 select-none">
                {userReviews.length > 0 
                  ? (userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <div className="text-sm text-gray-600 select-none">Avg Rating</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center select-none">
              <div className="text-2xl font-bold text-red-600 select-none">{topRatedReviews.length}</div>
              <div className="text-sm text-gray-600 select-none">Top Picks (4+ ⭐)</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top 3 Favorite Beers */}
          <div className="bg-white rounded-xl shadow-xl p-8 border-4 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif select-none">🏆 My Top Picks</h3>
            {topRatedReviews.length > 0 ? (
              <div className="space-y-4">
                {topRatedReviews.map((review, index) => (
                  <div key={review._id} className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                    <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold select-none">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 select-none">{review.beer?.name}</h4>
                      <p className="text-sm text-gray-600 select-none">{review.beer?.brewery}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={review.rating} size="w-4 h-4" />
                        <span className="text-sm font-semibold select-none">({review.rating}/5)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8 select-none">No highly rated beers yet. Start reviewing to see your favorites here!</p>
            )}
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-xl shadow-xl p-8 border-4 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif select-none">📝 Recent Reviews</h3>
            {userReviews.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {userReviews.slice(0, 5).map((review) => (
                  <div key={review._id} className="border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 select-none">{review.beer?.name}</h4>
                      <StarRating rating={review.rating} size="w-4 h-4" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1 select-none">{review.beer?.brewery}</p>
                    {review.notes && (
                      <p className="text-sm text-gray-700 italic select-none">"{review.notes}"</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2 select-none">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {userReviews.length > 5 && (
                  <button className="text-red-600 hover:text-red-800 font-semibold text-sm">
                    View all {userReviews.length} reviews →
                  </button>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8 select-none">No reviews yet. Start reviewing beers to see them here!</p>
            )}
          </div>
        </div>

        {/* My Added Beers */}
        {userBeers.length > 0 && (
          <div className="bg-white rounded-xl shadow-xl p-8 mt-8 border-4 border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif select-none">🍺 Beers I've Added</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBeers.map((beer) => (
                <BeerCard key={beer._id} beer={beer} onClick={handleBeerSelect} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;