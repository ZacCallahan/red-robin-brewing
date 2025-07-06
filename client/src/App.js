import React, { useState, useEffect } from 'react';
import { Star, Plus, Search, User, LogIn, LogOut, Home, Beer, Users, ChevronRight, TrendingUp } from 'lucide-react';
import { api } from './services/api';

const BeerReviewApp = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [beers, setBeers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBeer, setSelectedBeer] = useState(null);
  const [beerReviews, setBeerReviews] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Check authentication on app start
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = api.auth.isAuthenticated();
      const currentUser = api.auth.getCurrentUser();
      
      setIsLoggedIn(isAuth);
      setUser(currentUser);
    };
    
    checkAuth();
    loadData();
  }, []);

  // Load data on app start
  const loadData = async () => {
    try {
      setLoading(true);
      const result = await api.test();
      console.log('✅ Backend connected:', result);
      
      const beersData = await api.beers.getAll();
      console.log('✅ Beers loaded:', beersData);
      
      if (Array.isArray(beersData)) {
        setBeers(beersData);
      } else {
        console.error('❌ Expected array, got:', beersData);
        setBeers([]);
        setError('Failed to load beers - invalid data format');
      }
      
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      setError('Failed to connect to server');
      setBeers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle login success
  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUser(userData.user);
    setCurrentPage('home');
  };

  // Handle logout
  const handleLogout = () => {
    api.auth.logout();
    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage('home');
  };

  // Function to refresh beers list
  const refreshBeers = async () => {
    try {
      const beersData = await api.beers.getAll();
      setBeers(beersData);
    } catch (error) {
      console.error('Error refreshing beers:', error);
    }
  };

  // Handle navigation - clear selected beer when navigating away from beer detail
  const handleNavigation = (page) => {
    setCurrentPage(page);
    if (page !== 'beer-detail') {
      setSelectedBeer(null);
      setBeerReviews([]);
    }
    if (page !== 'user-profile') {
      setSelectedUser(null);
    }
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setCurrentPage('user-profile');
  };

  // Handle beer selection and load reviews immediately
  const handleBeerSelect = (beer) => {
    setSelectedBeer(beer);
    setCurrentPage('beer-detail');
    // Load reviews immediately when beer is selected
    loadBeerReviews(beer._id);
  };

  // Function to load reviews for a specific beer
  const loadBeerReviews = async (beerId) => {
    try {
      console.log('Loading reviews for beer:', beerId);
      const reviews = await api.reviews.getByBeerId(beerId);
      console.log('Reviews loaded:', reviews);
      setBeerReviews(Array.isArray(reviews) ? reviews : []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setBeerReviews([]);
    }
  };

  const StarRating = ({ rating, onRate, interactive = false, size = 'w-5 h-5' }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRate && onRate(star)}
          />
        ))}
      </div>
    );
  };

  const BeerCard = ({ beer, onClick }) => (
    <div 
      className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 border-4 border-gray-200 hover:border-red-500"
      onClick={() => onClick(beer)}
    >
      <div className="p-6 bg-white">
        <h3 className="font-bold text-2xl text-gray-900 mb-3 font-serif select-none">{beer.name}</h3>
        <p className="text-red-600 font-semibold mb-4 text-xl select-none">{beer.brewery}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-sm font-bold text-white bg-red-600 px-3 py-1 rounded-full select-none">{beer.style}</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <span className="text-lg font-bold text-gray-800 select-none">{beer.abv}% ABV</span>
          </div>
        </div>

        {beer.ibu && (
          <div className="bg-gray-50 p-3 rounded-lg mb-4 text-center">
            <span className="text-sm text-gray-600 select-none">IBU: </span>
            <span className="text-lg font-bold text-gray-800 select-none">{beer.ibu}</span>
          </div>
        )}
        
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 select-none">Community Rating:</span>
            <div className="flex items-center gap-2">
              <StarRating rating={beer.averageRating || 0} />
              <span className="text-sm font-semibold text-gray-700 select-none">
                {beer.averageRating ? beer.averageRating.toFixed(1) : '0.0'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 select-none">{beer.totalReviews || 0} reviews</span>
            <ChevronRight className="w-5 h-5 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );

  const Navigation = () => (
    <nav className="bg-gradient-to-r from-black via-gray-900 to-black text-white p-4 shadow-xl border-b-4 border-red-600">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
            <img 
              src="/logo.png" 
              alt="Red Robin Brewing Co. Logo" 
              className="w-12 h-12 rounded-full object-cover border-2 border-red-600"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center border-2 border-red-600" style={{display: 'none'}}>
              <span className="text-white font-bold text-lg">RR</span>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide font-serif">
              Red Robin Brewing Co.
            </h1>
            <p className="text-gray-300 text-sm italic select-none pointer-events-none">Est. 2019 - Premium Craft Brewing</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => handleNavigation('home')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-semibold border-2 ${
              currentPage === 'home' 
                ? 'bg-red-600 text-white border-white shadow-lg' 
                : 'border-red-600 text-red-400 hover:bg-red-600 hover:text-white hover:border-white'
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button 
            onClick={() => handleNavigation('beers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-semibold border-2 ${
              currentPage === 'beers' 
                ? 'bg-red-600 text-white border-white shadow-lg' 
                : 'border-red-600 text-red-400 hover:bg-red-600 hover:text-white hover:border-white'
            }`}
          >
            <Beer className="w-4 h-4" />
            Beers
          </button>
          <button 
            onClick={() => handleNavigation('friends')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-semibold border-2 ${
              currentPage === 'friends' 
                ? 'bg-red-600 text-white border-white shadow-lg' 
                : 'border-red-600 text-red-400 hover:bg-red-600 hover:text-white hover:border-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Friends
          </button>
          <button 
            onClick={() => handleNavigation('add')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-semibold border-2 ${
              currentPage === 'add' 
                ? 'bg-red-600 text-white border-white shadow-lg' 
                : 'border-red-600 text-red-400 hover:bg-red-600 hover:text-white hover:border-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Beer
          </button>
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleNavigation('profile')}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-semibold border-2 border-red-600 text-red-400 hover:bg-red-600 hover:text-white hover:border-white"
              >
                <User className="w-4 h-4" />
                {user?.username || 'Profile'}
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-semibold border-2 border-red-600 text-red-400 hover:bg-red-600 hover:text-white hover:border-white"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleNavigation('login')}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-semibold border-2 border-red-600 text-red-400 hover:bg-red-600 hover:text-white hover:border-white"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
              <button 
                onClick={() => handleNavigation('register')}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-semibold border-2 border-red-600 text-red-400 hover:bg-red-600 hover:text-white hover:border-white"
              >
                <User className="w-4 h-4" />
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );

  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-12">
          <div className="relative mb-8">
            <h2 className="text-6xl font-bold text-gray-900 mb-4 font-serif tracking-wide drop-shadow-lg">
              Welcome to Red Robin Brewing Co.
            </h2>
            <div className="absolute -top-2 -left-2 w-full h-full text-6xl font-bold text-red-200 font-serif tracking-wide -z-10 opacity-50">
              Welcome to Red Robin Brewing Co.
            </div>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img 
                src="/pinup-logo.png" 
                alt="Red Robin Brewing Co. - Vintage Pin-up Logo" 
                className="w-48 h-48 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-48 h-48 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center drop-shadow-2xl hover:scale-105 transition-transform duration-300" style={{display: 'none'}}>
                <span className="text-white font-bold text-6xl">RR</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-full"></div>
            </div>
          </div>
          
          <p className="text-2xl text-gray-700 mb-8 font-medium italic">
            "Premium craft brewing since 2019 - where tradition meets innovation"
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl p-8 shadow-xl border-4 border-gray-200 hover:border-red-500 transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">Track Your Favorites</h3>
              <p className="text-gray-700 text-lg leading-relaxed">Rate and review beers to build your personal taste profile and discover what makes your palate sing</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-xl border-4 border-gray-200 hover:border-red-500 transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">Connect with Friends</h3>
              <p className="text-gray-700 text-lg leading-relaxed">See what your crew is drinking and discover new favorites through curated recommendations</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-xl border-4 border-gray-200 hover:border-red-500 transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Beer className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">Explore New Brews</h3>
              <p className="text-gray-700 text-lg leading-relaxed">Discover exceptional craft breweries and rare finds that elevate every tasting experience</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-4xl font-bold text-gray-900 mb-8 text-center font-serif">Featured Collection</h3>
          
          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading beers...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={refreshBeers}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}
          
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {beers.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-600 mb-4">No beers added yet!</p>
                  <button 
                    onClick={() => handleNavigation('add')}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Add Your First Beer
                  </button>
                </div>
              ) : (
                beers.map((beer) => (
                  <BeerCard 
                    key={beer._id} 
                    beer={beer} 
                    onClick={handleBeerSelect} 
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const FriendsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);

    if (!isLoggedIn) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to find friends</h2>
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

    const handleSearch = async () => {
      if (!searchTerm.trim() || searchTerm.length < 2) {
        setSearchError('Please enter at least 2 characters');
        return;
      }

      try {
        setSearching(true);
        setSearchError(null);
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

    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 font-serif">Find Beer Friends</h2>
          
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
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

          {/* Search Results */}
          {searchResults.length > 0 && (
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
                    <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
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

          {/* No Results */}
          {searchTerm && searchResults.length === 0 && !searching && !searchError && (
            <div className="bg-white rounded-xl shadow-lg p-8 border-4 border-gray-200 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No users found</h3>
              <p className="text-gray-500">Try searching with a different username or name</p>
            </div>
          )}

          {/* Getting Started */}
          {!searchTerm && (
            <div className="bg-white rounded-xl shadow-lg p-8 border-4 border-gray-200 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-6">
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
    const BeersPage = () => {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, rating, reviews, recent
  const [filterBy, setFilterBy] = useState('all'); // all, style, rating
  const [selectedStyle, setSelectedStyle] = useState('');
  const [minRating, setMinRating] = useState(0);
  
  // Get unique styles for filter dropdown
  const availableStyles = [...new Set(beers.map(beer => beer.style))].sort();

  // Filter beers based on search and filters
  const filteredBeers = beers.filter(beer => {
    // Search filter
    const matchesSearch = !localSearchTerm || 
      beer.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      beer.brewery.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      beer.style.toLowerCase().includes(localSearchTerm.toLowerCase());

    // Style filter
    const matchesStyle = !selectedStyle || beer.style === selectedStyle;

    // Rating filter
    const matchesRating = !minRating || (beer.averageRating || 0) >= minRating;

    return matchesSearch && matchesStyle && matchesRating;
  });

  // Sort beers
  const sortedBeers = [...filteredBeers].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.averageRating || 0) - (a.averageRating || 0);
      case 'reviews':
        return (b.totalReviews || 0) - (a.totalReviews || 0);
      case 'recent':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 font-serif">All Beers ({beers.length})</h2>
          
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-4 border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                  <input
                    type="text"
                    placeholder="Search beers, breweries, or styles..."
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviewed</option>
                  <option value="recent">Recently Added</option>
                </select>
              </div>

              {/* Filter by Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">All Styles</option>
                  {availableStyles.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">Minimum Rating</label>
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`px-3 py-1.5 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                      minRating === rating
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 hover:border-red-300 text-gray-600 hover:text-red-600'
                    }`}
                  >
                    {rating === 0 ? 'All' : `${rating}⭐+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(localSearchTerm || selectedStyle || minRating > 0) && (
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => {
                    setLocalSearchTerm('');
                    setSelectedStyle('');
                    setMinRating(0);
                    setSortBy('name');
                  }}
                  className="px-4 py-2 text-red-600 hover:text-red-800 font-semibold"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="mb-4">
            <p className="text-gray-600">
              Showing {sortedBeers.length} of {beers.length} beers
              {localSearchTerm && ` matching "${localSearchTerm}"`}
              {selectedStyle && ` in ${selectedStyle} style`}
              {minRating > 0 && ` rated ${minRating}+ stars`}
            </p>
          </div>

          {/* Beer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedBeers.length > 0 ? (
              sortedBeers.map((beer) => (
                <BeerCard key={beer._id} beer={beer} onClick={handleBeerSelect} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No beers found</h3>
                <p className="text-gray-500 mb-4">
                  {localSearchTerm 
                    ? `No beers match your search "${localSearchTerm}"`
                    : 'Try adjusting your filters'
                  }
                </p>
                <button
                  onClick={() => {
                    setLocalSearchTerm('');
                    setSelectedStyle('');
                    setMinRating(0);
                  }}
                  className="text-red-600 hover:text-red-800 font-semibold"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const AddBeerPage = () => {
    // Move all hooks to the top level (before any conditional returns)
    const [localBeer, setLocalBeer] = useState({
      name: '',
      brewery: '',
      style: '',
      abv: '',
      ibu: '',
      notes: ''
    });
    const [localRating, setLocalRating] = useState(0);
    const [localError, setLocalError] = useState(null);
    const [localLoading, setLocalLoading] = useState(false);

    // Reset form when component mounts
    useEffect(() => {
      setLocalBeer({
        name: '',
        brewery: '',
        style: '',
        abv: '',
        ibu: '',
        notes: ''
      });
      setLocalRating(0);
      setLocalError(null);
    }, []);

    const handleInputChange = (field, value) => {
      setLocalBeer(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleSubmit = async () => {
      try {
        setLocalLoading(true);
        setLocalError(null);
        
        // Validate required fields
        if (!localBeer.name || !localBeer.brewery || !localBeer.style || !localBeer.abv) {
          setLocalError('Please fill in all required fields');
          return;
        }
        
        console.log('Adding beer:', localBeer);
        
        // Create the beer data object
        const beerData = {
          name: localBeer.name,
          brewery: localBeer.brewery,
          style: localBeer.style,
          abv: parseFloat(localBeer.abv),
          ibu: localBeer.ibu ? parseInt(localBeer.ibu) : undefined,
          description: localBeer.notes
        };
        
        // Save to database
        const savedBeer = await api.beers.create(beerData);
        console.log('✅ Beer saved:', savedBeer);
        
        // Reset local form
        setLocalBeer({
          name: '',
          brewery: '',
          style: '',
          abv: '',
          ibu: '',
          notes: ''
        });
        setLocalRating(0);
        
        // Refresh the beers list
        await refreshBeers();
        
        // Redirect to home page
        handleNavigation('home');
        
      } catch (error) {
        console.error('❌ Error adding beer:', error);
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          setLocalError('Your session has expired. Please log in again.');
          handleLogout();
        } else {
          setLocalError(error.message || 'Failed to add beer. Please try again.');
        }
      } finally {
        setLocalLoading(false);
      }
    };

    // Check if user is logged in AFTER all hooks are defined
    if (!isLoggedIn) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-lg shadow-lg p-8 border-4 border-gray-200 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Beer className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">Login Required</h2>
              <p className="text-gray-700 mb-6">You need to be logged in to add new beers to our collection.</p>
              <div className="space-y-3">
                <button 
                  onClick={() => handleNavigation('login')}
                  className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-3 px-6 rounded-full hover:from-red-700 hover:to-red-900 transition-all duration-300 font-bold"
                >
                  Login to Continue
                </button>
                <button 
                  onClick={() => handleNavigation('register')}
                  className="w-full border-2 border-red-600 text-red-600 py-3 px-6 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300 font-bold"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-2xl mx-auto p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 font-serif">Add New Beer</h2>
          
          {localError && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {localError}
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-lg p-6 border-4 border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Beer Name</label>
                <input
                  type="text"
                  value={localBeer.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g., Hoppy IPA"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Brewery</label>
                <input
                  type="text"
                  value={localBeer.brewery}
                  onChange={(e) => handleInputChange('brewery', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g., Local Craft Brewery"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Style</label>
                  <select
                    value={localBeer.style}
                    onChange={(e) => handleInputChange('style', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Select Style</option>
                    <option value="IPA">IPA</option>
                    <option value="Stout">Stout</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Lager">Lager</option>
                    <option value="Ale">Ale</option>
                    <option value="Pilsner">Pilsner</option>
                    <option value="Sour">Sour</option>
                    <option value="Porter">Porter</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">ABV (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={localBeer.abv}
                    onChange={(e) => handleInputChange('abv', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="5.0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">IBU</label>
                  <input
                    type="number"
                    value={localBeer.ibu}
                    onChange={(e) => handleInputChange('ibu', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="30"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Your Rating</label>
                <StarRating rating={localRating} onRate={setLocalRating} interactive={true} size="w-8 h-8" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Tasting Notes</label>
                <textarea
                  value={localBeer.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Share your thoughts about this beer..."
                />
              </div>
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={localLoading}
                className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-4 px-6 rounded-full hover:from-red-700 hover:to-red-900 transition-all duration-300 font-bold text-lg shadow-xl border-2 border-gray-300 hover:border-white transform hover:scale-105 disabled:opacity-50"
              >
                {localLoading ? 'Adding Beer...' : 'Add Beer & Review'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LoginPage = () => {
    const [formData, setFormData] = useState({
      email: '',
      password: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);

    const handleInputChange = (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        setFormLoading(true);
        setFormError(null);

        if (!formData.email || !formData.password) {
          setFormError('Please fill in all fields');
          return;
        }

        const response = await api.auth.login(formData);
        console.log('✅ Login successful:', response);
        
        handleLoginSuccess(response);
        
      } catch (error) {
        console.error('❌ Login failed:', error);
        setFormError(error.message || 'Login failed. Please try again.');
      } finally {
        setFormLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 border-4 border-gray-200">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-gray-300">
                <span className="text-white font-bold text-2xl">RR</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 font-serif">Welcome Back</h2>
              <p className="text-gray-700">Sign in to your account</p>
            </div>
            
            {formError && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-4 px-6 rounded-full hover:from-red-700 hover:to-red-900 transition-all duration-300 font-bold text-lg shadow-xl border-2 border-gray-300 hover:border-white transform hover:scale-105 disabled:opacity-50"
              >
                {formLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-700">
                Don't have an account? 
                <button 
                  onClick={() => handleNavigation('register')}
                  className="text-red-600 hover:text-red-800 font-bold ml-1"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RegisterPage = () => {
    const [formData, setFormData] = useState({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);

    const handleInputChange = (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        setFormLoading(true);
        setFormError(null);

        // Validation
        if (!formData.username || !formData.email || !formData.password || !formData.firstName || !formData.lastName) {
          setFormError('Please fill in all fields');
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setFormError('Passwords do not match');
          return;
        }

        if (formData.password.length < 6) {
          setFormError('Password must be at least 6 characters long');
          return;
        }

        // Create account
        const { confirmPassword, ...registrationData } = formData;
        const response = await api.auth.register(registrationData);
        console.log('✅ Registration successful:', response);
        
        handleLoginSuccess(response);
        
      } catch (error) {
        console.error('❌ Registration failed:', error);
        setFormError(error.message || 'Registration failed. Please try again.');
      } finally {
        setFormLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 border-4 border-gray-200">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-gray-300">
                <span className="text-white font-bold text-2xl">RR</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 font-serif">Join Red Robin</h2>
              <p className="text-gray-700">Create your beer reviewer account</p>
            </div>
            
            {formError && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="beerexpert123"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-4 px-6 rounded-full hover:from-red-700 hover:to-red-900 transition-all duration-300 font-bold text-lg shadow-xl border-2 border-gray-300 hover:border-white transform hover:scale-105 disabled:opacity-50"
              >
                {formLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-700">
                Already have an account? 
                <button 
                  onClick={() => handleNavigation('login')}
                  className="text-red-600 hover:text-red-800 font-bold ml-1"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const BeerDetailPage = () => {
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsError, setReviewsError] = useState(null);
    const [submittingReview, setSubmittingReview] = useState(false);
    // Local state for this component only
    const [localUserReview, setLocalUserReview] = useState({ rating: 0, notes: '', username: '' });

    // Reset local review state when component mounts or beer changes
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

    const handleReviewChange = (field, value) => {
      setLocalUserReview(prev => ({
        ...prev,
        [field]: value
      }));
    };

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
        
        // Reset local form
        setLocalUserReview({ 
          rating: 0, 
          notes: '', 
          username: user?.username || '' 
        });
        
        // Reload reviews manually
        await loadBeerReviews(selectedBeer._id);
        
        // Reload beer data to get updated ratings
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2 font-serif">{selectedBeer.name}</h1>
            <h2 className="text-2xl text-red-600 font-semibold mb-6">{selectedBeer.brewery}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-600 mb-1">Style</div>
                <div className="text-lg font-bold text-red-600">{selectedBeer.style}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-600 mb-1">ABV</div>
                <div className="text-lg font-bold text-gray-900">{selectedBeer.abv}%</div>
              </div>
              {selectedBeer.ibu && (
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-1">IBU</div>
                  <div className="text-lg font-bold text-gray-900">{selectedBeer.ibu}</div>
                </div>
              )}
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
                    <label className="block text-sm font-medium text-gray-800 mb-2">Tasting Notes (Optional)</label>
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
                      <p className="text-gray-700 leading-relaxed">{review.notes}</p>
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

  const ProfilePage = () => {
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
  
  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <HomePage />;
      case 'beers':
        return <BeersPage />;
      case 'friends':
        return <FriendsPage />;
      case 'add':
        return <AddBeerPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'beer-detail':
        return <BeerDetailPage />;
      case 'user-profile':
        return <UserProfilePage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      {renderPage()}
    </div>
  );
};

export default BeerReviewApp;