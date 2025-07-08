import React, { useState } from 'react';

const LoginPage = ({ handleNavigation, handleLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setFormLoading(true);
      setFormError(null);

      if (!formData.email || !formData.password) {
        setFormError('Please fill in all fields');
        return;
      }

      // Just call handleLogin with credentials - it will handle the API call
      await handleLogin(formData);
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      setFormError(error.message || 'Login failed. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
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
          
          {formError && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {formError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-4 px-6 rounded-full hover:from-red-700 hover:to-red-900 transition-all duration-300 font-bold text-lg shadow-xl border-2 border-gray-300 hover:border-white transform hover:scale-105 disabled:opacity-50"
            >
              {formLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-700">
              Don't have an account? 
              <button 
                onClick={() => handleNavigation('register')}
                className="text-red-600 hover:text-red-800 font-bold ml-1"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;