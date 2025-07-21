import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wine, User, Calendar, MapPin, Star, MessageSquare, Edit, Save, X } from 'lucide-react';
import StarRating from '../components/StarRating';
import { api } from '../services/api';

const WineDetailPage = ({ 
  selectedWine, 
  wineReviews, 
  isLoggedIn, 
  user, 
  handleNavigation, 
  loadWineReviews, 
  refreshWines 
}) => {
  const [userRating, setUserRating] = useState(0);
  const [userNotes, setUserNotes] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // Ensure wineReviews is always an array
  const reviews = Array.isArray(wineReviews) ? wineReviews : [];

  // Check if user has already reviewed this wine
  const existingReview = reviews.find(review => 
    review.user?._id === user?._id || review.user === user?._id
  );

  // Load existing review data
  useEffect(() => {
    if (existingReview && isLoggedIn) {
      setUserRating(existingReview.rating);
      setUserNotes(existingReview.notes || '');
    }
  }, [existingReview, isLoggedIn]);

  const [localWineData, setLocalWineData] = useState(null);

  // Initialize local wine data and edit data
  useEffect(() => {
    if (selectedWine) {
      setLocalWineData(selectedWine);
      setEditData({
        name: selectedWine.name || '',
        winery: selectedWine.winery || '',
        style: selectedWine.style || '',
        abv: selectedWine.abv || '',
        vintage: selectedWine.vintage || '',
        region: selectedWine.region || '',
        sweetness: selectedWine.sweetness || '',
        description: selectedWine.description || ''
      });
    }
  }, [selectedWine]);

  // Handle review submission
  const handleReviewSubmit = async () => {
    if (!isLoggedIn) {
      setReviewError('You must be logged in to submit a review');
      return;
    }

    if (userRating === 0) {
      setReviewError('Please select a rating');
      return;
    }

    try {
      setIsSubmittingReview(true);
      setReviewError(null);

      const reviewData = {
        wineId: selectedWine._id,
        rating: userRating,
        notes: userNotes.trim()
      };

      await api.reviews.create(reviewData);
      
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
      
      // Reload reviews and wine data
      await loadWineReviews(selectedWine._id);
      if (refreshWines) {
        await refreshWines();
      }

    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewError(error.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Handle wine edit
  const handleEditSubmit = async () => {
    try {
      const updatedData = {
        ...editData,
        abv: parseFloat(editData.abv),
        vintage: editData.vintage ? parseInt(editData.vintage) : undefined
      };

      const result = await api.wines.update(selectedWine._id, updatedData);
      console.log('Wine updated successfully:', result);
      
      // Update local wine data immediately to show changes in UI
      setLocalWineData({
        ...selectedWine,
        ...updatedData
      });
      
      // Refresh the wine data and reviews
      if (refreshWines) {
        await refreshWines();
        console.log('refreshWines called');
      }
      
      // Reload the wine reviews to get fresh data
      if (loadWineReviews) {
        await loadWineReviews(selectedWine._id);
        console.log('loadWineReviews called');
      }
      
      // Force update the editData with the new values to trigger re-render
      setEditData({
        name: updatedData.name,
        winery: updatedData.winery,
        style: updatedData.style,
        abv: updatedData.abv,
        vintage: updatedData.vintage || '',
        region: updatedData.region || '',
        sweetness: updatedData.sweetness || '',
        description: updatedData.description || ''
      });
      
      setIsEditing(false);
      
      console.log('Wine edit completed, editData updated');
      
    } catch (error) {
      console.error('Error updating wine:', error);
      // You might want to show an error message to the user here
      alert('Error updating wine: ' + (error.message || 'Unknown error'));
    }
  };

  if (!selectedWine) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Wine className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wine not found</h2>
          <button 
            onClick={() => handleNavigation('wines')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Wines
          </button>
        </div>
      </div>
    );
  }

  // Use local wine data if available, fallback to selectedWine
  const displayWine = localWineData || selectedWine;
  const canEdit = isLoggedIn && (user?.isAdmin || selectedWine.addedBy?._id === user?._id);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => handleNavigation('wines')}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Wines
          </button>
        </div>

        {/* Wine Details Card */}
        <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-gray-200 mb-8">
          <div className="flex justify-between items-start mb-6 gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <Wine className="w-8 h-8 text-purple-600 flex-shrink-0" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="text-3xl font-bold text-gray-900 font-serif border-b-2 border-purple-300 focus:border-purple-600 outline-none bg-transparent flex-1 min-w-0"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900 font-serif break-words">{displayWine.name}</h1>
                )}
                {displayWine.vintage && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-xs font-medium flex-shrink-0">
                    {displayWine.vintage}
                  </span>
                )}
              </div>
              
              {isEditing ? (
                <input
                  type="text"
                  value={editData.winery}
                  onChange={(e) => setEditData({...editData, winery: e.target.value})}
                  className="text-xl text-purple-600 font-semibold border-b border-purple-300 focus:border-purple-600 outline-none bg-transparent"
                />
              ) : (
                <p className="text-xl text-purple-600 font-semibold mb-4">{displayWine.winery}</p>
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
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Wine Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600 mb-1">Style</div>
              {isEditing ? (
                <select
                  value={editData.style}
                  onChange={(e) => setEditData({...editData, style: e.target.value})}
                  className="w-full bg-transparent border border-purple-300 rounded px-2 py-1"
                >
                  <option value="">Select style</option>
                  <option value="Shiraz">Shiraz</option>
                  <option value="Cabernet Sauvignon">Cabernet Sauvignon</option>
                  <option value="Cabernet Shiraz">Cabernet Shiraz</option>
                  <option value="Cabernet Merlot">Cabernet Merlot</option>
                  <option value="Shiraz Viognier">Shiraz Viognier</option>
                  <option value="Pinot Noir">Pinot Noir</option>
                  <option value="Merlot">Merlot</option>
                  <option value="Grenache">Grenache</option>
                  <option value="Sangiovese">Sangiovese</option>
                  <option value="Tempranillo">Tempranillo</option>
                  <option value="Barbera">Barbera</option>
                  <option value="Nebbiolo">Nebbiolo</option>
                  <option value="Malbec">Malbec</option>
                  <option value="Petit Verdot">Petit Verdot</option>
                  <option value="Durif">Durif</option>
                  <option value="Chardonnay">Chardonnay</option>
                  <option value="Sauvignon Blanc">Sauvignon Blanc</option>
                  <option value="Semillon">Semillon</option>
                  <option value="Riesling">Riesling</option>
                  <option value="Pinot Grigio">Pinot Grigio</option>
                  <option value="Pinot Gris">Pinot Gris</option>
                  <option value="Gewürztraminer">Gewürztraminer</option>
                  <option value="Viognier">Viognier</option>
                  <option value="Verdelho">Verdelho</option>
                  <option value="Chenin Blanc">Chenin Blanc</option>
                  <option value="Moscato">Moscato</option>
                  <option value="Albariño">Albariño</option>
                  <option value="Champagne">Champagne</option>
                  <option value="Sparkling Shiraz">Sparkling Shiraz</option>
                  <option value="Sparkling Chardonnay">Sparkling Chardonnay</option>
                  <option value="Sparkling Pinot Noir">Sparkling Pinot Noir</option>
                  <option value="Cava">Cava</option>
                  <option value="Prosecco">Prosecco</option>
                  <option value="Rosé">Rosé</option>
                  <option value="Dessert Wine">Dessert Wine</option>
                  <option value="Fortified">Fortified</option>
                  <option value="Port">Port</option>
                  <option value="Sherry">Sherry</option>
                  <option value="Orange Wine">Orange Wine</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <div className="font-bold text-purple-800">{displayWine.style}</div>
              )}
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600 mb-1">ABV</div>
              {isEditing ? (
                <input
                  type="number"
                  step="0.1"
                  value={editData.abv}
                  onChange={(e) => setEditData({...editData, abv: e.target.value})}
                  className="w-full bg-transparent border border-purple-300 rounded px-2 py-1"
                />
              ) : (
                <div className="font-bold text-purple-800">{displayWine.abv}%</div>
              )}
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600 mb-1">Sweetness</div>
              {isEditing ? (
                <select
                  value={editData.sweetness}
                  onChange={(e) => setEditData({...editData, sweetness: e.target.value})}
                  className="w-full bg-transparent border border-purple-300 rounded px-2 py-1"
                >
                  <option value="">Select sweetness</option>
                  <option value="Bone Dry">Bone Dry</option>
                  <option value="Dry">Dry</option>
                  <option value="Off-Dry">Off-Dry</option>
                  <option value="Medium-Dry">Medium-Dry</option>
                  <option value="Medium-Sweet">Medium-Sweet</option>
                  <option value="Sweet">Sweet</option>
                  <option value="Very Sweet">Very Sweet</option>
                </select>
              ) : (
                <div className="font-bold text-purple-800">{displayWine.sweetness || 'Not specified'}</div>
              )}
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600 mb-1">Rating</div>
              <div className="flex items-center gap-2">
                <StarRating rating={displayWine.averageRating || 0} />
                <span className="font-bold text-purple-800">
                  {displayWine.averageRating ? displayWine.averageRating.toFixed(1) : '0.0'}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Wine Info */}
          {(displayWine.region || displayWine.sweetness || isEditing) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {(displayWine.region || isEditing) && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <div>
                    <span className="text-sm text-purple-600">Region:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.region}
                        onChange={(e) => setEditData({...editData, region: e.target.value})}
                        className="ml-2 border border-purple-300 rounded px-2 py-1"
                      />
                    ) : (
                      <span className="ml-2 font-medium text-gray-800">{displayWine.region}</span>
                    )}
                  </div>
                </div>
              )}

              {(displayWine.sweetness || isEditing) && (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-600" />
                  <div>
                    <span className="text-sm text-purple-600">Sweetness:</span>
                    {isEditing ? (
                      <select
                        value={editData.sweetness}
                        onChange={(e) => setEditData({...editData, sweetness: e.target.value})}
                        className="ml-2 border border-purple-300 rounded px-2 py-1"
                      >
                        <option value="">Select sweetness</option>
                        <option value="Bone Dry">Bone Dry</option>
                        <option value="Dry">Dry</option>
                        <option value="Off-Dry">Off-Dry</option>
                        <option value="Medium-Dry">Medium-Dry</option>
                        <option value="Medium-Sweet">Medium-Sweet</option>
                        <option value="Sweet">Sweet</option>
                        <option value="Very Sweet">Very Sweet</option>
                      </select>
                    ) : (
                      <span className="ml-2 font-medium text-gray-800">{displayWine.sweetness}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {(displayWine.description || isEditing) && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  rows="4"
                  className="w-full border border-purple-300 rounded-lg px-3 py-2"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{displayWine.description}</p>
              )}
            </div>
          )}

          {/* Added by */}
          {displayWine.addedBy && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Added by {displayWine.addedBy.username || displayWine.addedBy.firstName}</span>
                <Calendar className="w-4 h-4 ml-4" />
                <span>{new Date(displayWine.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Review Section */}
        {isLoggedIn && (
          <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-purple-600" />
              {existingReview ? 'Update Your Review' : 'Write a Review'}
            </h2>

            {reviewError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {reviewError}
              </div>
            )}

            {reviewSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                Review submitted successfully!
              </div>
            )}

            <div className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setUserRating(star)}
                      className={`w-8 h-8 transition-colors ${
                        star <= userRating ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      <Star className="w-full h-full fill-current" />
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600">
                    {userRating > 0 ? `${userRating}/5` : 'Select rating'}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tasting Notes
                </label>
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Share your thoughts about this wine..."
                  maxLength="1000"
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {userNotes.length}/1000 characters
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleReviewSubmit}
                disabled={isSubmittingReview || userRating === 0}
                className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingReview 
                  ? 'Submitting...' 
                  : existingReview 
                    ? 'Update Review' 
                    : 'Submit Review'
                }
              </button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Reviews ({reviews.length})
          </h2>

          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
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
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No reviews yet. Be the first to review this wine!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WineDetailPage;