import React, { useState } from 'react';
import { Home, Beer, Wine, Martini, Users, Plus, User, LogIn, LogOut, Menu, X, Settings } from 'lucide-react';

const Navigation = ({ currentPage, isLoggedIn, user, handleNavigation, handleLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle mobile menu visibility
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle navigation for mobile menu and close menu
  const handleMobileNavigation = (page) => {
    handleNavigation(page);
    setIsMobileMenuOpen(false);
  };

  // Navigation button component
  const NavButton = ({ page, icon: Icon, children, mobile = false }) => {
    const isActive = currentPage === page;
    const baseClasses = mobile 
      ? "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-left w-full"
      : "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium";
    
    return (
      <button 
        onClick={() => mobile ? handleMobileNavigation(page) : handleNavigation(page)}
        className={`${baseClasses} ${
          isActive 
            ? 'bg-red-600 text-white shadow-md' 
            : 'text-white hover:bg-red-600 hover:text-white'
        }`}
      >
        <Icon className={mobile ? "w-5 h-5" : "w-4 h-4"} />
        {children}
      </button>
    );
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-gradient-to-r from-black via-gray-900 to-black shadow-xl border-b-2 border-red-600 sticky top-0 z-50">
        <div className="max-w-8xl mx-auto px-6">
          <div className="flex items-center justify-between h-16 relative px-4">
            {/* Logo Section - Left (Clickable) */}
            <button 
              onClick={() => handleNavigation('home')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <img 
                  src="/logo.png" 
                  alt="Red Robin Brewing Co. Logo" 
                  className="w-14 h-14 rounded-full object-cover border-2 border-red-500"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center border-2 border-red-500" style={{display: 'none'}}>
                  <span className="text-white font-bold text-base">RR</span>
                </div>
              </div>
              <div className="hidden sm:block text-left">
                <h1 className="text-xl font-bold text-white tracking-tight select-none">
                  Red Robin Rating
                </h1>
                <p className="text-xs text-gray-300 -mt-1 select-none">
                  Alcoholic Beverage Reviews
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links - Centered */}
            <div className="hidden xl:flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2">
              <NavButton page="home" icon={Home}>Home</NavButton>
              <NavButton page="beers" icon={Beer}>Beer + Cider</NavButton>
              <NavButton page="wines" icon={Wine}>Wines</NavButton>
              <NavButton page="spirits" icon={Martini}>Spirits</NavButton>
              <NavButton page="friends" icon={Users}>Users</NavButton>
              <NavButton page="add-beverage" icon={Plus}>Add Beverage</NavButton>
            </div>

            {/* User Section - Right */}
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <div className="hidden lg:flex items-center gap-3">
                  {/* Admin link - only show for admin users */}
                  {user?.isAdmin && (
                    <NavButton page="admin" icon={Settings}>Admin</NavButton>
                  )}
                  <NavButton page="profile" icon={User}>
                    {user?.username || 'Profile'}
                  </NavButton>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-white hover:bg-red-600 hover:text-white"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-3">
                  <NavButton page="login" icon={LogIn}>Login</NavButton>
                  <NavButton page="register" icon={User}>Sign Up</NavButton>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-lg text-white hover:bg-red-600 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-black border-t border-gray-700 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              <NavButton page="home" icon={Home} mobile>Home</NavButton>
              <NavButton page="beers" icon={Beer} mobile>Beer + Cider</NavButton>
              <NavButton page="wines" icon={Wine} mobile>Wines</NavButton>
              <NavButton page="spirits" icon={Martini} mobile>Spirits</NavButton>
              <NavButton page="friends" icon={Users} mobile>Users</NavButton>
              <NavButton page="add-beverage" icon={Plus} mobile>Add Beverage</NavButton>
              
              {/* Admin link for mobile - only show for admin users */}
              {isLoggedIn && user?.isAdmin && (
                <NavButton page="admin" icon={Settings} mobile>Admin</NavButton>
              )}
              
              <div className="border-t border-gray-700 my-3"></div>
              
              {isLoggedIn ? (
                <>
                  <NavButton page="profile" icon={User} mobile>
                    {user?.username || 'Profile'}
                  </NavButton>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-left w-full text-white hover:bg-red-600"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavButton page="login" icon={LogIn} mobile>Login</NavButton>
                  <NavButton page="register" icon={User} mobile>Sign Up</NavButton>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;