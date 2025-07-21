import React from 'react';
import { TrendingUp, Users, Beer } from 'lucide-react';
import BeerCard from '../components/BeerCard';
import WineCard from '../components/WineCard';
import SpiritCard from '../components/SpiritCard';

const HomePage = ({ 
  beers, 
  wines,
  spirits,
  loading, 
  error, 
  handleNavigation, 
  handleBeerSelect,
  handleWineSelect,
  handleSpiritSelect,
  refreshBeers 
}) => {
  
  // Get featured beverages for homepage display (3 beers, 3 wines, 3 spirits)
  const getFeaturedBeverages = () => {
    const getTopItems = (items, count) => {
      if (!items || !Array.isArray(items) || items.length === 0) return [];
      
      // Filter items that have reviews and ratings
      const itemsWithReviews = items.filter(item => 
        item.totalReviews > 0 && item.averageRating > 0
      );
      
      // Sort by rating first, then by total reviews
      const sortedRated = itemsWithReviews.sort((a, b) => {
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating;
        }
        return b.totalReviews - a.totalReviews;
      });
      
      // Get unrated items and shuffle them
      const unratedItems = items.filter(item => 
        !item.totalReviews || item.totalReviews === 0
      ).sort(() => Math.random() - 0.5);
      
      // Combine rated and unrated, prioritizing rated items
      const combined = [...sortedRated, ...unratedItems];
      
      return combined.slice(0, count);
    };

    return {
      beers: getTopItems(beers, 3),
      wines: getTopItems(wines, 3),
      spirits: getTopItems(spirits, 3)
    };
  };

  const featuredBeverages = getFeaturedBeverages();
  const hasRatedItems = [
    ...(beers || []),
    ...(wines || []),
    ...(spirits || [])
  ].some(item => item.totalReviews > 0 && item.averageRating > 0);

  const totalBeverages = (beers?.length || 0) + (wines?.length || 0) + (spirits?.length || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-12">
          {/* Hero Title */}
          <div className="relative mb-8">
            <h5 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-black mb-4 font-serif tracking-wide drop-shadow-lg text-center leading-tight select-none">
              Welcome to Red Robin Rating<br />
              <span className="text-lg md:text-xl lg:text-2xl xl:text-3xl">The official review site by Red Robin Brewing Co.</span>
            </h5>
            <div className="absolute -top-2 -left-2 w-full h-full text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-200 font-serif tracking-wide -z-10 opacity-50 text-center leading-tight">
              Welcome to Red Robin Rating<br />
              <span className="text-lg md:text-xl lg:text-2xl xl:text-3xl">The official review site by Red Robin Brewing Co.</span>
            </div>
          </div>
          
          {/* Logo Section */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img 
                src="/pinup-logo.png" 
                alt="Red Robin Brewing Co. - Vintage Pin-up Logo" 
                className="w-96 h-96 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-96 h-96 bg-gradient-to-br from-red-600 to-black rounded-full flex items-center justify-center drop-shadow-2xl hover:scale-105 transition-transform duration-300" style={{display: 'none'}}>
                <span className="text-white font-bold text-9xl select-none">RR</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-full"></div> 
            </div>
          </div>

          {/* App Features Heading */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-2 font-serif select-none">
              App Features
            </h2>
            <p className="text-gray-600 text-lg select-none">
              Discover what makes Red Robin Rating special
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-200 hover:border-red-500 transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 font-serif select-none">Track Your Favorites</h3>
              <p className="text-gray-700 text-lg leading-relaxed select-none">Rate and review beverages as you taste them to build a profile tailored to your preference</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-200 hover:border-red-500 transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 font-serif select-none">Connect with Friends</h3>
              <p className="text-gray-700 text-lg leading-relaxed select-none">See what your mates are drinking and discover new favorites through user recommendations</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-200 hover:border-red-500 transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Beer className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 font-serif select-none">Explore New Brews</h3>
              <p className="text-gray-700 text-lg leading-relaxed select-none">Discover exceptional craft breweries, wineries, and distilleries that will make your day</p>
            </div>
          </div>
        </div>

        {/* Featured Beverages Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-black to-gray-800 rounded-xl p-2 mb-8 text-center">
            <h3 className="text-3xl font-bold text-white mb-2 font-serif select-none">
              {hasRatedItems ? "Top Rated Beverages" : "Featured Collection"}
            </h3>
            <p className="text-gray-300 select-none">
              {hasRatedItems 
                ? "Discover our community's highest-rated beers, wines, and spirits" 
                : "Explore a curated selection from our beverage collection"
              }
            </p>
          </div>
          
          {/* Loading state */}
          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-600 select-none">Loading beverages...</p>
            </div>
          )}
          
          {/* Error state */}
          {error && (
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-300 rounded-xl p-6 max-w-md mx-auto">
                <p className="text-red-600 mb-4 select-none">{error}</p>
                <button 
                  onClick={refreshBeers}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          
          {/* Beverage Display */}
          {!loading && !error && (
            <>
              {totalBeverages === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
                    <p className="text-gray-700 mb-4 text-lg select-none">No beverages added yet!</p>
                    <button 
                      onClick={() => handleNavigation('add-beverage')}
                      className="bg-gradient-to-r from-black to-gray-800 text-white px-8 py-3 rounded-lg hover:from-gray-800 hover:to-black transition-all duration-300 font-semibold"
                    >
                      Add Your First Beverage
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Featured Beers */}
                  {featuredBeverages.beers.length > 0 && (
                    <div className="mb-8">
                      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-t-xl p-4 mb-0">
                        <h4 className="text-2xl font-bold text-white text-center font-serif">🍺 Featured Beer + Cider</h4>
                      </div>
                      <div className="bg-white border-2 border-red-200 border-t-0 rounded-b-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {featuredBeverages.beers.map((beer) => (
                            <BeerCard 
                              key={beer._id} 
                              beer={beer} 
                              onClick={handleBeerSelect} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Featured Wines */}
                  {featuredBeverages.wines.length > 0 && (
                    <div className="mb-8">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-t-xl p-4 mb-0">
                        <h4 className="text-2xl font-bold text-white text-center font-serif">🍷 Featured Wines</h4>
                      </div>
                      <div className="bg-white border-2 border-purple-200 border-t-0 rounded-b-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {featuredBeverages.wines.map((wine) => (
                            <WineCard 
                              key={wine._id} 
                              wine={wine} 
                              onClick={handleWineSelect} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Featured Spirits */}
                  {featuredBeverages.spirits.length > 0 && (
                    <div className="mb-8">
                      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-t-xl p-4 mb-0">
                        <h4 className="text-2xl font-bold text-white text-center font-serif">🥃 Featured Spirits</h4>
                      </div>
                      <div className="bg-white border-2 border-amber-200 border-t-0 rounded-b-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {featuredBeverages.spirits.map((spirit) => (
                            <SpiritCard 
                              key={spirit._id} 
                              spirit={spirit} 
                              onClick={handleSpiritSelect} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* View All Beverages Buttons */}
                  <div className="text-center space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button 
                        onClick={() => handleNavigation('beers')}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
                      >
                        View All Beer and Cider ({beers?.length || 0})
                      </button>
                      <button 
                        onClick={() => handleNavigation('wines')}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
                      >
                        View All Wines ({wines?.length || 0})
                      </button>
                      <button 
                        onClick={() => handleNavigation('spirits')}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
                      >
                        View All Spirits ({spirits?.length || 0})
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;