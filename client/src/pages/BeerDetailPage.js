import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { api } from '../services/api';
import StarRating from '../components/StarRating';

const BeerDetailPage = ({ 
  selectedBeer, 
  beerReviews, 
  isLoggedIn, 
  user, 
  handleNavigation, 
  handleLogout, 
  loadBeerReviews, 
  refreshBeers 
}) => {
  const [reviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [localUserReview, setLocalUserReview] = useState({ rating: 0, notes: '', username: '' });

  // Reset user review when beer or login state changes
  useEffect(() => {
    if (isLoggedIn && user) {
      setLocalUserReview({ 
        rating: 0, 
        notes: '', 
        username: user.username || '' 
      });
    } else {
      setLocalUserReview({ rating: 0, notes: '', username: '' });
    }
  }, [selectedBeer?._id, isLoggedIn, user]);

  // Handle review form field changes
  const handleReviewChange = (field, value) => {
    setLocalUserReview(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Submit user review
  const submitReview = async () => {
    if (!isLoggedIn) {
      setReviewsError('You must be logged in to submit a review');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewsError(null);

      if (!localUserReview.rating) {
        setReviewsError('Please provide a rating');
        return;
      }

      const reviewData = {
        beerId: selectedBeer._id,
        rating: localUserReview.rating,
        notes: localUserReview.notes
      };

      console.log('Submitting review:', reviewData);
      await api.reviews.create(reviewData);
      
      // Reset form after successful submission
      setLocalUserReview({ 
        rating: 0, 
        notes: '', 
        username: user?.username || '' 
      });
      
      // Refresh data
      await loadBeerReviews(selectedBeer._id);
      await refreshBeers();
      
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        setReviewsError('Your session has expired. Please log in again.');
        handleLogout();
      } else {
        setReviewsError(error.message || 'Failed to submit review. Please try again.');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!selectedBeer) {
    return <div>No beer selected</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={() => handleNavigation('home')}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          ← Back to Home
        </button>

        {/* Beer Information */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8 border-4 border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2 font-serif">{selectedBeer.name}</h1>
              <h2 className="text-2xl text-red-600 font-semibold">{selectedBeer.brewery}</h2>
            </div>
            {selectedBeer.sessionable && (
              <div className="ml-4 flex-shrink-0">
                <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  SESSIONABLE
                </div>
                <p className="text-xs text-gray-600 mt-1 text-center">Perfect for long sessions</p>
              </div>
            )}
          </div>
          
          {/* Beer details grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-1">Style</div>
              <div className="text-lg font-bold text-red-600">{selectedBeer.style}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-1">Alcohol Content</div>
              <div className="text-lg font-bold text-gray-900">{selectedBeer.abv}% ABV</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-1">Community Rating</div>
              <div className="flex items-center justify-center gap-2">
                <StarRating rating={selectedBeer.averageRating || 0} />
                <span className="text-lg font-bold text-gray-900">
                  {selectedBeer.averageRating ? selectedBeer.averageRating.toFixed(1) : '0.0'}
                </span>
              </div>
              <div className="text-sm text-gray-500">{selectedBeer.totalReviews || 0} reviews</div>
            </div>
          </div>

          {/* Beer description if available */}
          {selectedBeer.description && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{selectedBeer.description}</p>
            </div>
          )}
        </div>

        {/* Add Your Review */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8 border-4 border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Add Your Review</h3>
          
          {!isLoggedIn ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You need to be logged in to leave a review</p>
              <div className="space-y-3">
                <button 
                  onClick={() => handleNavigation('login')}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Login to Review
                </button>
                <button 
                  onClick={() => handleNavigation('register')}
                  className="border-2 border-red-600 text-red-600 px-6 py-2 rounded-lg hover:bg-red-600 hover:text-white transition-colors font-semibold ml-3"
                >
                  Create Account
                </button>
              </div>
            </div>
          ) : (
            <>
              {reviewsError && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {reviewsError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Reviewing as: <span className="text-red-600 font-semibold">{user?.username}</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Your Rating</label>
                  <StarRating 
                    rating={localUserReview.rating} 
                    onRate={(rating) => handleReviewChange('rating', rating)} 
                    interactive={true} 
                    size="w-8 h-8" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Review Comments (Optional)</label>
                  <textarea
                    value={localUserReview.notes}
                    onChange={(e) => handleReviewChange('notes', e.target.value)}
                    rows="4"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Share your thoughts about this beer..."
                  />
                </div>

                <button
                  onClick={submitReview}
                  disabled={submittingReview}
                  className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-300 font-bold text-lg shadow-xl disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Community Reviews */}
        <div className="bg-white rounded-xl shadow-xl p-8 border-4 border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif">
            Community Reviews ({beerReviews.length})
          </h3>

          {reviewsLoading && (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          )}

          {!reviewsLoading && beerReviews.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No reviews yet. Be the first to review this beer!</p>
            </div>
          )}

          {!reviewsLoading && beerReviews.length > 0 && (
            <div className="space-y-6">
              {beerReviews.map((review) => (
                <div key={review._id} className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">{review.username}</span>
                      <StarRating rating={review.rating} />
                      <span className="text-sm text-gray-600">({review.rating}/5)</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.notes && (
                    <p className="text-gray-700 leading-relaxed italic">"{review.notes}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BeerDetailPage;