import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import BeersPage from './pages/BeersPage';
import FriendsPage from './pages/FriendsPage';
import AddBeerPage from './pages/AddBeerPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BeerDetailPage from './pages/BeerDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import ProfilePage from './pages/ProfilePage';

const BeerReviewApp = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [beers, setBeers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBeer, setSelectedBeer] = useState(null);
  const [beerReviews, setBeerReviews] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Check authentication on app start
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = api.auth.isAuthenticated();
      const currentUser = api.auth.getCurrentUser();
      
      setIsLoggedIn(isAuth);
      setUser(currentUser);
    };
    
    checkAuth();
    loadData();
  }, []);

  // Load data on app start
  const loadData = async () => {
    try {
      setLoading(true);
      const result = await api.test();
      console.log('✅ Backend connected:', result);
      
      const beersData = await api.beers.getAll();
      console.log('✅ Beers loaded:', beersData);
      
      if (Array.isArray(beersData)) {
        setBeers(beersData);
      } else {
        console.error('❌ Expected array, got:', beersData);
        setBeers([]);
        setError('Failed to load beers - invalid data format');
      }
      
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      setError('Failed to connect to server');
      setBeers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle login success
  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUser(userData.user);
    setCurrentPage('home');
  };

  // Handle logout
  const handleLogout = () => {
    api.auth.logout();
    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage('home');
  };

  // Function to refresh beers list
  const refreshBeers = async () => {
    try {
      const beersData = await api.beers.getAll();
      setBeers(beersData);
    } catch (error) {
      console.error('Error refreshing beers:', error);
    }
  };

  // Handle navigation - clear selected beer when navigating away from beer detail
  const handleNavigation = (page) => {
    setCurrentPage(page);
    if (page !== 'beer-detail') {
      setSelectedBeer(null);
      setBeerReviews([]);
    }
    if (page !== 'user-profile') {
      setSelectedUser(null);
    }
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setCurrentPage('user-profile');
  };

  // Handle beer selection and load reviews immediately
  const handleBeerSelect = (beer) => {
    setSelectedBeer(beer);
    setCurrentPage('beer-detail');
    // Load reviews immediately when beer is selected
    loadBeerReviews(beer._id);
  };

  // Function to load reviews for a specific beer
  const loadBeerReviews = async (beerId) => {
    try {
      console.log('Loading reviews for beer:', beerId);
      const reviews = await api.reviews.getByBeerId(beerId);
      console.log('Reviews loaded:', reviews);
      setBeerReviews(Array.isArray(reviews) ? reviews : []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setBeerReviews([]);
    }
  };

  // Shared props for all pages
  const pageProps = {
    isLoggedIn,
    user,
    beers,
    loading,
    error,
    selectedBeer,
    beerReviews,
    selectedUser,
    handleNavigation,
    handleLoginSuccess,
    handleLogout,
    handleUserSelect,
    handleBeerSelect,
    refreshBeers,
    loadBeerReviews
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <HomePage {...pageProps} />;
      case 'beers':
        return <BeersPage {...pageProps} />;
      case 'friends':
        return <FriendsPage {...pageProps} />;
      case 'add':
        return <AddBeerPage {...pageProps} />;
      case 'login':
        return <LoginPage {...pageProps} />;
      case 'register':
        return <RegisterPage {...pageProps} />;
      case 'beer-detail':
        return <BeerDetailPage {...pageProps} />;
      case 'user-profile':
        return <UserProfilePage {...pageProps} />;
      case 'profile':
        return <ProfilePage {...pageProps} />;
      default:
        return <HomePage {...pageProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation 
        currentPage={currentPage}
        isLoggedIn={isLoggedIn}
        user={user}
        handleNavigation={handleNavigation}
        handleLogout={handleLogout}
      />
      {renderPage()}
    </div>
  );
};

export default BeerReviewApp;