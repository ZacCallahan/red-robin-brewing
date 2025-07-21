import React, { useState, useEffect } from 'react';
import { ArrowLeft, Martini, User, Calendar, MapPin, Clock, Star, MessageSquare, Edit, Save, X } from 'lucide-react';
import StarRating from '../components/StarRating';
import { api } from '../services/api';

const SpiritDetailPage = ({ 
  selectedSpirit, 
  spiritReviews, 
  isLoggedIn, 
  user, 
  handleNavigation, 
  loadSpiritReviews, 
  refreshSpirits 
}) => {
  const [userRating, setUserRating] = useState(0);
  const [userNotes, setUserNotes] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [localSpiritData, setLocalSpiritData] = useState(null);

  // Ensure spiritReviews is always an array
  const reviews = Array.isArray(spiritReviews) ? spiritReviews : [];

  // Check if user has already reviewed this spirit
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

  // Initialize local spirit data and edit data
  useEffect(() => {
    if (selectedSpirit) {
      setLocalSpiritData(selectedSpirit);
      setEditData({
        name: selectedSpirit.name || '',
        distillery: selectedSpirit.distillery || '',
        style: selectedSpirit.style || '',
        abv: selectedSpirit.abv || '',
        age: selectedSpirit.age || '',
        category: selectedSpirit.category || '',
        region: selectedSpirit.region || '',
        description: selectedSpirit.description || ''
      });
    }
  }, [selectedSpirit]);

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
        spiritId: selectedSpirit._id,
        rating: userRating,
        notes: userNotes.trim()
      };

      await api.reviews.create(reviewData);
      
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
      
      // Reload reviews and spirit data
      await loadSpiritReviews(selectedSpirit._id);
      if (refreshSpirits) {
        await refreshSpirits();
      }

    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewError(error.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Handle spirit edit
  const handleEditSubmit = async () => {
    try {
      const updatedData = {
        ...editData,
        abv: parseFloat(editData.abv),
        age: editData.age ? parseFloat(editData.age) : undefined
      };

      const result = await api.spirits.update(selectedSpirit._id, updatedData);
      console.log('Spirit updated successfully:', result);
      
      // Update local spirit data immediately to show changes in UI
      setLocalSpiritData({
        ...selectedSpirit,
        ...updatedData
      });
      
      // Refresh the spirit data and reviews
      if (refreshSpirits) {
        await refreshSpirits();
        console.log('refreshSpirits called');
      }
      
      // Reload the spirit reviews to get fresh data
      if (loadSpiritReviews) {
        await loadSpiritReviews(selectedSpirit._id);
        console.log('loadSpiritReviews called');
      }
      
      // Force update the editData with the new values to trigger re-render
      setEditData({
        name: updatedData.name,
        distillery: updatedData.distillery,
        style: updatedData.style,
        abv: updatedData.abv,
        age: updatedData.age || '',
        category: updatedData.category || '',
        region: updatedData.region || '',
        description: updatedData.description || ''
      });
      
      setIsEditing(false);
      
      console.log('Spirit edit completed, editData updated');
      
    } catch (error) {
      console.error('Error updating spirit:', error);
      // You might want to show an error message to the user here
      alert('Error updating spirit: ' + (error.message || 'Unknown error'));
    }
  };

  if (!selectedSpirit) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Martini className="w-16 h-16 text-amber-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Spirit not found</h2>
          <button 
            onClick={() => handleNavigation('spirits')}
            className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Back to Spirits
          </button>
        </div>
      </div>
    );
  }

  // Use local spirit data if available, fallback to selectedSpirit
  const displaySpirit = localSpiritData || selectedSpirit;
  const canEdit = isLoggedIn && (user?.isAdmin || selectedSpirit.addedBy?._id === user?._id);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => handleNavigation('spirits')}
            className="flex items-center gap-2 text-amber-600 hover:text-amber-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Spirits
          </button>
        </div>

        {/* Spirit Details Card */}
        <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-gray-200 mb-8">
          <div className="flex justify-between items-start mb-6 gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <Martini className="w-8 h-8 text-amber-600 flex-shrink-0" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="text-3xl font-bold text-gray-900 font-serif border-b-2 border-amber-300 focus:border-amber-600 outline-none bg-transparent flex-1 min-w-0"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900 font-serif break-words">{displaySpirit.name}</h1>
                )}
                {displaySpirit.age && displaySpirit.age > 0 && (
                  <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {displaySpirit.age}Y
                  </span>
                )}
              </div>
              
              {isEditing ? (
                <input
                  type="text"
                  value={editData.distillery}
                  onChange={(e) => setEditData({...editData, distillery: e.target.value})}
                  className="text-xl text-amber-600 font-semibold border-b border-amber-300 focus:border-amber-600 outline-none bg-transparent"
                />
              ) : (
                <p className="text-xl text-amber-600 font-semibold mb-4">{displaySpirit.distillery}</p>
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
                    className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Spirit Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="text-sm text-amber-600 mb-1">Style</div>
              {isEditing ? (
                <select
                  value={editData.style}
                  onChange={(e) => setEditData({...editData, style: e.target.value})}
                  className="w-full bg-transparent border border-amber-300 rounded px-2 py-1"
                >
                  <option value="">Select style</option>
                  <option value="Whiskey">Whiskey</option>
                  <option value="Rum">Rum</option>
                  <option value="Vodka">Vodka</option>
                  <option value="Gin">Gin</option>
                  <option value="Tequila">Tequila</option>
                  <option value="Brandy">Brandy</option>
                  <option value="Liqueur">Liqueur</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <div className="font-bold text-amber-800">{displaySpirit.style}</div>
              )}
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="text-sm text-amber-600 mb-1">ABV</div>
              {isEditing ? (
                <input
                  type="number"
                  step="0.1"
                  value={editData.abv}
                  onChange={(e) => setEditData({...editData, abv: e.target.value})}
                  className="w-full bg-transparent border border-amber-300 rounded px-2 py-1"
                />
              ) : (
                <div className="font-bold text-amber-800">{displaySpirit.abv}%</div>
              )}
            </div>

            {(displaySpirit.age || isEditing) && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="text-sm text-amber-600 mb-1">Age</div>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.1"
                    value={editData.age}
                    onChange={(e) => setEditData({...editData, age: e.target.value})}
                    className="w-full bg-transparent border border-amber-300 rounded px-2 py-1"
                  />
                ) : (
                  <div className="font-bold text-amber-800">{displaySpirit.age} years</div>
                )}
              </div>
            )}

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="text-sm text-amber-600 mb-1">Rating</div>
              <div className="flex items-center gap-2">
                <StarRating rating={displaySpirit.averageRating || 0} />
                <span className="font-bold text-amber-800">
                  {displaySpirit.averageRating ? displaySpirit.averageRating.toFixed(1) : '0.0'}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Spirit Info */}
          {(displaySpirit.category || displaySpirit.region || isEditing) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {(displaySpirit.category || isEditing) && (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-600" />
                  <div>
                    <span className="text-sm text-amber-600">Category:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.category}
                        onChange={(e) => setEditData({...editData, category: e.target.value})}
                        className="ml-2 border border-amber-300 rounded px-2 py-1"
                        placeholder="e.g., Single Malt, Bourbon, VSOP"
                      />
                    ) : (
                      <span className="ml-2 font-medium text-gray-800">{displaySpirit.category}</span>
                    )}
                  </div>
                </div>
              )}

              {(displaySpirit.region || isEditing) && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-600" />
                  <div>
                    <span className="text-sm text-amber-600">Region:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.region}
                        onChange={(e) => setEditData({...editData, region: e.target.value})}
                        className="ml-2 border border-amber-300 rounded px-2 py-1"
                        placeholder="e.g., Speyside, Kentucky, Jalisco"
                      />
                    ) : (
                      <span className="ml-2 font-medium text-gray-800">{displaySpirit.region}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {(displaySpirit.description || isEditing) && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              {isEditing ? (
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  rows="4"
                  className="w-full border border-amber-300 rounded-lg px-3 py-2"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{displaySpirit.description}</p>
              )}
            </div>
          )}

          {/* Added by */}
          {displaySpirit.addedBy && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Added by {displaySpirit.addedBy.username || displaySpirit.addedBy.firstName}</span>
                <Calendar className="w-4 h-4 ml-4" />
                <span>{new Date(displaySpirit.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Review Section */}
        {isLoggedIn && (
          <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-gray-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-amber-600" />
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
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Share your thoughts about this spirit..."
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
                className="bg-gradient-to-r from-amber-600 to-amber-800 text-white px-8 py-3 rounded-lg hover:from-amber-700 hover:to-amber-900 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-semibold">
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
              <p className="text-gray-600">No reviews yet. Be the first to review this spirit!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpiritDetailPage;