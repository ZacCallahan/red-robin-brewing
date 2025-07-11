import React from 'react';
import { TrendingUp, Users, Beer } from 'lucide-react';
import BeerCard from '../components/BeerCard';

const HomePage = ({ 
  beers, 
  loading, 
  error, 
  handleNavigation, 
  handleBeerSelect, 
  refreshBeers 
}) => {
  
  // Function to get top 6 beers for display
  const getFeaturedBeers = () => {
    if (!beers || !Array.isArray(beers) || beers.length === 0) return [];

    
    // Filter beers that have reviews and ratings
    // To this:
const beersWithReviews = (beers || []).filter(beer => 
  beer.totalReviews > 0 && beer.averageRating > 0
);
    
    if (beersWithReviews.length >= 6) {
      // Sort by average rating (descending), then by total reviews (descending)
      return beersWithReviews
        .sort((a, b) => {
          if (b.averageRating !== a.averageRating) {
            return b.averageRating - a.averageRating;
          }
          return b.totalReviews - a.totalReviews;
        })
        .slice(0, 6);
    } else {
      // Not enough rated beers, mix rated beers with random unrated ones
      const unratedBeers = beers.filter(beer => 
        !beer.totalReviews || beer.totalReviews === 0
      );
      
      // Shuffle unrated beers for randomness
      const shuffledUnrated = [...unratedBeers].sort(() => Math.random() - 0.5);
      
      // Combine rated beers (sorted by rating) with random unrated beers
      const featuredBeers = [
        ...beersWithReviews.sort((a, b) => {
          if (b.averageRating !== a.averageRating) {
            return b.averageRating - a.averageRating;
          }
          return b.totalReviews - a.totalReviews;
        }),
        ...shuffledUnrated
      ];
      
      return featuredBeers.slice(0, 6);
    }
  };

  const featuredBeers = getFeaturedBeers();
  const hasRatedBeers = beers.some(beer => beer.totalReviews > 0 && beer.averageRating > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-12">
          <div className="relative mb-8">
            <h5 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-black mb-4 font-serif tracking-wide drop-shadow-lg text-center leading-tight select-none">
              Welcome to Red Robin Rating,<br />
              <span className="text-xl md:text-2xl lg:text-3xl xl:text-4xl">the official beer review site from Red Robin Brewing Co.</span>
            </h5>
            <div className="absolute -top-2 -left-2 w-full h-full text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-200 font-serif tracking-wide -z-10 opacity-50 text-center leading-tight">
              Welcome to Red Robin Rating,<br />
              <span className="text-xl md:text-2xl lg:text-3xl xl:text-4xl">the official beer review site from Red Robin Brewing Co.</span>
            </div>
          </div>
          
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

          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-200 hover:border-red-500 transition-all duration-300 transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4 font-serif select-none">Track Your Favorites</h3>
              <p className="text-gray-700 text-lg leading-relaxed select-none">Rate and review beers as you taste them to build a profile tailored to your preference</p>
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
              <p className="text-gray-700 text-lg leading-relaxed select-none">Discover exceptional craft breweries and rare finds that will make your day</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-gradient-to-r from-black to-gray-800 rounded-xl p-2 mb-8 text-center">
            <h3 className="text-3xl font-bold text-white mb-2 font-serif select-none">
              {hasRatedBeers ? "Top Rated Beers" : "Featured Collection"}
            </h3>
            <p className="text-gray-300 select-none">
              {hasRatedBeers 
                ? "Discover our community's highest-rated craft beers" 
                : "Explore a selection of our user-sourced beer selection below"
              }
            </p>
          </div>
          
          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-600 select-none">Loading beers...</p>
            </div>
          )}
          
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
          
          {!loading && !error && (
            <>
              {featuredBeers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
                    <p className="text-gray-700 mb-4 text-lg select-none">No beers added yet!</p>
                    <button 
                      onClick={() => handleNavigation('add-beer')}
                      className="bg-gradient-to-r from-black to-gray-800 text-white px-8 py-3 rounded-lg hover:from-gray-800 hover:to-black transition-all duration-300 font-semibold"
                    >
                      Add Your First Beer
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    {featuredBeers.map((beer) => (
                      <BeerCard 
                        key={beer._id} 
                        beer={beer} 
                        onClick={handleBeerSelect} 
                      />
                    ))}
                  </div>
                  
                  {/* View All Beers Button */}
                  <div className="text-center">
                    <button 
                      onClick={() => handleNavigation('beers')}
                      className="bg-gradient-to-r from-red-600 to-red-800 text-white px-8 py-3 rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105"
                    >
                      View All Beers ({beers.length})
                    </button>
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