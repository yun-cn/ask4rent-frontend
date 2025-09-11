import React, { useState } from 'react';
import { getIcon } from '../utils/icons';
import { isLoggedIn, getStoredUser } from '../services/api';

const Header = ({ 
  onShowFavorites, 
  onShowLogin, 
  onLogout, 
  onNavigateHome,
  currentPage = 'home' 
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userLoggedIn = isLoggedIn();
  const user = getStoredUser();

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleFavoritesClick = () => {
    setShowUserMenu(false);
    onShowFavorites();
  };

  const handleLoginClick = () => {
    setShowUserMenu(false);
    onShowLogin();
  };

  const handleLogoutClick = () => {
    setShowUserMenu(false);
    onLogout();
  };

  const handleHomeClick = () => {
    setShowUserMenu(false);
    onNavigateHome();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left Side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <button
              onClick={handleHomeClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
              title="Back to Home"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                {getIcon('home', 'sm', 'white')}
              </div>
              <span className="text-xl font-bold text-gray-900">Ask4Rent</span>
            </button>

          </div>

          {/* Right Side - User Menu */}
          <div className="flex items-center space-x-4">
            
            {/* Mobile Favorites Button */}
            <button
              onClick={handleFavoritesClick}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="My Favorites"
            >
              {getIcon('heart', 'sm', 'secondary')}
            </button>

            {/* User Menu */}
            <div className="relative">
              {userLoggedIn ? (
                <>
                  {/* Logged in user */}
                  <button
                    onClick={handleUserMenuToggle}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.email || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">Account Member</p>
                    </div>
                    <div className="text-gray-400">
                      {getIcon('arrow', 'sm', 'secondary')}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                        <p className="text-xs text-green-600 font-medium">✓ Premium Member</p>
                        <p className="text-xs text-gray-500 mt-1">Favorites saved permanently</p>
                      </div>
                      
                      <button
                        onClick={handleFavoritesClick}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        {getIcon('heart', 'sm', 'secondary')}
                        <span className="ml-3">My Favorites</span>
                      </button>
                      
                      <button
                        onClick={handleLogoutClick}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        {getIcon('logout', 'sm', 'secondary')}
                        <span className="ml-3">Sign Out</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Not logged in */}
                  <button
                    onClick={handleUserMenuToggle}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {getIcon('user', 'sm', 'white')}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">Guest User</p>
                      <p className="text-xs text-gray-500">Temporary Session</p>
                    </div>
                    <div className="text-gray-400">
                      {getIcon('arrow', 'sm', 'secondary')}
                    </div>
                  </button>

                  {/* Dropdown Menu for Guest */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">Guest User</p>
                        <p className="text-xs text-yellow-600 font-medium">⚠️ Temporary Session</p>
                        <p className="text-xs text-gray-500 mt-1">Favorites may be lost</p>
                      </div>
                      
                      <button
                        onClick={handleFavoritesClick}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        {getIcon('heart', 'sm', 'secondary')}
                        <span className="ml-3">My Favorites</span>
                        <span className="ml-auto text-xs text-gray-400">(Temp)</span>
                      </button>
                      
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLoginClick}
                          className="w-full px-4 py-2 text-left text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center font-medium"
                        >
                          {getIcon('user', 'sm', 'primary')}
                          <span className="ml-3">Sign In / Sign Up</span>
                        </button>
                        <p className="px-4 py-1 text-xs text-gray-500">Save favorites permanently</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;