const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Get authentication token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Get headers with authentication
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const api = {
  baseURL: API_BASE_URL,
  
  // Test API connection
  test: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/test`);
      return await response.json();
    } catch (error) {
      console.error('API connection error:', error);
      throw error;
    }
  },

  // Authentication endpoints
  auth: {
    // Register new user
    register: async (userData) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }
        
        // Return response without storing token for unverified accounts
        return data;
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },

    // Login user
    login: async (credentials) => {
      try {
        console.log('🌐 Sending login request with credentials:', credentials);
        
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });
        
        console.log('📡 Response status:', response.status, response.statusText);
        
        const data = await response.json();
        console.log('📦 Response data:', data);
        
        if (!response.ok) {
          console.error('❌ Response not OK:', data);
          throw new Error(data.message || 'Login failed');
        }
        
        // Store authentication data
        if (data.token) {
          console.log('💾 Storing token and user data');
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log('✅ Token and user stored successfully');
        }
        
        console.log('🎉 Login API call completed successfully');
        return data;
      } catch (error) {
        console.error('❌ Login error in API:', error);
        throw error;
      }
    },

    // Logout user
    logout: () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    },

    // Get current user from localStorage
    getCurrentUser: () => {
      try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
      } catch (error) {
        console.error('Error getting current user:', error);
        return null;
      }
    },

    // Check if user is authenticated
    isAuthenticated: () => {
      return !!getAuthToken();
    },

    // Get user profile from server
    getProfile: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
          throw new Error('Failed to get profile');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error getting profile:', error);
        throw error;
      }
    },

    // Request password reset
    forgotPassword: async (email) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to send reset email');
        }
        
        return data;
      } catch (error) {
        console.error('Error requesting password reset:', error);
        throw error;
      }
    },

    // Reset password with token
    resetPassword: async (token, email, newPassword) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, email, newPassword }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to reset password');
        }
        
        return data;
      } catch (error) {
        console.error('Error resetting password:', error);
        throw error;
      }
    }
  },

  // Beer management endpoints
  beers: {
    // Get all beers
    getAll: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/beers`);
        return await response.json();
      } catch (error) {
        console.error('Error fetching beers:', error);
        throw error;
      }
    },
    
    // Get single beer by ID
    getById: async (id) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/beers/${id}`);
        return await response.json();
      } catch (error) {
        console.error('Error fetching beer:', error);
        throw error;
      }
    },
    
    // Create new beer
    create: async (beerData) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/beers`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(beerData),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        
        return data;
      } catch (error) {
        console.error('Error creating beer:', error);
        throw error;
      }
    },
    
    // Update beer
    update: async (id, beerData) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/beers/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(beerData),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to update beer');
        }
        
        return data;
      } catch (error) {
        console.error('Error updating beer:', error);
        throw error;
      }
    },
    
    // Delete beer
    delete: async (id) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/beers/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to delete beer');
        }
        
        return data;
      } catch (error) {
        console.error('Error deleting beer:', error);
        throw error;
      }
    }
  },

  // Review management endpoints
  reviews: {
    // Get all reviews for a beer
    getByBeerId: async (beerId) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/reviews/beer/${beerId}`);
        return await response.json();
      } catch (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }
    },
    
    // Create new review
    create: async (reviewData) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/reviews`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(reviewData),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        
        return data;
      } catch (error) {
        console.error('Error creating review:', error);
        throw error;
      }
    }
  },
  
  // User management endpoints
  users: {
    // Get current user's beers
    getMyBeers: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/my-beers`, {
          headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
          throw new Error('Failed to get user beers');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching user beers:', error);
        throw error;
      }
    },

    // Get current user's reviews
    getMyReviews: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/my-reviews`, {
          headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
          throw new Error('Failed to get user reviews');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching user reviews:', error);
        throw error;
      }
    },

    // Get reviews for any user by ID
    getUserReviews: async (userId) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/users/${userId}/reviews`, {
          headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
          throw new Error('Failed to get user reviews');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching user reviews:', error);
        throw error;
      }
    },
    
    // Search users by query
    search: async (query) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/users/search?q=${encodeURIComponent(query)}`, {
          headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
          throw new Error('Failed to search users');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error searching users:', error);
        throw error;
      }
    }
  },

  // Admin management endpoints
  admin: {
    // Get dashboard statistics
    getStats: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
          headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
          throw new Error('Failed to get admin stats');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error getting admin stats:', error);
        throw error;
      }
    },

    // Get all users
    getAllUsers: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
          throw new Error('Failed to get users');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error getting users:', error);
        throw error;
      }
    },

    // Get all beers
    getAllBeers: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/beers`, {
          headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
          throw new Error('Failed to get beers');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error getting beers:', error);
        throw error;
      }
    },

    // Get all reviews
    getAllReviews: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/reviews`, {
          headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
          throw new Error('Failed to get reviews');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error getting reviews:', error);
        throw error;
      }
    },

    // Delete user
    deleteUser: async (userId) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete user');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
    },

    // Delete beer
    deleteBeer: async (beerId) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/beers/${beerId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete beer');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error deleting beer:', error);
        throw error;
      }
    },

    // Delete review
    deleteReview: async (reviewId) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/reviews/${reviewId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete review');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error deleting review:', error);
        throw error;
      }
    },

    // Update user
    updateUser: async (userId, userData) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(userData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update user');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error updating user:', error);
        throw error;
      }
    },

    // Update beer
    updateBeer: async (beerId, beerData) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/beers/${beerId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(beerData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update beer');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error updating beer:', error);
        throw error;
      }
    },

    // Populate database with curated beers
    populateDatabase: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/populate`, {
          method: 'POST',
          headers: getAuthHeaders(),
        });
        
        if (!response.ok) {
          throw new Error('Failed to populate database');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error populating database:', error);
        throw error;
      }
    }
  }
};