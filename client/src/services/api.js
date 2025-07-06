const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const api = {
  // Test connection
  test: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/test`);
      return await response.json();
    } catch (error) {
      console.error('API connection error:', error);
      throw error;
    }
  },

  // Auth endpoints
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
        
        // Store token in localStorage
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        return data;
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },

    // Login user
    login: async (credentials) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }
        
        // Store token in localStorage
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        return data;
      } catch (error) {
        console.error('Login error:', error);
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
    }
  },

  // Beer endpoints
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
    
    // Get single beer
    getById: async (id) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/beers/${id}`);
        return await response.json();
      } catch (error) {
        console.error('Error fetching beer:', error);
        throw error;
      }
    },
    
    // Add new beer (requires authentication)
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

  // Reviews endpoints
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
    
    // Add or update a review (requires authentication)
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

  // User endpoints
  users: {
    // Get user's own beers
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

    // Get user's own reviews
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

    // Search users
    search: async (query) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
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
  }
};