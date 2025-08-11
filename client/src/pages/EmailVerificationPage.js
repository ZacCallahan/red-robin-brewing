import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Mail } from 'lucide-react';
import { api } from '../services/api';

const EmailVerificationPage = ({ handleNavigation }) => {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [hasVerified, setHasVerified] = useState(false);

  useEffect(() => {
    // Prevent double verification
    if (hasVerified) return;
    
    // Verify email using URL parameters
    const verifyEmail = async () => {
      setHasVerified(true);
      try {
        // Get token and email from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');

        console.log('🔍 Verification debug:', { token, email });
        console.log('🔍 Current URL:', window.location.href);

        if (!token || !email) {
          console.log('❌ Missing token or email');
          setStatus('error');
          setMessage('Invalid verification link - missing token or email');
          return;
        }

        // Call verification API
        const apiUrl = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? 'https://redrobinrating.com' : 'http://localhost:5000');
        const fullUrl = `${apiUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
        
        console.log('🔍 Making request to:', fullUrl);
        
        const response = await fetch(fullUrl);
        const data = await response.json();

        console.log('🔍 Response:', { status: response.status, data });

        if (response.ok) {
          console.log('✅ Verification successful');
          setStatus('success');
          setMessage(data.message);
        } else {
          console.log('❌ Verification failed');
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }

      } catch (error) {
        console.error('❌ Verification error:', error);
        setStatus('error');
        setMessage('Something went wrong during verification');
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-xl p-8 border-4 border-gray-200 text-center">
          
          {/* Loading state */}
          {status === 'loading' && (
            <>
              <Mail className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">Verifying Your Email...</h2>
              <p className="text-gray-600">Please wait while we verify your account.</p>
            </>
          )}

          {/* Success state */}
          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">Email Verified!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <button 
                onClick={() => handleNavigation('login')}
                className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-900 transition-colors font-semibold"
              >
                Login to Your Account
              </button>
            </>
          )}

          {/* Error state */}
          {status === 'error' && (
            <>
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">Verification Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <button 
                  onClick={() => handleNavigation('register')}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Create New Account
                </button>
                <button 
                  onClick={() => handleNavigation('login')}
                  className="w-full border-2 border-red-600 text-red-600 px-6 py-3 rounded-lg hover:bg-red-600 hover:text-white transition-colors font-semibold"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;