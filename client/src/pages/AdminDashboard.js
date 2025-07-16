import React, { useState, useEffect } from 'react';
import { Users, Beer, Wine, Martini, MessageSquare, Database, Trash2, Edit, Plus, AlertTriangle, Check, X, Clock } from 'lucide-react';
import { api } from '../services/api';

const AdminDashboard = ({ user, isLoggedIn, handleNavigation, reloadBeers, reloadWines, reloadSpirits }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBeers: 0,
    totalWines: 0,
    totalSpirits: 0,
    totalReviews: 0,
    recentUsers: []
  });
  const [users, setUsers] = useState([]);
  const [beers, setBeers] = useState([]);
  const [wines, setWines] = useState([]);
  const [spirits, setSpirits] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Batch selection states
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedBeers, setSelectedBeers] = useState([]);
  const [selectedWines, setSelectedWines] = useState([]);
  const [selectedSpirits, setSelectedSpirits] = useState([]);
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [batchDeleting, setBatchDeleting] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      loadDashboardData();
    }
  }, [isLoggedIn, isAdmin]);

  // Load all admin dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all admin data
      const [statsData, usersData, beersData, winesData, spiritsData, reviewsData] = await Promise.all([
        api.admin.getStats(),
        api.admin.getAllUsers(),
        api.admin.getAllBeers(),
        api.admin.getAllWines(),
        api.admin.getAllSpirits(),
        api.admin.getAllReviews()
      ]);

      setStats(statsData);
      setUsers(usersData);
      setBeers(beersData);
      setWines(winesData);
      setSpirits(spiritsData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  // Delete individual user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone and will delete all their reviews and beverages.')) {
      return;
    }

    try {
      await api.admin.deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
      await loadDashboardData();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    }
  };

  // Delete individual beer
  const handleDeleteBeer = async (beerId) => {
    if (!window.confirm('Are you sure you want to delete this beer? This will also delete all associated reviews.')) {
      return;
    }

    try {
      await api.admin.deleteBeer(beerId);
      setBeers(beers.filter(b => b._id !== beerId));
      await loadDashboardData();
    } catch (error) {
      console.error('Error deleting beer:', error);
      setError('Failed to delete beer');
    }
  };

  // Delete individual wine
  const handleDeleteWine = async (wineId) => {
    if (!window.confirm('Are you sure you want to delete this wine? This will also delete all associated reviews.')) {
      return;
    }

    try {
      await api.admin.deleteWine(wineId);
      setWines(wines.filter(w => w._id !== wineId));
      await loadDashboardData();
    } catch (error) {
      console.error('Error deleting wine:', error);
      setError('Failed to delete wine');
    }
  };

  // Delete individual spirit
  const handleDeleteSpirit = async (spiritId) => {
    if (!window.confirm('Are you sure you want to delete this spirit? This will also delete all associated reviews.')) {
      return;
    }

    try {
      await api.admin.deleteSpirit(spiritId);
      setSpirits(spirits.filter(s => s._id !== spiritId));
      await loadDashboardData();
    } catch (error) {
      console.error('Error deleting spirit:', error);
      setError('Failed to delete spirit');
    }
  };

  // Delete individual review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await api.admin.deleteReview(reviewId);
      setReviews(reviews.filter(r => r._id !== reviewId));
      await loadDashboardData();
    } catch (error) {
      console.error('Error deleting review:', error);
      setError('Failed to delete review');
    }
  };

  // Toggle beer sessionable status
  const handleToggleSessionable = async (beerId, currentSessionable) => {
    try {
      const newSessionable = !currentSessionable;
      await api.admin.updateBeer(beerId, { sessionable: newSessionable });
      
      // Update the local state immediately
      setBeers(beers.map(beer => 
        beer._id === beerId ? { ...beer, sessionable: newSessionable } : beer
      ));
      
      await loadDashboardData();
      
      // Reload beers on main pages
      if (reloadBeers) {
        await reloadBeers();
      }
      
    } catch (error) {
      console.error('Error updating sessionable status:', error);
      setError('Failed to update sessionable status');
    }
  };

  // Batch delete functions
  const handleBatchDeleteUsers = async () => {
    if (selectedUsers.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} users? This will also delete all their reviews and beverages.`)) {
      return;
    }

    try {
      setBatchDeleting(true);
      await Promise.all(selectedUsers.map(userId => api.admin.deleteUser(userId)));
      setSelectedUsers([]);
      await loadDashboardData();
    } catch (error) {
      console.error('Error batch deleting users:', error);
      setError('Failed to batch delete users');
    } finally {
      setBatchDeleting(false);
    }
  };

  const handleBatchDeleteBeers = async () => {
    if (selectedBeers.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedBeers.length} beers? This will also delete all associated reviews.`)) {
      return;
    }

    try {
      setBatchDeleting(true);
      await Promise.all(selectedBeers.map(beerId => api.admin.deleteBeer(beerId)));
      setSelectedBeers([]);
      await loadDashboardData();
    } catch (error) {
      console.error('Error batch deleting beers:', error);
      setError('Failed to batch delete beers');
    } finally {
      setBatchDeleting(false);
    }
  };

  const handleBatchDeleteWines = async () => {
    if (selectedWines.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedWines.length} wines? This will also delete all associated reviews.`)) {
      return;
    }

    try {
      setBatchDeleting(true);
      await Promise.all(selectedWines.map(wineId => api.admin.deleteWine(wineId)));
      setSelectedWines([]);
      await loadDashboardData();
    } catch (error) {
      console.error('Error batch deleting wines:', error);
      setError('Failed to batch delete wines');
    } finally {
      setBatchDeleting(false);
    }
  };

  const handleBatchDeleteSpirits = async () => {
    if (selectedSpirits.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedSpirits.length} spirits? This will also delete all associated reviews.`)) {
      return;
    }

    try {
      setBatchDeleting(true);
      await Promise.all(selectedSpirits.map(spiritId => api.admin.deleteSpirit(spiritId)));
      setSelectedSpirits([]);
      await loadDashboardData();
    } catch (error) {
      console.error('Error batch deleting spirits:', error);
      setError('Failed to batch delete spirits');
    } finally {
      setBatchDeleting(false);
    }
  };

  const handleBatchDeleteReviews = async () => {
    if (selectedReviews.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedReviews.length} reviews?`)) {
      return;
    }

    try {
      setBatchDeleting(true);
      await Promise.all(selectedReviews.map(reviewId => api.admin.deleteReview(reviewId)));
      setSelectedReviews([]);
      await loadDashboardData();
    } catch (error) {
      console.error('Error batch deleting reviews:', error);
      setError('Failed to batch delete reviews');
    } finally {
      setBatchDeleting(false);
    }
  };

  // Import curated beer collection
  const handlePopulateDatabase = async () => {
    if (!window.confirm('This will import 50 curated popular beers (Australian and international favorites). This should only be done once or after purging the database. Continue?')) {
      return;
    }

    try {
      setLoading(true);
      const result = await api.admin.populateDatabase();
      
      let message = `🍺 Beer Import Complete!\n\n`;
      message += `Source: ${result.source}\n`;
      message += `Total processed: ${result.processed} beers\n`;
      message += `Successfully imported: ${result.inserted} new beers\n`;
      
      if (result.exactDuplicates > 0) {
        message += `Skipped exact duplicates: ${result.exactDuplicates}\n`;
      }
      
      if (result.similarDuplicates > 0) {
        message += `Skipped similar beers: ${result.similarDuplicates}\n`;
      }
      
      if (result.errors > 0) {
        message += `Import errors: ${result.errors}\n`;
      }
      
      if (result.inserted === 0) {
        message += `\nAll beers already exist in the database!`;
      } else if (result.sampleBeers?.length > 0) {
        message += `\nSample imported beers:\n`;
        result.sampleBeers.forEach(beer => {
          message += `• ${beer.name} (${beer.brewery}, ${beer.abv}% ABV)\n`;
        });
      }
      
      alert(message);
      loadDashboardData();
    } catch (error) {
      console.error('Error importing beers:', error);
      setError('Failed to import curated beer collection: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Selection handlers
  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectBeer = (beerId) => {
    setSelectedBeers(prev => 
      prev.includes(beerId) 
        ? prev.filter(id => id !== beerId)
        : [...prev, beerId]
    );
  };

  const handleSelectWine = (wineId) => {
    setSelectedWines(prev => 
      prev.includes(wineId) 
        ? prev.filter(id => id !== wineId)
        : [...prev, wineId]
    );
  };

  const handleSelectSpirit = (spiritId) => {
    setSelectedSpirits(prev => 
      prev.includes(spiritId) 
        ? prev.filter(id => id !== spiritId)
        : [...prev, spiritId]
    );
  };

  const handleSelectReview = (reviewId) => {
    setSelectedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  // Select all handlers
  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u._id));
    }
  };

  const handleSelectAllBeers = () => {
    if (selectedBeers.length === beers.length) {
      setSelectedBeers([]);
    } else {
      setSelectedBeers(beers.map(b => b._id));
    }
  };

  const handleSelectAllWines = () => {
    if (selectedWines.length === wines.length) {
      setSelectedWines([]);
    } else {
      setSelectedWines(wines.map(w => w._id));
    }
  };

  const handleSelectAllSpirits = () => {
    if (selectedSpirits.length === spirits.length) {
      setSelectedSpirits([]);
    } else {
      setSelectedSpirits(spirits.map(s => s._id));
    }
  };

  const handleSelectAllReviews = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map(r => r._id));
    }
  };

  // Get beverage name for review display
  const getBeverageName = (review) => {
    if (review.beer) return review.beer.name;
    if (review.wine) return review.wine.name;
    if (review.spirit) return review.spirit.name;
    return 'Unknown Beverage';
  };

  // Get beverage type for review display
  const getBeverageType = (review) => {
    if (review.beer) return 'beer';
    if (review.wine) return 'wine';
    if (review.spirit) return 'spirit';
    return 'beverage';
  };

  // Not logged in state
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 select-none">Please log in</h2>
          <button 
            onClick={() => handleNavigation('login')}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors select-none"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Access denied state
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4 select-none">Access Denied</h2>
          <p className="text-gray-600 mb-6 select-none">You don't have permission to access the admin dashboard.</p>
          <button 
            onClick={() => handleNavigation('home')}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors select-none"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Database className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 select-none">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-8 border-4 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-serif select-none">Admin Dashboard</h1>
              <p className="text-gray-600 select-none">Welcome back, {user?.firstName}!</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handlePopulateDatabase}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 select-none"
              >
                <Database className="w-4 h-4" />
                {loading ? 'Importing Beers...' : 'Import Curated Beers'}
              </button>
              <button
                onClick={() => handleNavigation('home')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors select-none"
              >
                Back to Site
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg select-none">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-xl mb-8 border-4 border-gray-200">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: Database },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'beers', label: 'Beers', icon: Beer },
              { id: 'wines', label: 'Wines', icon: Wine },
              { id: 'spirits', label: 'Spirits', icon: Martini },
              { id: 'reviews', label: 'Reviews', icon: MessageSquare }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors select-none ${
                  activeTab === tab.id
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-8 h-8 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900 select-none">Users</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-600 select-none">{users.length}</p>
                  </div>
                  <div className="bg-red-50 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Beer className="w-8 h-8 text-red-600" />
                      <h3 className="text-lg font-semibold text-gray-900 select-none">Beers</h3>
                    </div>
                    <p className="text-3xl font-bold text-red-600 select-none">{beers.length}</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Wine className="w-8 h-8 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900 select-none">Wines</h3>
                    </div>
                    <p className="text-3xl font-bold text-purple-600 select-none">{wines.length}</p>
                  </div>
                  <div className="bg-amber-50 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Martini className="w-8 h-8 text-amber-600" />
                      <h3 className="text-lg font-semibold text-gray-900 select-none">Spirits</h3>
                    </div>
                    <p className="text-3xl font-bold text-amber-600 select-none">{spirits.length}</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <MessageSquare className="w-8 h-8 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900 select-none">Reviews</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-600 select-none">{reviews.length}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 select-none">Recent Users</h3>
                  <div className="space-y-2">
                    {stats.recentUsers?.slice(0, 5).map(user => (
                      <div key={user._id} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <span className="font-medium select-none">{user.firstName} {user.lastName}</span>
                          <span className="text-gray-500 ml-2 select-none">@{user.username}</span>
                        </div>
                        <span className="text-sm text-gray-500 select-none">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 select-none">Manage Users ({users.length})</h3>
                  <div className="flex items-center gap-2">
                    {selectedUsers.length > 0 && (
                      <button
                        onClick={handleBatchDeleteUsers}
                        disabled={batchDeleting}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 select-none"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected ({selectedUsers.length})
                      </button>
                    )}
                    <button
                      onClick={handleSelectAllUsers}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors select-none"
                    >
                      {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === users.length}
                            onChange={handleSelectAllUsers}
                            className="rounded"
                          />
                        </th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Name</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Username</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Email</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Reviews</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Joined</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user._id)}
                              onChange={() => handleSelectUser(user._id)}
                              className="rounded"
                            />
                          </td>
                          <td className="border border-gray-200 px-4 py-2 select-none">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 select-none">@{user.username}</td>
                          <td className="border border-gray-200 px-4 py-2 select-none">{user.email}</td>
                          <td className="border border-gray-200 px-4 py-2 select-none">{user.totalReviews || 0}</td>
                          <td className="border border-gray-200 px-4 py-2 select-none">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

              {/* Beers Tab */}
            {activeTab === 'beers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 select-none">Manage Beers ({beers.length})</h3>
                  <div className="flex items-center gap-2">
                    {selectedBeers.length > 0 && (
                      <button
                        onClick={handleBatchDeleteBeers}
                        disabled={batchDeleting}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 select-none"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected ({selectedBeers.length})
                      </button>
                    )}
                    <button
                      onClick={handleSelectAllBeers}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors select-none"
                    >
                      {selectedBeers.length === beers.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">
                          <input
                            type="checkbox"
                            checked={selectedBeers.length === beers.length}
                            onChange={handleSelectAllBeers}
                            className="rounded"
                          />
                        </th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Name</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Brewery</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Style</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">ABV</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Sessionable</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Reviews</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Rating</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {beers.map(beer => (
                        <tr key={beer._id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2">
                            <input
                              type="checkbox"
                              checked={selectedBeers.includes(beer._id)}
                              onChange={() => handleSelectBeer(beer._id)}
                              className="rounded"
                            />
                          </td>
                          <td className="border border-gray-200 px-4 py-2 font-medium select-none">{beer.name}</td>
                          <td className="border border-gray-200 px-4 py-2 select-none">{beer.brewery}</td>
                          <td className="border border-gray-200 px-4 py-2 select-none">{beer.style}</td>
                          <td className="border border-gray-200 px-4 py-2 select-none">{beer.abv}%</td>
                          <td className="border border-gray-200 px-4 py-2">
                            <button
                              onClick={() => handleToggleSessionable(beer._id, beer.sessionable)}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors select-none ${
                                beer.sessionable
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                              title="Click to toggle sessionable status"
                            >
                              <Clock className="w-3 h-3" />
                              {beer.sessionable ? 'Yes' : 'No'}
                            </button>
                          </td>
                          <td className="border border-gray-200 px-4 py-2 select-none">{beer.totalReviews || 0}</td>
                          <td className="border border-gray-200 px-4 py-2 select-none">
                            {beer.averageRating ? beer.averageRating.toFixed(1) : 'N/A'}
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            <button
                              onClick={() => handleDeleteBeer(beer._id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Delete Beer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* Wines Tab */}
            {activeTab === 'wines' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 select-none">Manage Wines ({wines.length})</h3>
                  <div className="flex items-center gap-2">
                    {selectedWines.length > 0 && (
                      <button
                        onClick={handleBatchDeleteWines}
                        disabled={batchDeleting}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 select-none"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected ({selectedWines.length})
                      </button>
                    )}
                    <button
                      onClick={handleSelectAllWines}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors select-none"
                    >
                      {selectedWines.length === wines.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">
                          <input
                            type="checkbox"
                            checked={selectedWines.length === wines.length}
                            onChange={handleSelectAllWines}
                            className="rounded"
                          />
                        </th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Name</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Winery</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Style</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">ABV</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Vintage</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Reviews</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Rating</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wines.map(wine => (
                        <tr key={wine._id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2">
                            <input
                              type="checkbox"
                              checked={selectedWines.includes(wine._id)}
                              onChange={() => handleSelectWine(wine._id)}
                              className="rounded"
                            />
                          </td>
                          <td className="border border-gray-200 px-4 py-2 font-medium select-none">{wine.name}</td>
                          <td className="border border-gray-200 px-4 py-2 select-none">{wine.winery}</td>
                          <td className="border border-gray-200 px-4 py-2 select-none">{wine.style}</td>
                          <td className="border border-gray-200 px-4 py-2 select-none">{wine.abv}%</td>
                          <td className="border border-gray-200 px-4 py-2 select-none">{wine.vintage || 'N/A'}</td>
                          <td className="border border-gray-200 px-4 py-2 select-none">{wine.totalReviews || 0}</td>
                          <td className="border border-gray-200 px-4 py-2 select-none">
                            {wine.averageRating ? wine.averageRating.toFixed(1) : 'N/A'}
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            <button
                              onClick={() => handleDeleteWine(wine._id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Delete Wine"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Spirits Tab */}
            {activeTab === 'spirits' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 select-none">Manage Spirits ({spirits.length})</h3>
                  <div className="flex items-center gap-2">
                    {selectedSpirits.length > 0 && (
                      <button
                        onClick={handleBatchDeleteSpirits}
                        disabled={batchDeleting}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 select-none"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected ({selectedSpirits.length})
                      </button>
                    )}
                    <button
                      onClick={handleSelectAllSpirits}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors select-none"
                    >
                      {selectedSpirits.length === spirits.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">
                          <input
                            type="checkbox"
                            checked={selectedSpirits.length === spirits.length}
                            onChange={handleSelectAllSpirits}
                            className="rounded"
                          />
                        </th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Name</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Distillery</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Style</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">ABV</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Age</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Reviews</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Rating</th>
                        <th className="border border-gray-200 px-4 py-2 text-left select-none">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spirits.map(spirit => (
                        <tr key={spirit._id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2">
                            <input
                              type="checkbox"
                              checked={selectedSpirits.includes(spirit._id)}
                              onChange={() => handleSelectSpirit(spirit._id)}
                              className="rounded"
                            />
                          </td>
                          <td className="border border-gray-200 px-4 py-2 font-medium select-none">{spirit.name}</td>
                          <td className="border border-gray-200 px-4 py-2 select-none">{spirit.distillery}</td>
                          <td className="border border-gray-200 px-4 py-2 select-none">{spirit.style}</td>
                          <td className="border border-gray-200 px-4 py-2 select-none">{spirit.abv}%</td>
                          <td className="border border-gray-200 px-4 py-2 select-none">{spirit.age ? `${spirit.age}Y` : 'N/A'}</td>
                          <td className="border border-gray-200 px-4 py-2 select-none">{spirit.totalReviews || 0}</td>
                          <td className="border border-gray-200 px-4 py-2 select-none">
                            {spirit.averageRating ? spirit.averageRating.toFixed(1) : 'N/A'}
                          </td>
                          <td className="border border-gray-200 px-4 py-2">
                            <button
                              onClick={() => handleDeleteSpirit(spirit._id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Delete Spirit"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 select-none">Manage Reviews ({reviews.length})</h3>
                  <div className="flex items-center gap-2">
                    {selectedReviews.length > 0 && (
                      <button
                        onClick={handleBatchDeleteReviews}
                        disabled={batchDeleting}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 select-none"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected ({selectedReviews.length})
                      </button>
                    )}
                    <button
                      onClick={handleSelectAllReviews}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors select-none"
                    >
                      {selectedReviews.length === reviews.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedReviews.includes(review._id)}
                            onChange={() => handleSelectReview(review._id)}
                            className="rounded"
                          />
                          <span className="font-medium select-none">{review.username}</span>
                          <span className="text-sm text-gray-500 select-none">
                            reviewed {getBeverageName(review)} ({getBeverageType(review)})
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="select-none">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                            <span className="text-sm text-gray-500 select-none">({review.rating}/5)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 select-none">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete Review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {review.notes && (
                        <p className="text-gray-700 text-sm italic ml-7 select-none">"{review.notes}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
