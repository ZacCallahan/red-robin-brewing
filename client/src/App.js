import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import BeersPage from './pages/BeersPage';
import WinesPage from './pages/WinesPage';
import SpiritsPage from './pages/SpiritsPage';
import FriendsPage from './pages/FriendsPage';
import AddBeveragePage from './pages/AddBeveragePage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BeerDetailPage from './pages/BeerDetailPage';
import WineDetailPage from './pages/WineDetailPage';
import SpiritDetailPage from './pages/SpiritDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  // Beverage states
  const [beers, setBeers] = useState([]);
  const [wines, setWines] = useState([]);
  const [spirits, setSpirits] = useState([]);
  
  // Selected items
  const [selectedBeer, setSelectedBeer] = useState(null);
  const [selectedWine, setSelectedWine] = useState(null);
  const [selectedSpirit, setSelectedSpirit] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Reviews
  const [beerReviews, setBeerReviews] = useState([]);
  const [wineReviews, setWineReviews] = useState([]);
  const [spiritReviews, setSpiritReviews] = useState([]);

  // Check authentication status on app load
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
      // Check if it's a password reset or email verification
      if (window.location.pathname === '/reset-password') {
        setCurrentPage('reset-password');
      } else {
        setCurrentPage('verify-email');
      }
    }
  }, []);

  // Load all beverages on app start
  useEffect(() => {
    loadBeers();
    loadWines();
    loadSpirits();
  }, []);

  // Load all beers from API
  const loadBeers = async () => {
    try {
      const beersData = await api.beers.getAll();
      setBeers(beersData || []);
    } catch (error) {
      console.error('Error loading beers:', error);
      setBeers([]);
    }
  };

  // Load all wines from API
  const loadWines = async () => {
    try {
      const winesData = await api.wines.getAll();
      setWines(winesData || []);
    } catch (error) {
      console.error('Error loading wines:', error);
      setWines([]);
    }
  };

  // Load all spirits from API
  const loadSpirits = async () => {
    try {
      const spiritsData = await api.spirits.getAll();
      setSpirits(spiritsData || []);
    } catch (error) {
      console.error('Error loading spirits:', error);
      setSpirits([]);
    }
  };

  // Load reviews for specific beer
  const loadBeerReviews = async (beerId) => {
    try {
      const reviews = await api.reviews.getByBeerId(beerId);
      setBeerReviews(reviews || []);
    } catch (error) {
      console.error('Error loading beer reviews:', error);
      setBeerReviews([]);
    }
  };

  // Load reviews for specific wine
  const loadWineReviews = async (wineId) => {
    try {
      const reviews = await api.reviews.getByWineId(wineId);
      setWineReviews(reviews || []);
    } catch (error) {
      console.error('Error loading wine reviews:', error);
      setWineReviews([]);
    }
  };

  // Load reviews for specific spirit
  const loadSpiritReviews = async (spiritId) => {
    try {
      const reviews = await api.reviews.getBySpiritId(spiritId);
      setSpiritReviews(reviews || []);
    } catch (error) {
      console.error('Error loading spirit reviews:', error);
      setSpiritReviews([]);
    }
  };

  // Handle page navigation
  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  // Reload beverages for admin dashboard
  const reloadBeers = async () => {
    try {
      const beersData = await api.beers.getAll();
      setBeers(beersData || []);
    } catch (error) {
      console.error('Error reloading beers:', error);
    }
  };

  const reloadWines = async () => {
    try {
      const winesData = await api.wines.getAll();
      setWines(winesData || []);
    } catch (error) {
      console.error('Error reloading wines:', error);
    }
  };

  const reloadSpirits = async () => {
    try {
      const spiritsData = await api.spirits.getAll();
      setSpirits(spiritsData || []);
    } catch (error) {
      console.error('Error reloading spirits:', error);
    }
  };

  // Handle user login
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

  // Handle user registration
  const handleRegister = async (userData) => {
    try {
      const response = await api.auth.register(userData);
      
      // Clear any existing user state
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // RegisterPage will handle the success state display
      
    } catch (error) {
      // Ensure no accidental login on error
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      throw error;
    }
  };

  // Handle user logout
  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage('home');
  };

  // Handle beverage selection and navigation
  const handleBeerSelect = (beer) => {
    setSelectedBeer(beer);
    loadBeerReviews(beer._id);
    setCurrentPage('beer-detail');
  };

  const handleWineSelect = (wine) => {
    setSelectedWine(wine);
    loadWineReviews(wine._id);
    setCurrentPage('wine-detail');
  };

  const handleSpiritSelect = (spirit) => {
    setSelectedSpirit(spirit);
    loadSpiritReviews(spirit._id);
    setCurrentPage('spirit-detail');
  };

  // Handle user selection and navigation
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setCurrentPage('user-profile');
  };

  // Render current page based on state
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage 
            beers={beers}
            wines={wines}
            spirits={spirits}
            handleBeerSelect={handleBeerSelect}
            handleWineSelect={handleWineSelect}
            handleSpiritSelect={handleSpiritSelect}
            isLoggedIn={isLoggedIn}
            handleNavigation={handleNavigation}
            refreshBeers={loadBeers}
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
      case 'wines':
        return (
          <WinesPage 
            wines={wines}
            handleWineSelect={handleWineSelect}
            isLoggedIn={isLoggedIn}
          />
        );
      case 'spirits':
        return (
          <SpiritsPage 
            spirits={spirits}
            handleSpiritSelect={handleSpiritSelect}
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
      case 'add-beverage':
        return (
          <AddBeveragePage 
            isLoggedIn={isLoggedIn}
            handleNavigation={handleNavigation}
            handleLogout={handleLogout}
            refreshBeers={loadBeers}
            refreshWines={loadWines}
            refreshSpirits={loadSpirits}
            beers={beers}
            wines={wines}
            spirits={spirits}
          />
        );
      case 'profile':
        return (
          <ProfilePage 
            isLoggedIn={isLoggedIn}
            user={user}
            handleNavigation={handleNavigation}
            handleBeerSelect={handleBeerSelect}
            handleWineSelect={handleWineSelect}
            handleSpiritSelect={handleSpiritSelect}
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
      case 'wine-detail':
        return (
          <WineDetailPage 
            selectedWine={selectedWine}
            wineReviews={wineReviews}
            isLoggedIn={isLoggedIn}
            user={user}
            handleNavigation={handleNavigation}
            handleLogout={handleLogout}
            loadWineReviews={loadWineReviews}
            refreshWines={loadWines}
          />
        );
      case 'spirit-detail':
        return (
          <SpiritDetailPage 
            selectedSpirit={selectedSpirit}
            spiritReviews={spiritReviews}
            isLoggedIn={isLoggedIn}
            user={user}
            handleNavigation={handleNavigation}
            handleLogout={handleLogout}
            loadSpiritReviews={loadSpiritReviews}
            refreshSpirits={loadSpirits}
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
            reloadWines={reloadWines}
            reloadSpirits={reloadSpirits}
          />
        );
      case 'verify-email':
        return (
          <EmailVerificationPage 
            handleNavigation={handleNavigation}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordPage 
            handleNavigation={handleNavigation}
          />
        );
      case 'reset-password':
        return (
          <ResetPasswordPage 
            handleNavigation={handleNavigation}
          />
        );
      default:
        return (
          <HomePage 
            beers={beers}
            wines={wines}
            spirits={spirits}
            handleBeerSelect={handleBeerSelect}
            handleWineSelect={handleWineSelect}
            handleSpiritSelect={handleSpiritSelect}
            isLoggedIn={isLoggedIn}
            handleNavigation={handleNavigation}
            refreshBeers={loadBeers}
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