import React, { useState, useEffect } from 'react';
import { getIcon } from './utils/icons';
import MapComponent from './components/MapComponent';
import ChatInterface from './components/ChatInterface';
import HomePage from './components/HomePage';
import Login from './components/Login';
import { queryProperties } from './services/api';
import { useSessionManager } from './hooks/useSessionManager';
import './App.css';




















function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' or 'results'
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  
  // Use the session manager hook
  const { 
    sessionId, 
    isSessionValid, 
    isLoading: sessionLoading, 
    initializeSession 
  } = useSessionManager();

  const handleSearch = async (query) => {
    // Switch to results page
    setCurrentPage('results');
    
    // Add user message
    const userMessage = { type: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    
    if (!sessionId || !isSessionValid) {
      const errorMessage = {
        type: 'ai',
        content: sessionLoading 
          ? "Session is being initialized. Please wait a moment and try again."
          : "Session expired or not initialized. Please refresh the page."
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Try to reinitialize session if not loading
      if (!sessionLoading) {
        await initializeSession();
      }
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await queryProperties(sessionId, query);
      
      if (response.success) {
        // Map the backend data format to frontend format
        const mappedProperties = response.properties.map(property => ({
          ...property,
          lat: property.latitude,
          lng: property.longitude
        }));
        setProperties(mappedProperties);
        
        // Add AI response
        const resultCount = mappedProperties.length;
        const aiMessage = {
          type: 'ai',
          content: resultCount > 0 
            ? `I found ${resultCount} ${resultCount === 1 ? 'property' : 'properties'} for you`
            : "No properties found"
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Center map on first result if available
        if (mappedProperties.length > 0) {
          const firstProperty = mappedProperties[0];
          setMapCenter([firstProperty.lat, firstProperty.lng]);
        }
      } else {
        const errorMessage = {
          type: 'ai',
          content: "Sorry, I couldn't process your request."
        };
        setMessages(prev => [...prev, errorMessage]);
        setProperties([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertySelect = (property) => {
    setMapCenter([property.lat, property.lng]);
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setProperties([]);
    setMessages([]);
    setMapCenter(null);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setShowLogin(false);
    // Save user data to localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Reset app state
    setCurrentPage('home');
    setProperties([]);
    setMessages([]);
    setMapCenter(null);
  };

  // Check for saved user data on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const getResultText = () => {
    if (sessionLoading) return "Initializing session...";
    if (isLoading) return "Searching...";
    if (!isSessionValid) return "Session expired";
    if (properties.length === 0) return "No properties found";
    return `Found ${properties.length} ${properties.length === 1 ? 'property' : 'properties'}`;
  };

  // Show loading state while session is initializing
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing session...</p>
        </div>
      </div>
    );
  }

  // Show homepage or results based on current page
  if (currentPage === 'home') {
    return (
      <>
        <HomePage onSearch={handleSearch} isLoading={isLoading} user={user} onShowLogin={() => setShowLogin(true)} onLogout={handleLogout} />
        {showLogin && <Login onLogin={handleLogin} onClose={() => setShowLogin(false)} />}
      </>
    );
  }

  // Results page
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Mobile/Tablet Header */}
      <div className="lg:hidden bg-white shadow-lg border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {getIcon('home', 'xl', 'primary')}
              Ask4Rent
            </h1>
            <button
              onClick={handleBackToHome}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
            >
              {getIcon('home', 'sm', 'white')}
              Home
            </button>
          </div>
          
          {/* Mobile Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {getIcon('search', 'sm', 'secondary')}
            </div>
            <input
              type="text"
              placeholder="Refine your search..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  handleSearch(e.target.value);
                  e.target.value = '';
                }
              }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">{getResultText()}</p>
        </div>
      </div>

      {/* Left Panel - Property Listings */}
      <div className="lg:w-96 xl:w-[400px] bg-white shadow-2xl lg:shadow-xl border-r border-gray-200 flex flex-col z-20">
        {/* Desktop Header */}
        <div className="hidden lg:block px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                {getIcon('home', 'lg', 'white')}
                Ask4Rent
              </h1>
              <p className="text-blue-100 text-sm mt-1">{getResultText()}</p>
            </div>
            <button
              onClick={handleBackToHome}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm flex items-center gap-1"
            >
              {getIcon('home', 'sm', 'white')}
              Home
            </button>
          </div>
          
          {/* Desktop Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {getIcon('search', 'sm', 'white')}
            </div>
            <input
              type="text"
              placeholder="Refine your search..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/10 border border-white/20 rounded-lg focus:bg-white focus:text-gray-900 focus:border-white text-white placeholder-blue-100 outline-none transition-all"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  handleSearch(e.target.value);
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>
        
        {/* Properties Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm">Searching for properties...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16">
                {getIcon('home', 'xxxl', 'muted')}
                <p className="text-gray-600 text-lg font-medium">No properties found</p>
                <p className="text-gray-500 text-sm mt-2">
                  Try searching with the AI assistant
                </p>
              </div>
            ) : (
              properties.map((property, index) => (
                <div 
                  key={property.id || index}
                  onClick={() => handlePropertySelect(property)}
                  className="bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group overflow-hidden"
                >
                  {/* Property Image */}
                  <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-blue-50 group-hover:to-indigo-50 transition-colors">
                    {getIcon('home', 'xxl', 'muted')}
                  </div>
                  
                  {/* Property Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-base leading-tight mb-2 line-clamp-2">
                      {property.title || property.address}
                    </h3>
                    
                    <div className="flex items-start gap-1.5 text-gray-600 text-sm mb-3">
                      {getIcon('mapPin', 'sm', 'primary')}
                      <span className="line-clamp-1">{property.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        {getIcon('bed', 'sm', 'secondary')}
                        <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getIcon('bath', 'sm', 'secondary')}
                        <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-blue-600">
                        ${property.rent_per_week}/week
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                        <span>View on map</span>
                        {getIcon('arrow', 'xs', 'secondary')}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Map */}
      <div className="flex-1 relative bg-gray-100">
        <MapComponent
          properties={properties}
          center={mapCenter}
          zoom={mapCenter ? 14 : 12}
        />
        
        <ChatInterface
          onSearch={handleSearch}
          isLoading={isLoading}
          messages={messages}
        />
      </div>
      {showLogin && <Login onLogin={handleLogin} onClose={() => setShowLogin(false)} />}
    </div>
  );
}

export default App;
