import React, { useState } from 'react';
import { Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

const ForgotPasswordPage = ({ handleNavigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [sentEmail, setSentEmail] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      if (!email.trim()) {
        setError('Please enter your email address');
        return;
      }

      // Simple email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Call forgot password API
      const response = await fetch(`${api.baseURL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      // Show success state
      setSentEmail(email.trim());
      setSuccess(true);
      
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success state after email sent
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 border-4 border-green-200 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 font-serif mb-4 select-none">Check Your Email</h2>
            
            <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800 select-none">Reset Link Sent</span>
              </div>
              <p className="text-sm text-green-700 select-none">
                If an account exists for:
              </p>
              <p className="font-medium text-green-800 select-none">{sentEmail}</p>
              <p className="text-sm text-green-700 mt-2 select-none">
                We've sent a password reset link to that email address.
              </p>
            </div>

            <div className="text-left space-y-2 mb-6">
              <h3 className="font-semibold text-gray-900 select-none">Next Steps:</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="select-none">1. 📧 Check your email inbox</p>
                <p className="select-none">2. 📁 Check your spam/junk folder</p>
                <p className="select-none">3. 🔗 Click the reset link (expires in 10 minutes)</p>
                <p className="select-none">4. 🔑 Enter your new password</p>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg mb-6 border border-yellow-200">
              <p className="text-xs text-yellow-700 select-none">
                <strong>Important:</strong> The reset link expires in 10 minutes for security.
                If you don't see the email, check your spam folder first.
              </p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => handleNavigation('login')}
                className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-300 font-semibold select-none"
              >
                Back to Login
              </button>
              <button 
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                  setError(null);
                }}
                className="w-full border-2 border-gray-300 text-gray-600 py-2 px-6 rounded-lg hover:bg-gray-50 transition-colors text-sm select-none"
              >
                ← Send Another Reset Link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main forgot password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 border-4 border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-gray-300">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-serif select-none">Forgot Password?</h2>
            <p className="text-gray-700 select-none">Enter your email to receive a reset link</p>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}
          
          {/* Forgot password form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                We'll send a password reset link to this email address.
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-4 px-6 rounded-full hover:from-red-700 hover:to-red-900 transition-all duration-300 font-bold text-lg shadow-xl border-2 border-gray-300 hover:border-white transform hover:scale-105 disabled:opacity-50 select-none"
            >
              {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
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

export default ForgotPasswordPage;