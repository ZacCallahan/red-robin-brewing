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
    
    // Add new beer
    create: async (beerData) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/beers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(beerData),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
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
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(beerData),
        });
        return await response.json();
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
        });
        return await response.json();
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
    
    // Add or update a review
    create: async (reviewData) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reviewData),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error creating review:', error);
        throw error;
      }
    }
  },

  // Auth endpoints (for later)
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
  }
};