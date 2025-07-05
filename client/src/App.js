import React, { useState, useEffect } from 'react';
import { Star, Plus, Search, User, LogIn, Home, Beer, Users, ChevronRight, Heart, MessageCircle, TrendingUp } from 'lucide-react';
import { api } from './services/api';

const BeerReviewApp = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [beers, setBeers] = useState([
    {
      id: 1,
      name: "Hoppy IPA",
      brewery: "Local Craft Brewery",
      style: "IPA",
      abv: 6.5,
      ibu: 65,
      rating: 4.2,
      reviews: 24,
      image: "https://via.placeholder.com/300x400/8B4513/FFFFFF?text=Beer"
    },
    {
      id: 2,
      name: "Smooth Stout",
      brewery: "Dark Mountain Brewing",
      style: "Stout",
      abv: 5.8,
      ibu: 35,
      rating: 4.5,
      reviews: 31,
      image: "https://via.placeholder.com/300x400/2F1B14/FFFFFF?text=Beer"
    },
    {
      id: 3,
      name: "Golden Wheat",
      brewery: "Sunshine Brewery",
      style: "Wheat",
      abv: 4.8,
      ibu: 20,
      rating: 3.8,
      reviews: 18,
      image: "https://via.placeholder.com/300x400/DAA520/FFFFFF?text=Beer"
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newBeer, setNewBeer] = useState({
    name: '',
    brewery: '',
    style: '',
    abv: '',
    ibu: '',
    notes: ''
  });
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');

  // Test API connection on app load
  useEffect(() => {
    const testConnection = async () => {
      try {
        const result = await api.test();
        console.log('✅ Backend connected:', result);
      } catch (error) {
        console.error('❌ Backend connection failed:', error);
      }
    };
    
    testConnection();
  }, []);

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
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
      onClick={() => onClick(beer)}
    >
      <div className="aspect-w-3 aspect-h-4 bg-gradient-to-br from-red-50 to-red-100">
        <img 
          src={beer.image} 
          alt={beer.name}
          className="w-full h-48 object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-1">{beer.name}</h3>
        <p className="text-red-600 font-medium mb-2">{beer.brewery}</p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{beer.style}</span>
          <span className="text-sm font-medium text-gray-700">{beer.abv}% ABV</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StarRating rating={beer.rating} />
            <span className="text-sm text-gray-600">({beer.reviews})</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );

  const Navigation = () => (
    <nav className="bg-red-700 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Beer className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Red Robin Brewing Co.</h1>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setCurrentPage('home')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              currentPage === 'home' ? 'bg-red-800' : 'hover:bg-red-600'
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button 
            onClick={() => setCurrentPage('search')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              currentPage === 'search' ? 'bg-red-800' : 'hover:bg-red-600'
            }`}
          >
            <Search className="w-4 h-4" />
            Search
          </button>
          <button 
            onClick={() => setCurrentPage('add')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              currentPage === 'add' ? 'bg-red-800' : 'hover:bg-red-600'
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Beer
          </button>
          {isLoggedIn ? (
            <button 
              onClick={() => setCurrentPage('profile')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <User className="w-4 h-4" />
              Profile
            </button>
          ) : (
            <button 
              onClick={() => setCurrentPage('login')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );

  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Red Robin Brewing Co.</h2>
          <p className="text-xl text-gray-600 mb-8">Discover, rate, and share your favorite beers with friends</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <TrendingUp className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Track Your Favorites</h3>
              <p className="text-gray-600">Rate and review beers to build your personal taste profile</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <Users className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Connect with Friends</h3>
              <p className="text-gray-600">See what your friends are drinking and discover new favorites</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <Beer className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Explore New Beers</h3>
              <p className="text-gray-600">Discover craft breweries and hidden gems in your area</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Featured Beers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beers.map((beer) => (
              <BeerCard key={beer.id} beer={beer} onClick={() => setCurrentPage('beer-detail')} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const SearchPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Search Beers</h2>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for beers, breweries, or styles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beers
            .filter(beer => 
              beer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              beer.brewery.toLowerCase().includes(searchTerm.toLowerCase()) ||
              beer.style.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((beer) => (
              <BeerCard key={beer.id} beer={beer} onClick={() => setCurrentPage('beer-detail')} />
            ))}
        </div>
      </div>
    </div>
  );

  const AddBeerPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Add New Beer</h2>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Beer Name</label>
              <input
                type="text"
                value={newBeer.name}
                onChange={(e) => setNewBeer({...newBeer, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Hoppy IPA"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brewery</label>
              <input
                type="text"
                value={newBeer.brewery}
                onChange={(e) => setNewBeer({...newBeer, brewery: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Local Craft Brewery"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
                <select
                  value={newBeer.style}
                  onChange={(e) => setNewBeer({...newBeer, style: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select Style</option>
                  <option value="IPA">IPA</option>
                  <option value="Stout">Stout</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Lager">Lager</option>
                  <option value="Ale">Ale</option>
                  <option value="Pilsner">Pilsner</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ABV (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newBeer.abv}
                  onChange={(e) => setNewBeer({...newBeer, abv: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="5.0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IBU</label>
                <input
                  type="number"
                  value={newBeer.ibu}
                  onChange={(e) => setNewBeer({...newBeer, ibu: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="30"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              <StarRating rating={userRating} onRate={setUserRating} interactive={true} size="w-8 h-8" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tasting Notes</label>
              <textarea
                value={newBeer.notes}
                onChange={(e) => setNewBeer({...newBeer, notes: e.target.value})}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Share your thoughts about this beer..."
              />
            </div>
            
            <button
              type="button"
              onClick={() => {
                console.log('Adding beer:', newBeer);
                // This will later connect to your API
              }}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Add Beer & Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const LoginPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Beer className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="button"
              onClick={() => {
                setIsLoggedIn(true);
                setUser({ name: "John Doe", email: "john@example.com" });
                setCurrentPage('home');
              }}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Sign In
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account? 
              <button className="text-red-600 hover:text-red-700 font-medium ml-1">
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <HomePage />;
      case 'search':
        return <SearchPage />;
      case 'add':
        return <AddBeerPage />;
      case 'login':
        return <LoginPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {renderPage()}
    </div>
  );
};

export default BeerReviewApp;