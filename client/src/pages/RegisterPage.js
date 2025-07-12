import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';

const RegisterPage = ({ handleNavigation, handleRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

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
      setFormLoading(true);
      setFormError(null);

      // Form validation
      if (!formData.username || !formData.email || !formData.password || !formData.firstName || !formData.lastName) {
        setFormError('Please fill in all fields');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        setFormError('Password must be at least 6 characters long');
        return;
      }

      // Create account using parent handler
      const { confirmPassword, ...registrationData } = formData;
      await handleRegister(registrationData);
      
      // Show success message
      setRegisteredEmail(formData.email);
      setRegistrationSuccess(true);
      
    } catch (error) {
      console.error('❌ Registration failed:', error);
      setFormError(error.message || 'Registration failed. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Success page after registration
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 border-4 border-green-200 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 font-serif mb-4 select-none">Account Created Successfully!</h2>
            
            <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800 select-none">Check Your Email</span>
              </div>
              <p className="text-sm text-green-700 select-none">
                We've sent a verification link to:
              </p>
              <p className="font-medium text-green-800 select-none">{registeredEmail}</p>
            </div>

            <div className="text-left space-y-2 mb-6">
              <h3 className="font-semibold text-gray-900 select-none">Next Steps:</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="select-none">1. 📧 Check your email inbox</p>
                <p className="select-none">2. 🔗 Click the verification link</p>
                <p className="select-none">3. 🍺 Start exploring craft beers!</p>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg mb-6 border border-yellow-200">
              <p className="text-xs text-yellow-700 select-none">
                <strong>Important:</strong> You must verify your email before you can log in.
                The verification link expires in 24 hours. Ensure to check your spam folder!
              </p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => handleNavigation('login')}
                className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-300 font-semibold select-none"
              >
                Go to Login Page
              </button>
              <button 
                onClick={() => setRegistrationSuccess(false)}
                className="w-full border-2 border-gray-300 text-gray-600 py-2 px-6 rounded-lg hover:bg-gray-50 transition-colors text-sm select-none"
              >
                ← Register Another Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Registration form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 border-4 border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-gray-300">
              <span className="text-white font-bold text-2xl select-none">RR</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 font-serif select-none">Join Red Robin</h2>
            <p className="text-gray-700 select-none">Create your beer reviewer account</p>
          </div>
          
          {/* Error message */}
          {formError && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {formError}
            </div>
          )}
          
          {/* Registration form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="beerexpert123"
                required
              />
            </div>
            
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

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-4 px-6 rounded-full hover:from-red-700 hover:to-red-900 transition-all duration-300 font-bold text-lg shadow-xl border-2 border-gray-300 hover:border-white transform hover:scale-105 disabled:opacity-50 select-none"
            >
              {formLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-700 select-none">
              Already have an account? 
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

export default RegisterPage;