import React, { useState, useEffect } from 'react';
import { Star, Plus, Search, User, LogIn, Home, Beer, Users, ChevronRight, TrendingUp } from 'lucide-react';
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
      className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 border-4 border-gray-200 hover:border-red-500"
      onClick={() => onClick(beer)}
    >
      <div className="aspect-w-3 aspect-h-4 bg-gradient-to-br from-gray-100 to-gray-200 relative">
        <img 
          src={beer.image} 
          alt={beer.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>
      <div className="p-5 bg-white">
        <h3 className="font-bold text-xl text-gray-900 mb-2 font-serif">{beer.name}</h3>
        <p className="text-red-600 font-semibold mb-3 text-lg">{beer.brewery}</p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-white bg-red-600 px-3 py-1 rounded-full">{beer.style}</span>
          <span className="text-sm font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">{beer.abv}% ABV</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StarRating rating={beer.rating} />
            <span className="text-sm font-semibold text-gray-700">({beer.reviews})</span>
          </div>
          <ChevronRight className="w-5 h-5 text-red-600" />
        </div>
      </div>
    </div>
  );

  const Navigation = () => (
    <nav className="bg-gradient-to-r from-black via-gray-900 to-black text-white p-4 shadow-xl border-b-4 border-red-600">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg">
            <img 
              src="/logo.png" 
              alt="Red Robin Brewing Co. Logo" 
              className="w-14 h-14 rounded-full object-cover border-2 border-white"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide font-serif">Red Robin Brewing Co.</h1>
            <p className="text-gray-300 text-sm italic">Est. 2019</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setCurrentPage('home')}
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
            onClick={() => setCurrentPage('search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-semibold border-2 ${
              currentPage === 'search' 
                ? 'bg-red-600 text-white border-white shadow-lg' 
                : 'border-red-600 text-red-400 hover:bg-red-600 hover:text-white hover:border-white'
            }`}
          >
            <Search className="w-4 h-4" />
            Search
          </button>
          <button 
            onClick={() => setCurrentPage('add')}
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
            <button 
              onClick={() => setCurrentPage('profile')}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-semibold border-2 border-red-600 text-red-400 hover:bg-red-600 hover:text-white hover:border-white"
            >
              <User className="w-4 h-4" />
              Profile
            </button>
          ) : (
            <button 
              onClick={() => setCurrentPage('login')}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 font-semibold border-2 border-red-600 text-red-400 hover:bg-red-600 hover:text-white hover:border-white"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-12">
          {/* Pin-up Girl Logo Feature */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img 
                src="/pinup-logo.png" 
                alt="Red Robin Brewing Co. - Vintage Pin-up Logo" 
                className="w-80 h-80 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-full"></div>
            </div>
          </div>
          <div className="relative mb-8">
            <h2 className="text-6xl font-bold text-gray-900 mb-4 font-serif tracking-wide drop-shadow-lg">
              Welcome to Red Robin Brewing Co.
            </h2>
            <div className="absolute -top-2 -left-2 w-full h-full text-6xl font-bold text-red-200 font-serif tracking-wide -z-10 opacity-50">
              Welcome to Red Robin Brewing Co.
            </div>
          </div>

          
          <p className="text-2xl text-gray-700 mb-8 font-medium italic">
            place holder text
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {beers.map((beer) => (
              <BeerCard key={beer.id} beer={beer} onClick={() => setCurrentPage('beer-detail')} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const SearchPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 font-serif">Search Our Collection</h2>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
            <input
              type="text"
              placeholder="Search for beers, breweries, or styles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 font-serif">Add New Beer</h2>
        
        <div className="bg-white rounded-lg shadow-lg p-6 border-4 border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Beer Name</label>
              <input
                type="text"
                value={newBeer.name}
                onChange={(e) => setNewBeer({...newBeer, name: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., Hoppy IPA"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Brewery</label>
              <input
                type="text"
                value={newBeer.brewery}
                onChange={(e) => setNewBeer({...newBeer, brewery: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., Local Craft Brewery"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Style</label>
                <select
                  value={newBeer.style}
                  onChange={(e) => setNewBeer({...newBeer, style: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                <label className="block text-sm font-medium text-gray-800 mb-2">ABV (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newBeer.abv}
                  onChange={(e) => setNewBeer({...newBeer, abv: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="5.0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">IBU</label>
                <input
                  type="number"
                  value={newBeer.ibu}
                  onChange={(e) => setNewBeer({...newBeer, ibu: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="30"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Your Rating</label>
              <StarRating rating={userRating} onRate={setUserRating} interactive={true} size="w-8 h-8" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Tasting Notes</label>
              <textarea
                value={newBeer.notes}
                onChange={(e) => setNewBeer({...newBeer, notes: e.target.value})}
                rows="4"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Share your thoughts about this beer..."
              />
            </div>
            
            <button
              type="button"
              onClick={() => {
                console.log('Adding beer:', newBeer);
              }}
              className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-4 px-6 rounded-full hover:from-red-700 hover:to-red-900 transition-all duration-300 font-bold text-lg shadow-xl border-2 border-gray-300 hover:border-white transform hover:scale-105"
            >
              Add Beer & Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const LoginPage = () => (
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
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
              className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-4 px-6 rounded-full hover:from-red-700 hover:to-red-900 transition-all duration-300 font-bold text-lg shadow-xl border-2 border-gray-300 hover:border-white transform hover:scale-105"
            >
              Sign In
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-700">
              Don't have an account? 
              <button className="text-red-600 hover:text-red-800 font-bold ml-1">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      {renderPage()}
    </div>
  );
};

export default BeerReviewApp;