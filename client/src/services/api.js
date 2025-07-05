const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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

  // Auth endpoints (we'll implement these later)
  auth: {
    login: async (credentials) => {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return await response.json();
    },
    
    register: async (userData) => {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await response.json();
    }
  },

  // Beer endpoints (we'll implement these later)
  beers: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/api/beers`);
      return await response.json();
    },
    
    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/api/beers/${id}`);
      return await response.json();
    },
    
    create: async (beerData) => {
      const response = await fetch(`${API_BASE_URL}/api/beers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(beerData),
      });
      return await response.json();
    }
  },

  // Reviews endpoints (we'll implement these later)
  reviews: {
    create: async (reviewData) => {
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      return await response.json();
    }
  }
};