import React, { useState } from 'react';
import { Search, Users, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

const FriendsPage = ({ isLoggedIn, handleNavigation, handleUserSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Redirect if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to find users</h2>
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

  // Search for users by username or name
  const handleSearch = async () => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSearchError('Please enter at least 2 characters');
      return;
    }

    try {
      setSearching(true);
      setSearchError(null);
      setHasSearched(true);
      const results = await api.users.search(searchTerm);
      setSearchResults(results || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchError('Failed to search users. Please try again.');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Handle Enter key press for search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle search input changes
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear error when user starts typing
    if (searchError) {
      setSearchError(null);
    }
    
    // If user clears the search entirely, reset the state
    if (value.trim() === '') {
      setSearchResults([]);
      setHasSearched(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 font-serif">Find Beer Enthusiasts</h2>
        
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-4 border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                <input
                  type="text"
                  placeholder="Search by username or name..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || searchTerm.length < 2}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {searchError && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {searchError}
            </div>
          )}
        </div>

        {/* Loading state during search */}
        {searching && (
          <div className="bg-white rounded-xl shadow-lg p-8 border-4 border-gray-200 text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Searching...</h3>
            <p className="text-gray-500">Looking for users matching "{searchTerm}"</p>
          </div>
        )}

        {/* Search Results */}
        {!searching && hasSearched && searchResults.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border-4 border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 font-serif">
              Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleUserSelect(user)}
                  className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg select-none">
                      {user.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 select-none">{user.firstName} {user.lastName}</h4>
                    <p className="text-red-600 select-none">@{user.username}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-600 select-none">
                        {user.totalReviews || 0} reviews
                      </span>
                      {user.averageRating > 0 && (
                        <span className="text-sm text-gray-600 select-none">
                          {user.averageRating.toFixed(1)}⭐ avg
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results state */}
        {!searching && hasSearched && searchResults.length === 0 && !searchError && (
          <div className="bg-white rounded-xl shadow-lg p-8 border-4 border-gray-200 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No users found</h3>
            <p className="text-gray-500">No users match your search for "{searchTerm}"</p>
            <p className="text-gray-400 text-sm mt-2">Try searching with a different username or name</p>
          </div>
        )}

        {/* Initial state with instructions */}
        {!hasSearched && !searching && (
          <div className="bg-white rounded-xl shadow-lg p-8 border-4 border-gray-200 text-center">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">Find Beer Enthusiasts</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Search for other beer lovers to see their reviews, favorite picks, and get recommendations!
            </p>
            <div className="text-left max-w-sm mx-auto space-y-2">
              <p className="text-sm text-gray-600">💡 Try searching for:</p>
              <ul className="text-sm text-gray-500 space-y-1 ml-4">
                <li>• Usernames (e.g., "beerexpert")</li>
                <li>• First or last names</li>
                <li>• Partial matches work too!</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;