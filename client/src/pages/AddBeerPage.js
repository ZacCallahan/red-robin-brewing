import React, { useState } from 'react';
import { Beer, Clock, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

const AddBeerPage = ({ isLoggedIn, handleNavigation, refreshBeers }) => {
  const [beerData, setBeerData] = useState({
    name: '',
    brewery: '',
    style: '',
    abv: '',
    description: '',
    sessionable: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Beer styles available
  const beerStyles = ['IPA', 'Stout', 'Wheat', 'Lager', 'Ale', 'Pilsner', 'Sour', 'Porter', 'Other'];

  const handleInputChange = (field, value) => {
    setBeerData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-suggest sessionable based on ABV and style
    if (field === 'abv' || field === 'style') {
      const newAbv = field === 'abv' ? parseFloat(value) : parseFloat(beerData.abv);
      const newStyle = field === 'style' ? value : beerData.style;
      
      if (!isNaN(newAbv)) {
        const sessionableStyles = ['Lager', 'Wheat', 'Pilsner', 'Ale'];
        const autoSessionable = (newAbv <= 4.5) || (newAbv <= 5.0 && sessionableStyles.includes(newStyle));
        
        if (autoSessionable && !beerData.sessionable) {
          setBeerData(prev => ({
            ...prev,
            [field]: value,
            sessionable: true
          }));
        } else {
          setBeerData(prev => ({
            ...prev,
            [field]: value
          }));
        }
      }
    }
  };

  const handleSessionableToggle = () => {
    setBeerData(prev => ({
      ...prev,
      sessionable: !prev.sessionable
    }));
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      setError('You must be logged in to add a beer');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Validation
      if (!beerData.name || !beerData.brewery || !beerData.style || !beerData.abv) {
        setError('Please fill in all required fields');
        return;
      }

      if (isNaN(parseFloat(beerData.abv)) || parseFloat(beerData.abv) < 0 || parseFloat(beerData.abv) > 20) {
        setError('ABV must be a number between 0 and 20');
        return;
      }

      const submitData = {
        ...beerData,
        abv: parseFloat(beerData.abv)
      };

      await api.beers.create(submitData);
      
      setSuccess(true);
      setBeerData({
        name: '',
        brewery: '',
        style: '',
        abv: '',
        description: '',
        sessionable: false
      });
      
      // Refresh the beers list
      if (refreshBeers) {
        await refreshBeers();
      }

      // Auto-redirect after success
      setTimeout(() => {
        setSuccess(false);
        handleNavigation('beers');
      }, 2000);

    } catch (error) {
      console.error('Error adding beer:', error);
      setError(error.message || 'Failed to add beer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-xl p-8 border-4 border-gray-200 text-center">
            <Beer className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">Login Required</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to add beers to our collection.</p>
            <div className="space-y-3">
              <button 
                onClick={() => handleNavigation('login')}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Login
              </button>
              <button 
                onClick={() => handleNavigation('register')}
                className="w-full border-2 border-red-600 text-red-600 px-6 py-3 rounded-lg hover:bg-red-600 hover:text-white transition-colors font-semibold"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-xl p-8 border-4 border-green-200 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">Beer Added Successfully!</h2>
            <p className="text-gray-600 mb-4">"{beerData.name}" has been added to our collection.</p>
            <p className="text-sm text-gray-500">Redirecting to beers page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-black to-gray-800 rounded-xl p-2 mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2 font-serif">Add New Beer</h2>
          <p className="text-gray-300">Share a new brew with our community</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-xl p-8 border-4 border-gray-200">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Beer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Beer Name *
              </label>
              <input
                type="text"
                value={beerData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., Hazy IPA, Imperial Stout"
                required
              />
            </div>

            {/* Brewery */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Brewery *
              </label>
              <input
                type="text"
                value={beerData.brewery}
                onChange={(e) => handleInputChange('brewery', e.target.value)}
                className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., Stone Brewing, Little Creatures"
                required
              />
            </div>

            {/* Style and ABV Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Style */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Beer Style *
                </label>
                <select
                  value={beerData.style}
                  onChange={(e) => handleInputChange('style', e.target.value)}
                  className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="">Select a style</option>
                  {beerStyles.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>

              {/* ABV */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  ABV (%) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  value={beerData.abv}
                  onChange={(e) => handleInputChange('abv', e.target.value)}
                  className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g., 5.5"
                  required
                />
              </div>
            </div>

            {/* Sessionable Toggle */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    Sessionable Beer
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Perfect for drinking multiple over a session (typically low ABV, balanced flavor)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSessionableToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    beerData.sessionable ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      beerData.sessionable ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {beerData.sessionable && (
                <div className="mt-3 p-3 bg-green-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      This beer is marked as sessionable
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Description
              </label>
              <textarea
                value={beerData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows="4"
                className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Describe the beer's flavor profile, aroma, appearance, or any other notes..."
                maxLength="500"
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {beerData.description.length}/500 characters
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-4 px-6 rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-300 font-bold text-lg shadow-xl disabled:opacity-50 transform hover:scale-105"
              >
                {isSubmitting ? 'Adding Beer...' : 'Add Beer to Collection'}
              </button>
            </div>

            {/* Back Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => handleNavigation('beers')}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Back to Beers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBeerPage;