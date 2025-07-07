import React, { useState, useEffect } from 'react';
import { Beer } from 'lucide-react';
import { api } from '../services/api';
import StarRating from '../components/StarRating';

const AddBeerPage = ({ 
  isLoggedIn, 
  handleNavigation, 
  handleLogout, 
  refreshBeers 
}) => {
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

export default AddBeerPage;