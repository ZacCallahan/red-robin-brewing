import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import BeersPage from './pages/BeersPage';
import FriendsPage from './pages/FriendsPage';
import AddBeerPage from './pages/AddBeerPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BeerDetailPage from './pages/BeerDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import EmailVerificationPage from './pages/EmailVerificationPage'; // NEW: Email verification import

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [beers, setBeers] = useState([]);
  const [selectedBeer, setSelectedBeer] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [beerReviews, setBeerReviews] = useState([]);

  // Check if user is logged in on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Check for email verification route on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('token') && urlParams.get('email')) {
      setCurrentPage('verify-email');
    }
  }, []);

  // Load beers on app start
  useEffect(() => {
    loadBeers();
  }, []);

  const loadBeers = async () => {
    try {
      const beersData = await api.beers.getAll();
      setBeers(beersData || []);
    } catch (error) {
      console.error('Error loading beers:', error);
    }
  };

  const loadBeerReviews = async (beerId) => {
    try {
      const reviews = await api.reviews.getByBeerId(beerId);
      setBeerReviews(reviews || []);
    } catch (error) {
      console.error('Error loading beer reviews:', error);
      setBeerReviews([]);
    }
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  // Reload beers function for admin dashboard
  const reloadBeers = async () => {
    try {
      const beersData = await api.beers.getAll();
      setBeers(beersData || []);
    } catch (error) {
      console.error('Error reloading beers:', error);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      console.log('🔑 Starting login with credentials:', credentials);
      
      const response = await api.auth.login(credentials);
      console.log('✅ Login API response:', response);
      
      console.log('👤 Setting user:', response.user);
      setUser(response.user);
      
      console.log('🔐 Setting logged in to true');
      setIsLoggedIn(true);
      
      console.log('🏠 Navigating to home');
      setCurrentPage('home');
      
      console.log('✅ Login completed successfully');
    } catch (error) {
      console.error('❌ Login error in handleLogin:', error);
      throw error;
    }
  };

const handleRegister = async (userData) => {
  try {
    const response = await api.auth.register(userData);
    
    // Clear any existing user state immediately
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // NO MORE ALERT - RegisterPage will handle the success state
    // The RegisterPage will show its own success message
    
  } catch (error) {
    // Make sure we don't accidentally log in on error either
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    throw error;
  }
};

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage('home');
  };

  const handleBeerSelect = (beer) => {
    setSelectedBeer(beer);
    loadBeerReviews(beer._id);
    setCurrentPage('beer-detail');
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setCurrentPage('user-profile');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage 
            beers={beers}
            handleBeerSelect={handleBeerSelect}
            isLoggedIn={isLoggedIn}
            handleNavigation={handleNavigation}
          />
        );
      case 'beers':
        return (
          <BeersPage 
            beers={beers}
            handleBeerSelect={handleBeerSelect}
            isLoggedIn={isLoggedIn}
          />
        );
      case 'friends':
        return (
          <FriendsPage 
            isLoggedIn={isLoggedIn}
            handleNavigation={handleNavigation}
            handleUserSelect={handleUserSelect}
          />
        );
      case 'add-beer':
        return (
          <AddBeerPage 
            isLoggedIn={isLoggedIn}
            handleNavigation={handleNavigation}
            handleLogout={handleLogout}
            refreshBeers={loadBeers}
            beers={beers}
          />
        );
      case 'profile':
        return (
          <ProfilePage 
            isLoggedIn={isLoggedIn}
            user={user}
            handleNavigation={handleNavigation}
            handleBeerSelect={handleBeerSelect}
          />
        );
      case 'login':
        return (
          <LoginPage 
            handleLogin={handleLogin}
            handleNavigation={handleNavigation}
          />
        );
      case 'register':
        return (
          <RegisterPage 
            handleRegister={handleRegister}
            handleNavigation={handleNavigation}
          />
        );
      case 'beer-detail':
        return (
          <BeerDetailPage 
            selectedBeer={selectedBeer}
            beerReviews={beerReviews}
            isLoggedIn={isLoggedIn}
            user={user}
            handleNavigation={handleNavigation}
            handleLogout={handleLogout}
            loadBeerReviews={loadBeerReviews}
            refreshBeers={loadBeers}
          />
        );
      case 'user-profile':
        return (
          <UserProfilePage 
            selectedUser={selectedUser}
          />
        );
      case 'admin':
        return (
          <AdminDashboard 
            user={user}
            isLoggedIn={isLoggedIn}
            handleNavigation={handleNavigation}
            reloadBeers={reloadBeers} 
          />
        );
      case 'verify-email': // NEW: Email verification page
        return (
          <EmailVerificationPage 
            handleNavigation={handleNavigation}
          />
        );
      default:
        return (
          <HomePage 
            beers={beers} 
            handleBeerSelect={handleBeerSelect} 
            isLoggedIn={isLoggedIn}
            handleNavigation={handleNavigation}
          />
        );
    }
  };

  return (
    <div className="App">
      <Navigation 
        currentPage={currentPage}
        handleNavigation={handleNavigation}
        isLoggedIn={isLoggedIn}
        user={user}
        handleLogout={handleLogout}
      />
      {renderPage()}
    </div>
  );
}

export default App;