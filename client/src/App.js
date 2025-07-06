import React, { useState, useEffect } from 'react';
import { Star, Plus, Search, User, LogIn, Home, Beer, Users, ChevronRight, TrendingUp } from 'lucide-react';
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
  const [userReview, setUserReview] = useState({ rating: 0, notes: '', username: '' });

  // Load data on app start
  useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const result = await api.test();
      console.log('✅ Backend connected:', result);
      
      // Load real beers from database
      const beersData = await api.beers.getAll();
      console.log('✅ Beers loaded:', beersData);
      
      // Make sure we got an array
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
      setBeers([]); // Ensure beers is always an array
    } finally {
      setLoading(false);
    }
  };
  
  loadData();
}, []);

  // Function to refresh beers list
  const refreshBeers = async () => {
    try {
      const beersData = await api.beers.getAll();
      setBeers(beersData);
    } catch (error) {
      console.error('Error refreshing beers:', error);
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
    {/* Remove the old image section, replace with this: */}
    <div className="p-6 bg-white">
      <h3 className="font-bold text-2xl text-gray-900 mb-3 font-serif">{beer.name}</h3>
      <p className="text-red-600 font-semibold mb-4 text-xl">{beer.brewery}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="text-sm font-bold text-white bg-red-600 px-3 py-1 rounded-full">{beer.style}</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <span className="text-lg font-bold text-gray-800">{beer.abv}% ABV</span>
        </div>
      </div>

      {beer.ibu && (
        <div className="bg-gray-50 p-3 rounded-lg mb-4 text-center">
          <span className="text-sm text-gray-600">IBU: </span>
          <span className="text-lg font-bold text-gray-800">{beer.ibu}</span>
        </div>
      )}
      
      {/* Ratings Section */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Community Rating:</span>
          <div className="flex items-center gap-2">
            <StarRating rating={beer.averageRating || 0} />
            <span className="text-sm font-semibold text-gray-700">
              {beer.averageRating ? beer.averageRating.toFixed(1) : '0.0'}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{beer.totalReviews || 0} reviews</span>
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
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide font-serif">
              Red Robin Brewing Co.
            </h1>
            <p className="text-gray-300 text-sm italic">Est. 2019 - Premium Craft Brewing</p>
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
          <div className="relative mb-8">
            <h2 className="text-6xl font-bold text-gray-900 mb-4 font-serif tracking-wide drop-shadow-lg">
              Welcome to Red Robin Brewing Co.
            </h2>
            <div className="absolute -top-2 -left-2 w-full h-full text-6xl font-bold text-red-200 font-serif tracking-wide -z-10 opacity-50">
              Welcome to Red Robin Brewing Co.
            </div>
          </div>
          
          {/* Pin-up Girl Logo Feature */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img 
                src="/pinup-logo.png" 
                alt="Red Robin Brewing Co. - Vintage Pin-up Logo" 
                className="w-48 h-48 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
              />
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
                    onClick={() => setCurrentPage('add')}
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
                      onClick={(clickedBeer) => {
                        setSelectedBeer(clickedBeer);
                        setCurrentPage('beer-detail');
                      }} 
                    />
                  ))
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const SearchPage = () => {
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 font-serif">Search Our Collection</h2>
          
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
              <input
                type="text"
                placeholder="Search for beers, breweries, or styles..."
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beers
              .filter(beer => 
                beer.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
                beer.brewery.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
                beer.style.toLowerCase().includes(localSearchTerm.toLowerCase())
              )
              .map((beer) => (
                <BeerCard key={beer._id} beer={beer} onClick={() => setCurrentPage('beer-detail')} />
              ))}
          </div>
          
          {localSearchTerm && beers.filter(beer => 
            beer.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
            beer.brewery.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
            beer.style.toLowerCase().includes(localSearchTerm.toLowerCase())
          ).length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No beers found matching "{localSearchTerm}"</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const AddBeerPage = () => {
  // Use local state to prevent re-rendering issues
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
                onChange={(e) => setLocalBeer({...localBeer, name: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., Hoppy IPA"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Brewery</label>
              <input
                type="text"
                value={localBeer.brewery}
                onChange={(e) => setLocalBeer({...localBeer, brewery: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., Local Craft Brewery"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Style</label>
                <select
                  value={localBeer.style}
                  onChange={(e) => setLocalBeer({...localBeer, style: e.target.value})}
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
                  onChange={(e) => setLocalBeer({...localBeer, abv: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="5.0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">IBU</label>
                <input
                  type="number"
                  value={localBeer.ibu}
                  onChange={(e) => setLocalBeer({...localBeer, ibu: e.target.value})}
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
                onChange={(e) => setLocalBeer({...localBeer, notes: e.target.value})}
                rows="4"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Share your thoughts about this beer..."
              />
            </div>
            
            <button
              type="button"
              onClick={async () => {
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
                  setCurrentPage('home');
                  
                } catch (error) {
                  console.error('❌ Error adding beer:', error);
                  setLocalError('Failed to add beer. Please try again.');
                } finally {
                  setLocalLoading(false);
                }
              }}
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

  const BeerDetailPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Load reviews when beer is selected
  useEffect(() => {
    if (selectedBeer) {
      loadReviews();
    }
  }, [selectedBeer]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const reviews = await api.reviews.getByBeerId(selectedBeer._id);
      setBeerReviews(reviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    try {
      setSubmittingReview(true);
      setError(null);

      if (!userReview.rating || !userReview.username.trim()) {
        setError('Please provide a rating and username');
        return;
      }

      const reviewData = {
        beerId: selectedBeer._id,
        rating: userReview.rating,
        notes: userReview.notes,
        username: userReview.username.trim()
      };

      await api.reviews.create(reviewData);
      
      // Reload reviews and beer data
      await loadReviews();
      await refreshBeers();
      
      // Reset form
      setUserReview({ rating: 0, notes: '', username: '' });
      
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review');
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
          onClick={() => {
            setSelectedBeer(null);
            setCurrentPage('home');
          }}
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
          
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Your Name</label>
              <input
                type="text"
                value={userReview.username}
                onChange={(e) => setUserReview({...userReview, username: e.target.value})}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Your Rating</label>
              <StarRating 
                rating={userReview.rating} 
                onRate={(rating) => setUserReview({...userReview, rating})} 
                interactive={true} 
                size="w-8 h-8" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Tasting Notes (Optional)</label>
              <textarea
                value={userReview.notes}
                onChange={(e) => setUserReview({...userReview, notes: e.target.value})}
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
        </div>

        {/* Community Reviews */}
        <div className="bg-white rounded-xl shadow-xl p-8 border-4 border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif">
            Community Reviews ({beerReviews.length})
          </h3>

          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          )}

          {!loading && beerReviews.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No reviews yet. Be the first to review this beer!</p>
            </div>
          )}

          {!loading && beerReviews.length > 0 && (
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
    case 'beer-detail':
      return <BeerDetailPage />;
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