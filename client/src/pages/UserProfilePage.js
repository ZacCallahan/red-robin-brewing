import React from 'react';
import StarRating from '../components/StarRating';

const UserProfilePage = ({ selectedUser }) => {
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
            <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl select-none">
                {selectedUser.username?.charAt(0).toUpperCase()}
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600 select-none">
                {selectedUser.totalReviews || 0}
              </div>
              <div className="text-sm text-gray-600 select-none">Reviews</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600 select-none">
                {selectedUser.averageRating ? selectedUser.averageRating.toFixed(1) : '0.0'}
              </div>
              <div className="text-sm text-gray-600 select-none">Avg Rating</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600 select-none">
                {selectedUser.totalBeersAdded || 0}
              </div>
              <div className="text-sm text-gray-600 select-none">Beers Added</div>
            </div>
          </div>
        </div>

        {/* User Activity Summary */}
        <div className="bg-white rounded-xl shadow-xl p-8 border-4 border-gray-200 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl select-none">
              {selectedUser.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
            {selectedUser.firstName}'s Beer Journey
          </h3>
          
          {selectedUser.totalReviews > 0 ? (
            <div className="space-y-4">
              <p className="text-gray-700 text-lg">
                <span className="font-semibold text-red-600">{selectedUser.firstName}</span> has reviewed{' '}
                <span className="font-bold">{selectedUser.totalReviews}</span> beer{selectedUser.totalReviews !== 1 ? 's' : ''}
                {selectedUser.averageRating > 0 && (
                  <>
                    {' '}with an average rating of{' '}
                    <span className="font-bold text-red-600">{selectedUser.averageRating.toFixed(1)} stars</span>
                  </>
                )}
              </p>
              
              {selectedUser.totalBeersAdded > 0 && (
                <p className="text-gray-700">
                  They've also contributed <span className="font-bold text-red-600">{selectedUser.totalBeersAdded}</span>{' '}
                  beer{selectedUser.totalBeersAdded !== 1 ? 's' : ''} to our collection
                </p>
              )}

              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="text-gray-600">Overall rating style:</span>
                <StarRating rating={Math.round(selectedUser.averageRating || 0)} />
              </div>
            </div>
          ) : (
            <div className="py-8">
              <p className="text-gray-600 mb-4">
                {selectedUser.firstName} hasn't reviewed any beers yet
              </p>
              <p className="text-sm text-gray-500">
                Encourage them to start their beer journey!
              </p>
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 italic">
              "Every beer tells a story, and every review helps others discover their next favorite brew"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;