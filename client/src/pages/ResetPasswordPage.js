import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';

const ResetPasswordPage = ({ handleNavigation }) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [validToken, setValidToken] = useState(true);

  // Extract token and email from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const emailParam = urlParams.get('email');
    
    if (!tokenParam || !emailParam) {
      setValidToken(false);
      setError('Invalid reset link. Please request a new password reset.');
    } else {
      setToken(tokenParam);
      setEmail(decodeURIComponent(emailParam));
    }
  }, []);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      // Form validation
      if (!formData.newPassword || !formData.confirmPassword) {
        setError('Please fill in all fields');
        return;
      }

      if (formData.newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Call reset password API
      const response = await fetch(`${api.baseURL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      // Show success state
      setSuccess(true);
      
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success state after password reset
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 border-4 border-green-200 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 font-serif mb-4 select-none">Password Reset Successful!</h2>
            
            <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
              <p className="text-green-700 select-none">
                Your password has been successfully updated. You can now log in with your new password.
              </p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => handleNavigation('login')}
                className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-300 font-semibold select-none"
              >
                Continue to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!validToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 border-4 border-red-200 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 font-serif mb-4 select-none">Invalid Reset Link</h2>
            
            <div className="bg-red-50 p-4 rounded-lg mb-6 border border-red-200">
              <p className="text-red-700 select-none">
                This password reset link is invalid or has expired. Please request a new password reset.
              </p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => handleNavigation('forgot-password')}
                className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-300 font-semibold select-none"
              >
                Request New Reset Link
              </button>
              <button 
                onClick={() => handleNavigation('login')}
                className="w-full border-2 border-gray-300 text-gray-600 py-2 px-6 rounded-lg hover:bg-gray-50 transition-colors text-sm select-none"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main reset password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 border-4 border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-gray-300">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-serif select-none">Reset Password</h2>
            <p className="text-gray-700 select-none">Enter your new password below</p>
            {email && (
              <p className="text-sm text-gray-500 mt-2 select-none">
                Resetting password for: <span className="font-medium">{email}</span>
              </p>
            )}
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}
          
          {/* Reset password form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 6 characters long
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password strength indicator */}
            {formData.newPassword && (
              <div className="space-y-2">
                <div className="text-xs text-gray-600">Password strength:</div>
                <div className="flex gap-1">
                  <div className={`h-2 w-1/4 rounded ${formData.newPassword.length >= 6 ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                  <div className={`h-2 w-1/4 rounded ${formData.newPassword.length >= 8 ? 'bg-yellow-500' : 'bg-gray-200'}`}></div>
                  <div className={`h-2 w-1/4 rounded ${formData.newPassword.length >= 10 && /[A-Z]/.test(formData.newPassword) ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                  <div className={`h-2 w-1/4 rounded ${formData.newPassword.length >= 12 && /[A-Z]/.test(formData.newPassword) && /[0-9]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-4 px-6 rounded-full hover:from-red-700 hover:to-red-900 transition-all duration-300 font-bold text-lg shadow-xl border-2 border-gray-300 hover:border-white transform hover:scale-105 disabled:opacity-50 select-none"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
          
          {/* Back to login link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-700 select-none">
              Remember your password? 
              <button 
                onClick={() => handleNavigation('login')}
                className="text-red-600 hover:text-red-800 font-bold ml-1"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;