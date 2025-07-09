import React, { useState, useEffect } from 'react';
import { Users, Beer, MessageSquare, Database, Trash2, Edit, Plus, AlertTriangle, Check, X, Clock } from 'lucide-react';
import { api } from '../services/api';

const AdminDashboard = ({ user, isLoggedIn, handleNavigation }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBeers: 0,
    totalReviews: 0,
    recentUsers: []
  });
  const [users, setUsers] = useState([]);
  const [beers, setBeers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Batch selection states
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedBeers, setSelectedBeers] = useState([]);
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [batchDeleting, setBatchDeleting] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      loadDashboardData();
    }
  }, [isLoggedIn, isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all admin data
      const [statsData, usersData, beersData, reviewsData] = await Promise.all([
        api.admin.getStats(),
        api.admin.getAllUsers(),
        api.admin.getAllBeers(),
        api.admin.getAllReviews()
      ]);

      setStats(statsData);
      setUsers(usersData);
      setBeers(beersData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone and will delete all their reviews and beers.')) {
      return;
    }

    try {
      await api.admin.deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
      // Refresh data to update stats
      await loadDashboardData();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    }
  };

  const handleDeleteBeer = async (beerId) => {
    if (!window.confirm('Are you sure you want to delete this beer? This will also delete all associated reviews.')) {
      return;
    }

    try {
      await api.admin.deleteBeer(beerId);
      setBeers(beers.filter(b => b._id !== beerId));
      // Refresh data to update stats and remove associated reviews
      await loadDashboardData();
    } catch (error) {
      console.error('Error deleting beer:', error);
      setError('Failed to delete beer');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await api.admin.deleteReview(reviewId);
      setReviews(reviews.filter(r => r._id !== reviewId));
      // Refresh data to update stats
      await loadDashboardData();
    } catch (error) {
      console.error('Error deleting review:', error);
      setError('Failed to delete review');
    }
  };

  // Simple sessionable toggle - just flip the boolean
  const handleToggleSessionable = async (beerId, currentSessionable) => {
    try {
      const newSessionable = !currentSessionable;
      await api.admin.updateBeer(beerId, { sessionable: newSessionable });
      
      // Update the local state immediately
      setBeers(beers.map(beer => 
        beer._id === beerId ? { ...beer, sessionable: newSessionable } : beer
      ));
    } catch (error) {
      console.error('Error updating sessionable status:', error);
      setError('Failed to update sessionable status');
    }
  };

  // Batch operations
  const handleBatchDeleteUsers = async () => {
    if (selectedUsers.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} users? This will also delete all their reviews and beers.`)) {
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

  const handleSelectReview = (reviewId) => {
    setSelectedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

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

  const handleSelectAllReviews = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map(r => r._id));
    }
  };

  // Redirect if not admin
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin dashboard.</p>
          <button 
            onClick={() => handleNavigation('home')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Database className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-8 border-4 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-serif">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handlePopulateDatabase}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Database className="w-4 h-4" />
                {loading ? 'Importing Beers...' : 'Import Curated Beers'}
              </button>
              <button
                onClick={() => handleNavigation('home')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Site
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
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
              { id: 'reviews', label: 'Reviews', icon: MessageSquare }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-red-600 border-b-2 border-red-600'
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-8 h-8 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Beer className="w-8 h-8 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Total Beers</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{stats.totalBeers}</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <MessageSquare className="w-8 h-8 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Total Reviews</h3>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalReviews}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
                  <div className="space-y-2">
                    {stats.recentUsers?.slice(0, 5).map(user => (
                      <div key={user._id} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div>
                          <span className="font-medium">{user.firstName} {user.lastName}</span>
                          <span className="text-gray-500 ml-2">@{user.username}</span>
                        </div>
                        <span className="text-sm text-gray-500">
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
                  <h3 className="text-lg font-semibold text-gray-900">Manage Users ({users.length})</h3>
                  <div className="flex items-center gap-2">
                    {selectedUsers.length > 0 && (
                      <button
                        onClick={handleBatchDeleteUsers}
                        disabled={batchDeleting}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected ({selectedUsers.length})
                      </button>
                    )}
                    <button
                      onClick={handleSelectAllUsers}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
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
                        <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Username</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Email</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Reviews</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Joined</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
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
                          <td className="border border-gray-200 px-4 py-2">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="border border-gray-200 px-4 py-2">@{user.username}</td>
                          <td className="border border-gray-200 px-4 py-2">{user.email}</td>
                          <td className="border border-gray-200 px-4 py-2">{user.totalReviews || 0}</td>
                          <td className="border border-gray-200 px-4 py-2">
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
                  <h3 className="text-lg font-semibold text-gray-900">Manage Beers ({beers.length})</h3>
                  <div className="flex items-center gap-2">
                    {selectedBeers.length > 0 && (
                      <button
                        onClick={handleBatchDeleteBeers}
                        disabled={batchDeleting}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected ({selectedBeers.length})
                      </button>
                    )}
                    <button
                      onClick={handleSelectAllBeers}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
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
                        <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Brewery</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Style</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">ABV</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Sessionable</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Reviews</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Rating</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
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
                          <td className="border border-gray-200 px-4 py-2 font-medium">{beer.name}</td>
                          <td className="border border-gray-200 px-4 py-2">{beer.brewery}</td>
                          <td className="border border-gray-200 px-4 py-2">{beer.style}</td>
                          <td className="border border-gray-200 px-4 py-2">{beer.abv}%</td>
                          <td className="border border-gray-200 px-4 py-2">
                            <button
                              onClick={() => handleToggleSessionable(beer._id, beer.sessionable)}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
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
                          <td className="border border-gray-200 px-4 py-2">{beer.totalReviews || 0}</td>
                          <td className="border border-gray-200 px-4 py-2">
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

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Manage Reviews ({reviews.length})</h3>
                  <div className="flex items-center gap-2">
                    {selectedReviews.length > 0 && (
                      <button
                        onClick={handleBatchDeleteReviews}
                        disabled={batchDeleting}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected ({selectedReviews.length})
                      </button>
                    )}
                    <button
                      onClick={handleSelectAllReviews}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
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
                          <span className="font-medium">{review.username}</span>
                          <span className="text-sm text-gray-500">
                            reviewed {review.beer?.name || 'Unknown Beer'}
                          </span>
                          <div className="flex items-center gap-1">
                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                            <span className="text-sm text-gray-500">({review.rating}/5)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
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
                        <p className="text-gray-700 text-sm italic ml-7">"{review.notes}"</p>
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