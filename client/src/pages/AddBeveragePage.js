import React, { useState, useEffect } from 'react';
import { Beer, Wine, Martini, CheckCircle, Clock } from 'lucide-react';
import { api } from '../services/api';

const AddBeveragePage = ({ isLoggedIn, handleNavigation, refreshBeers, refreshWines, refreshSpirits, beers = [], wines = [], spirits = [] }) => {
  const [activeTab, setActiveTab] = useState('beer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Beer data
  const [beerData, setBeerData] = useState({
    name: '',
    brewery: '',
    customBrewery: '',
    style: '',
    abv: '',
    description: '',
    sessionable: false
  });

  // Wine data
  const [wineData, setWineData] = useState({
    name: '',
    winery: '',
    customWinery: '',
    style: '',
    abv: '',
    vintage: '',
    region: '',
    grapeVariety: [],
    sweetness: '',
    description: ''
  });

  // Spirit data
  const [spiritData, setSpiritData] = useState({
    name: '',
    distillery: '',
    customDistillery: '',
    style: '',
    abv: '',
    age: '',
    category: '',
    region: '',
    description: ''
  });

  // Available options for each beverage type
  const beerStyles = ['IPA', 'Stout', 'Wheat', 'Lager', 'Ale', 'Pilsner', 'Sour', 'Porter', 'Other'];
  const wineStyles = ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert', 'Fortified', 'Orange', 'Other'];
  const spiritStyles = ['Whiskey', 'Rum', 'Vodka', 'Gin', 'Tequila', 'Brandy', 'Liqueur', 'Other'];
  const sweetnessLevels = ['Bone Dry', 'Dry', 'Off-Dry', 'Medium-Dry', 'Medium-Sweet', 'Sweet', 'Very Sweet'];
  const grapeVarieties = [
    'Cabernet Sauvignon', 'Merlot', 'Pinot Noir', 'Syrah/Shiraz', 'Chardonnay', 
    'Sauvignon Blanc', 'Riesling', 'Pinot Grigio/Pinot Gris', 'Gewürztraminer', 
    'Sangiovese', 'Tempranillo', 'Grenache', 'Nebbiolo', 'Chenin Blanc', 'Viognier'
  ];

  // Get existing producers for each type
  const existingBreweries = beers && beers.length > 0 
    ? [...new Set(beers.map(beer => beer.brewery?.trim()).filter(Boolean))].sort()
    : [];
  
  const existingWineries = wines && wines.length > 0 
    ? [...new Set(wines.map(wine => wine.winery?.trim()).filter(Boolean))].sort()
    : [];
    
  const existingDistilleries = spirits && spirits.length > 0 
    ? [...new Set(spirits.map(spirit => spirit.distillery?.trim()).filter(Boolean))].sort()
    : [];

  // Tab configuration
  const tabs = [
    { id: 'beer', label: 'Beer', icon: Beer, color: 'red' },
    { id: 'wine', label: 'Wine', icon: Wine, color: 'purple' },
    { id: 'spirit', label: 'Spirit', icon: Martini, color: 'amber' }
  ];

  // Handle input changes for each beverage type
  const handleBeerChange = (field, value) => {
    setBeerData(prev => ({ ...prev, [field]: value }));
  };

  const handleWineChange = (field, value) => {
    setWineData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpiritChange = (field, value) => {
    setSpiritData(prev => ({ ...prev, [field]: value }));
  };

  // Handle producer selection with custom option
  const handleProducerChange = (type, value) => {
    if (type === 'beer') {
      setBeerData(prev => ({
        ...prev,
        brewery: value,
        customBrewery: value === 'Other' ? prev.customBrewery : ''
      }));
    } else if (type === 'wine') {
      setWineData(prev => ({
        ...prev,
        winery: value,
        customWinery: value === 'Other' ? prev.customWinery : ''
      }));
    } else if (type === 'spirit') {
      setSpiritData(prev => ({
        ...prev,
        distillery: value,
        customDistillery: value === 'Other' ? prev.customDistillery : ''
      }));
    }
  };

  // Handle grape variety selection for wines
  const handleGrapeVarietyChange = (grape) => {
    setWineData(prev => ({
      ...prev,
      grapeVariety: prev.grapeVariety.includes(grape)
        ? prev.grapeVariety.filter(g => g !== grape)
        : [...prev.grapeVariety, grape]
    }));
  };

  // Submit form based on active tab
  const handleSubmit = async () => {
    if (!isLoggedIn) {
      setError('You must be logged in to add a beverage');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      let result;
      let redirectPage;

      if (activeTab === 'beer') {
        // Beer validation and submission
        const finalBrewery = beerData.brewery === 'Other' ? beerData.customBrewery.trim() : beerData.brewery;
        
        if (!beerData.name?.trim() || !finalBrewery || !beerData.style || !beerData.abv) {
          setError('Please fill in all required fields');
          return;
        }

        const abvValue = parseFloat(beerData.abv);
        if (isNaN(abvValue) || abvValue < 0 || abvValue > 20) {
          setError('ABV must be a number between 0 and 20');
          return;
        }

        const submitData = {
          name: beerData.name.trim(),
          brewery: finalBrewery,
          style: beerData.style,
          abv: abvValue,
          description: beerData.description?.trim() || '',
          sessionable: beerData.sessionable
        };

        result = await api.beers.create(submitData);
        setSuccessMessage('Beer added successfully!');
        redirectPage = 'beers';
        if (refreshBeers) await refreshBeers();

      } else if (activeTab === 'wine') {
        // Wine validation and submission
        const finalWinery = wineData.winery === 'Other' ? wineData.customWinery.trim() : wineData.winery;
        
        if (!wineData.name?.trim() || !finalWinery || !wineData.style || !wineData.abv) {
          setError('Please fill in all required fields');
          return;
        }

        const abvValue = parseFloat(wineData.abv);
        if (isNaN(abvValue) || abvValue < 0 || abvValue > 20) {
          setError('ABV must be a number between 0 and 20');
          return;
        }

        if (wineData.vintage) {
          const vintageValue = parseInt(wineData.vintage);
          if (isNaN(vintageValue) || vintageValue < 1800 || vintageValue > new Date().getFullYear() + 2) {
            setError('Vintage must be a valid year');
            return;
          }
        }

        const submitData = {
          name: wineData.name.trim(),
          winery: finalWinery,
          style: wineData.style,
          abv: abvValue,
          vintage: wineData.vintage ? parseInt(wineData.vintage) : undefined,
          region: wineData.region?.trim() || undefined,
          grapeVariety: wineData.grapeVariety,
          sweetness: wineData.sweetness || undefined,
          description: wineData.description?.trim() || ''
        };

        result = await api.wines.create(submitData);
        setSuccessMessage('Wine added successfully!');
        redirectPage = 'wines';
        if (refreshWines) await refreshWines();

      } else if (activeTab === 'spirit') {
        // Spirit validation and submission
        const finalDistillery = spiritData.distillery === 'Other' ? spiritData.customDistillery.trim() : spiritData.distillery;
        
        if (!spiritData.name?.trim() || !finalDistillery || !spiritData.style || !spiritData.abv) {
          setError('Please fill in all required fields');
          return;
        }

        const abvValue = parseFloat(spiritData.abv);
        if (isNaN(abvValue) || abvValue < 15 || abvValue > 80) {
          setError('ABV must be a number between 15 and 80 for spirits');
          return;
        }

        if (spiritData.age && (isNaN(parseFloat(spiritData.age)) || parseFloat(spiritData.age) < 0)) {
          setError('Age must be a positive number');
          return;
        }

        const submitData = {
          name: spiritData.name.trim(),
          distillery: finalDistillery,
          style: spiritData.style,
          abv: abvValue,
          age: spiritData.age ? parseFloat(spiritData.age) : undefined,
          category: spiritData.category?.trim() || undefined,
          region: spiritData.region?.trim() || undefined,
          description: spiritData.description?.trim() || ''
        };

        result = await api.spirits.create(submitData);
        setSuccessMessage('Spirit added successfully!');
        redirectPage = 'spirits';
        if (refreshSpirits) await refreshSpirits();
      }

      console.log('✅ Beverage created successfully:', result);
      setSuccess(true);
      
      // Reset forms
      setBeerData({
        name: '', brewery: '', customBrewery: '', style: '', abv: '', description: '', sessionable: false
      });
      setWineData({
        name: '', winery: '', customWinery: '', style: '', abv: '', vintage: '', region: '', grapeVariety: [], sweetness: '', description: ''
      });
      setSpiritData({
        name: '', distillery: '', customDistillery: '', style: '', abv: '', age: '', category: '', region: '', description: ''
      });

      // Auto-redirect after success
      setTimeout(() => {
        setSuccess(false);
        handleNavigation(redirectPage);
      }, 2000);

    } catch (error) {
      console.error('❌ Error adding beverage:', error);
      setError(error.message || 'Failed to add beverage. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Login required state
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-xl p-8 border-4 border-gray-200 text-center">
            <Beer className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">Login Required</h2>
            <p className="text-gray-600 mb-6 select-none">You need to be logged in to add beverages to our collection.</p>
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

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-xl p-8 border-4 border-green-200 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">{successMessage}</h2>
            <p className="text-gray-600 mb-4 select-none">Your beverage has been added to our collection.</p>
            <p className="text-sm text-gray-500 select-none">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  const getCurrentTabColor = () => {
    const tab = tabs.find(t => t.id === activeTab);
    return tab ? tab.color : 'gray';
  };

  const getColorClasses = (color, type = 'bg') => {
    const colors = {
      red: {
        bg: 'bg-red-600',
        hover: 'hover:bg-red-700',
        border: 'border-red-500',
        focus: 'focus:ring-red-500 focus:border-red-500',
        text: 'text-red-600'
      },
      purple: {
        bg: 'bg-purple-800',
        hover: 'hover:bg-purple-900',
        border: 'border-purple-700',
        focus: 'focus:ring-purple-700 focus:border-purple-700',
        text: 'text-purple-800'
      },
      amber: {
        bg: 'bg-amber-600',
        hover: 'hover:bg-amber-700',
        border: 'border-amber-500',
        focus: 'focus:ring-amber-500 focus:border-amber-500',
        text: 'text-amber-600'
      }
    };
    return colors[color]?.[type] || colors.red[type];
  };

  const getHeaderClasses = (color) => {
    const headerColors = {
      red: 'bg-gradient-to-r from-red-800 to-red-600',
      purple: 'bg-gradient-to-r from-purple-900 to-purple-700',
      amber: 'bg-gradient-to-r from-amber-700 to-amber-500'
    };
    return headerColors[color] || headerColors.red;
  };

  const currentColor = getCurrentTabColor();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className={`${getHeaderClasses(currentColor)} rounded-xl p-2 mb-8 text-center`}>
          <h2 className="text-3xl font-bold text-white mb-2 font-serif select-none">
            Add New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
          <p className="text-gray-100 select-none">Share your favorite {activeTab}s with our community</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-xl border-4 border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 transition-all duration-200 font-semibold ${
                    isActive 
                      ? `${getColorClasses(tab.color, 'bg')} text-white border-b-2 ${getColorClasses(tab.color, 'border')}`
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Beer Form */}
            {activeTab === 'beer' && (
              <BeerForm 
                beerData={beerData}
                handleBeerChange={handleBeerChange}
                handleProducerChange={handleProducerChange}
                existingBreweries={existingBreweries}
                beerStyles={beerStyles}
                currentColor={currentColor}
                getColorClasses={getColorClasses}
              />
            )}

            {/* Wine Form */}
            {activeTab === 'wine' && (
              <WineForm 
                wineData={wineData}
                handleWineChange={handleWineChange}
                handleProducerChange={handleProducerChange}
                handleGrapeVarietyChange={handleGrapeVarietyChange}
                existingWineries={existingWineries}
                wineStyles={wineStyles}
                sweetnessLevels={sweetnessLevels}
                grapeVarieties={grapeVarieties}
                currentColor={currentColor}
                getColorClasses={getColorClasses}
              />
            )}

            {/* Spirit Form */}
            {activeTab === 'spirit' && (
              <SpiritForm 
                spiritData={spiritData}
                handleSpiritChange={handleSpiritChange}
                handleProducerChange={handleProducerChange}
                existingDistilleries={existingDistilleries}
                spiritStyles={spiritStyles}
                currentColor={currentColor}
                getColorClasses={getColorClasses}
              />
            )}

            {/* Submit Button */}
            <div className="pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full ${getColorClasses(currentColor, 'bg')} ${getColorClasses(currentColor, 'hover')} text-white py-4 px-6 rounded-lg transition-all duration-300 font-bold text-lg shadow-xl disabled:opacity-50 transform hover:scale-105`}
              >
                {isSubmitting 
                  ? `Adding ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}...` 
                  : `Add ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} to Collection`
                }
              </button>
            </div>

            {/* Back Button */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => handleNavigation(activeTab + 's')}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Back to {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}s
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Beer Form Component
const BeerForm = ({ beerData, handleBeerChange, handleProducerChange, existingBreweries, beerStyles, currentColor, getColorClasses }) => (
  <div className="space-y-6">
    {/* Beer Name */}
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-2">Beer Name *</label>
      <input
        type="text"
        value={beerData.name}
        onChange={(e) => handleBeerChange('name', e.target.value)}
        className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
        placeholder="e.g., Hazy IPA, Imperial Stout"
        required
      />
    </div>

    {/* Brewery */}
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-2">
        Brewery * {existingBreweries.length > 0 && (
          <span className="text-xs text-gray-500">({existingBreweries.length} breweries available)</span>
        )}
      </label>
      <select
        value={beerData.brewery}
        onChange={(e) => handleProducerChange('beer', e.target.value)}
        className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
        required
      >
        <option value="">Select a brewery</option>
        {existingBreweries.map(brewery => (
          <option key={brewery} value={brewery}>{brewery}</option>
        ))}
        <option value="Other">+ Add New Brewery</option>
      </select>
      
      {beerData.brewery === 'Other' && (
        <div className="mt-2">
          <input
            type="text"
            value={beerData.customBrewery}
            onChange={(e) => handleBeerChange('customBrewery', e.target.value)}
            className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
            placeholder="Enter new brewery name"
            required
          />
        </div>
      )}
    </div>

    {/* Style and ABV */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">Beer Style *</label>
        <select
          value={beerData.style}
          onChange={(e) => handleBeerChange('style', e.target.value)}
          className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
          required
        >
          <option value="">Select a style</option>
          {beerStyles.map(style => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">ABV (%) *</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="20"
          value={beerData.abv}
          onChange={(e) => handleBeerChange('abv', e.target.value)}
          className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
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
          <p className="text-sm text-gray-600 mt-1">Perfect for drinking multiple over a session</p>
        </div>
        <button
          type="button"
          onClick={() => handleBeerChange('sessionable', !beerData.sessionable)}
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
    </div>

    {/* Description */}
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-2">Description</label>
      <textarea
        value={beerData.description}
        onChange={(e) => handleBeerChange('description', e.target.value)}
        rows="4"
        className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
        placeholder="Describe the beer's flavor profile, aroma, appearance..."
        maxLength="500"
      />
      <div className="text-right text-sm text-gray-500 mt-1">
        {beerData.description.length}/500 characters
      </div>
    </div>
  </div>
);

// Wine Form Component  
const WineForm = ({ wineData, handleWineChange, handleProducerChange, handleGrapeVarietyChange, existingWineries, wineStyles, sweetnessLevels, grapeVarieties, currentColor, getColorClasses }) => (
  <div className="space-y-6">
    {/* Wine Name */}
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-2">Wine Name *</label>
      <input
        type="text"
        value={wineData.name}
        onChange={(e) => handleWineChange('name', e.target.value)}
        className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
        placeholder="e.g., Cabernet Sauvignon Reserve, Pinot Grigio"
        required
      />
    </div>

    {/* Winery */}
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-2">
        Winery * {existingWineries.length > 0 && (
          <span className="text-xs text-gray-500">({existingWineries.length} wineries available)</span>
        )}
      </label>
      <select
        value={wineData.winery}
        onChange={(e) => handleProducerChange('wine', e.target.value)}
        className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
        required
      >
        <option value="">Select a winery</option>
        {existingWineries.map(winery => (
          <option key={winery} value={winery}>{winery}</option>
        ))}
        <option value="Other">+ Add New Winery</option>
      </select>
      
      {wineData.winery === 'Other' && (
        <div className="mt-2">
          <input
            type="text"
            value={wineData.customWinery}
            onChange={(e) => handleWineChange('customWinery', e.target.value)}
            className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
            placeholder="Enter new winery name"
            required
          />
        </div>
      )}
    </div>

    {/* Style, ABV, and Vintage */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">Wine Style *</label>
        <select
          value={wineData.style}
          onChange={(e) => handleWineChange('style', e.target.value)}
          className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
          required
        >
          <option value="">Select a style</option>
          {wineStyles.map(style => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">ABV (%) *</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="20"
          value={wineData.abv}
          onChange={(e) => handleWineChange('abv', e.target.value)}
          className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
          placeholder="e.g., 13.5"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">Vintage</label>
        <input
          type="number"
          min="1800"
          max={new Date().getFullYear() + 2}
          value={wineData.vintage}
          onChange={(e) => handleWineChange('vintage', e.target.value)}
          className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
          placeholder={`e.g., ${new Date().getFullYear() - 2}`}
        />
      </div>
    </div>

    {/* Region and Sweetness */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">Region</label>
        <input
          type="text"
          value={wineData.region}
          onChange={(e) => handleWineChange('region', e.target.value)}
          className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
          placeholder="e.g., Napa Valley, Bordeaux, Barossa Valley"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">Sweetness Level</label>
        <select
          value={wineData.sweetness}
          onChange={(e) => handleWineChange('sweetness', e.target.value)}
          className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
        >
          <option value="">Select sweetness</option>
          {sweetnessLevels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>
    </div>

    {/* Description */}
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-2">Description</label>
      <textarea
        value={wineData.description}
        onChange={(e) => handleWineChange('description', e.target.value)}
        rows="4"
        className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
        placeholder="Describe the wine's flavor profile, aroma, appearance..."
        maxLength="500"
      />
      <div className="text-right text-sm text-gray-500 mt-1">
        {wineData.description.length}/500 characters
      </div>
    </div>
  </div>
);

// Spirit Form Component
const SpiritForm = ({ spiritData, handleSpiritChange, handleProducerChange, existingDistilleries, spiritStyles, currentColor, getColorClasses }) => (
  <div className="space-y-6">
    {/* Spirit Name */}
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-2">Spirit Name *</label>
      <input
        type="text"
        value={spiritData.name}
        onChange={(e) => handleSpiritChange('name', e.target.value)}
        className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
        placeholder="e.g., Single Malt Whiskey, Añejo Tequila"
        required
      />
    </div>

    {/* Distillery */}
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-2">
        Distillery * {existingDistilleries.length > 0 && (
          <span className="text-xs text-gray-500">({existingDistilleries.length} distilleries available)</span>
        )}
      </label>
      <select
        value={spiritData.distillery}
        onChange={(e) => handleProducerChange('spirit', e.target.value)}
        className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
        required
      >
        <option value="">Select a distillery</option>
        {existingDistilleries.map(distillery => (
          <option key={distillery} value={distillery}>{distillery}</option>
        ))}
        <option value="Other">+ Add New Distillery</option>
      </select>
      
      {spiritData.distillery === 'Other' && (
        <div className="mt-2">
          <input
            type="text"
            value={spiritData.customDistillery}
            onChange={(e) => handleSpiritChange('customDistillery', e.target.value)}
            className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
            placeholder="Enter new distillery name"
            required
          />
        </div>
      )}
    </div>

    {/* Style, ABV, and Age */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">Spirit Style *</label>
        <select
          value={spiritData.style}
          onChange={(e) => handleSpiritChange('style', e.target.value)}
          className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
          required
        >
          <option value="">Select a style</option>
          {spiritStyles.map(style => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">ABV (%) *</label>
        <input
          type="number"
          step="0.1"
          min="15"
          max="80"
          value={spiritData.abv}
          onChange={(e) => handleSpiritChange('abv', e.target.value)}
          className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
          placeholder="e.g., 40.0"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">Age (Years)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={spiritData.age}
          onChange={(e) => handleSpiritChange('age', e.target.value)}
          className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
          placeholder="e.g., 12"
        />
      </div>
    </div>

    {/* Category and Region */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">Category</label>
        <input
          type="text"
          value={spiritData.category}
          onChange={(e) => handleSpiritChange('category', e.target.value)}
          className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
          placeholder="e.g., Single Malt, Bourbon, Añejo, VSOP"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">Region</label>
        <input
          type="text"
          value={spiritData.region}
          onChange={(e) => handleSpiritChange('region', e.target.value)}
          className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
          placeholder="e.g., Speyside, Kentucky, Jalisco"
        />
      </div>
    </div>

    {/* Description */}
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-2">Description</label>
      <textarea
        value={spiritData.description}
        onChange={(e) => handleSpiritChange('description', e.target.value)}
        rows="4"
        className={`w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 ${getColorClasses(currentColor, 'focus')}`}
        placeholder="Describe the spirit's flavor profile, nose, finish..."
        maxLength="500"
      />
      <div className="text-right text-sm text-gray-500 mt-1">
        {spiritData.description.length}/500 characters
      </div>
    </div>
  </div>
);

export default AddBeveragePage;