import React, { useState, useEffect } from 'react';
import { ArrowLeft, Beer, User, Calendar, Clock, Star, MessageSquare, Edit, Save, X } from 'lucide-react';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // Initialize edit data
  useEffect(() => {
    if (selectedBeer) {
      setEditData({
        name: selectedBeer.name || '',
        brewery: selectedBeer.brewery || '',
        style: selectedBeer.style || '',
        abv: selectedBeer.abv || '',
        description: selectedBeer.description || '',
        sessionable: selectedBeer.sessionable || false
      });
    }
  }, [selectedBeer]);

  // Handle beer edit
  const handleEditSubmit = async () => {
    try {
      const updatedData = {
        ...editData,
        abv: parseFloat(editData.abv)
      };

      await api.beers.update(selectedBeer._id, updatedData);
      
      // Refresh the beer data and reviews
      if (refreshBeers) {
        await refreshBeers();
      }
      
      // Reload the beer reviews to get fresh data
      if (loadBeerReviews) {
        await loadBeerReviews(selectedBeer._id);
      }
      
      setIsEditing(false);
      
    } catch (error) {
      console.error('Error updating beer:', error);
      // You might want to show an error message to the user here
      alert('Error updating beer: ' + (error.message || 'Unknown error'));
    }
  };

  const canEdit = isLoggedIn && (user?.isAdmin || selectedBeer.addedBy?._id === user?._id);

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
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Beer className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Beer not found</h2>
          <button 
            onClick={() => handleNavigation('beers')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Beers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => handleNavigation('beers')}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Beers
          </button>
        </div>

        {/* Beer Information */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8 border-2 border-gray-200">
          <div className="flex justify-between items-start mb-6 gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <Beer className="w-8 h-8 text-red-600 flex-shrink-0" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="text-3xl font-bold text-gray-900 font-serif border-b-2 border-red-300 focus:border-red-600 outline-none bg-transparent flex-1 min-w-0"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900 font-serif break-words">{selectedBeer.name}</h1>
                )}
                {selectedBeer.sessionable && (
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    SESSIONABLE
                  </span>
                )}
              </div>
              
              {isEditing ? (
                <input
                  type="text"
                  value={editData.brewery}
                  onChange={(e) => setEditData({...editData, brewery: e.target.value})}
                  className="text-xl text-red-600 font-semibold border-b border-red-300 focus:border-red-600 outline-none bg-transparent"
                />
              ) : (
                <p className="text-xl text-red-600 font-semibold mb-4">{selectedBeer.brewery}</p>
              )}
            </div>

            {canEdit && (
              <div className="flex gap-2 flex-shrink-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleEditSubmit}
                      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Beer details grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-red-600 mb-1">Style</div>
              {isEditing ? (
                <select
                  value={editData.style}
                  onChange={(e) => setEditData({...editData, style: e.target.value})}
                  className="w-full bg-transparent border border-red-300 rounded px-2 py-1 font-bold text-red-800"
                >
                  <option value="">Select style</option>
                    <option value="IPA">IPA</option>
                    <option value="Stout">Stout</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Lager">Lager</option>
                    <option value="Ale">Ale</option>
                    <option value="Pilsner">Pilsner</option>
                    <option value="Sour">Sour</option>
                    <option value="Porter">Porter</option>
                    <option value="Traditional Cider">Traditional Cider</option>
                    <option value="Fruit Cider">Fruit Cider</option>
                    <option value="Hopped Cider">Hopped Cider</option>
                    <option value="Sour Cider">Sour Cider</option>
                    <option value="Other">Other</option>
                </select>
              ) : (
                <div className="font-bold text-red-800">{selectedBeer.style}</div>
              )}
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-red-600 mb-1">ABV</div>
              {isEditing ? (
                <input
                  type="number"
                  step="0.1"
                  value={editData.abv}
                  onChange={(e) => setEditData({...editData, abv: e.target.value})}
                  className="w-full bg-transparent border border-red-300 rounded px-2 py-1 font-bold text-gray-900"
                />
              ) : (
                <div className="font-bold text-gray-900">{selectedBeer.abv}% ABV</div>
              )}
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-red-600 mb-1">Community Rating</div>
              <div className="flex items-center justify-center gap-2">
                <StarRating rating={selectedBeer.averageRating || 0} />
                <span className="font-bold text-gray-900">
                  {selectedBeer.averageRating ? selectedBeer.averageRating.toFixed(1) : '0.0'}
                </span>
              </div>
              <div className="text-sm text-gray-500 text-center">{selectedBeer.totalReviews || 0} reviews</div>
            </div>
          </div>

          {/* Sessionable checkbox for editing */}
          {isEditing && (
            <div className="mb-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editData.sessionable}
                  onChange={(e) => setEditData({...editData, sessionable: e.target.checked})}
                  className="rounded border-red-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">Sessionable beer</span>
              </label>
            </div>
          )}

          {/* Beer description */}
          {(selectedBeer.description || isEditing) && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  rows="4"
                  className="w-full border border-red-300 rounded-lg px-3 py-2"
                  placeholder="Add a description for this beer..."
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{selectedBeer.description}</p>
              )}
            </div>
          )}

          {/* Added by */}
          {selectedBeer.addedBy && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Added by {selectedBeer.addedBy.username || selectedBeer.addedBy.firstName}</span>
                <Calendar className="w-4 h-4 ml-4" />
                <span>{new Date(selectedBeer.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Add Your Review */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8 border-2 border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-red-600" />
            Add Your Review
          </h3>
          
          {!isLoggedIn ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You need to be logged in to leave a review</p>
              <div className="space-y-3">
                <button 
                  onClick={() => handleNavigation('login')}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
                >
                  Login to Review
                </button>
                <button 
                  onClick={() => handleNavigation('register')}
                  className="border-2 border-black text-black px-6 py-2 rounded-lg hover:bg-black hover:text-white transition-colors font-semibold ml-3"
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
                  <label className="block text-sm font-medium text-gray-800 mb-2">Your Rating *</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleReviewChange('rating', star)}
                        className={`w-8 h-8 transition-colors ${
                          star <= localUserReview.rating ? 'text-yellow-500' : 'text-gray-300'
                        }`}
                      >
                        <Star className="w-full h-full fill-current" />
                      </button>
                    ))}
                    <span className="ml-2 text-gray-600">
                      {localUserReview.rating > 0 ? `${localUserReview.rating}/5` : 'Select rating'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Tasting Notes</label>
                  <textarea
                    value={localUserReview.notes}
                    onChange={(e) => handleReviewChange('notes', e.target.value)}
                    rows="4"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Share your thoughts about this beer..."
                    maxLength="1000"
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {localUserReview.notes.length}/1000 characters
                  </div>
                </div>

                <button
                  onClick={submitReview}
                  disabled={submittingReview || localUserReview.rating === 0}
                  className="bg-gradient-to-r from-red-600 to-red-800 text-white px-8 py-3 rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Community Reviews */}
        <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif">
            Reviews ({beerReviews.length})
          </h3>

          {reviewsLoading && (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          )}

          {!reviewsLoading && beerReviews.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No reviews yet. Be the first to review this beer!</p>
            </div>
          )}

          {!reviewsLoading && beerReviews.length > 0 && (
            <div className="space-y-6">
              {beerReviews.map((review) => (
                <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {(review.user?.firstName || review.username || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {review.user?.firstName 
                            ? `${review.user.firstName} ${review.user.lastName}` 
                            : review.username || 'Anonymous'
                          }
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  {review.notes && (
                    <p className="text-gray-700 leading-relaxed ml-13">
                      {review.notes}
                    </p>
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