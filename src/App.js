import React, { useState, useEffect } from 'react';
import MapComponent from './components/MapComponent';
import ChatInterface from './components/ChatInterface';
import { queryProperties } from './services/api';
import { useSessionManager } from './hooks/useSessionManager';
import './App.css';




















function App() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // Use the session manager hook
  const { 
    sessionId, 
    isSessionValid, 
    isLoading: sessionLoading, 
    initializeSession 
  } = useSessionManager();

  const handleSearch = async (query) => {
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Mobile/Tablet Header */}
      <div className="lg:hidden bg-white shadow-lg border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-3xl">🏠</span>
            Ask4Rent
          </h1>
          <p className="text-sm text-gray-600 mt-1">{getResultText()}</p>
        </div>
      </div>

      {/* Left Panel - Property Listings */}
      <div className="lg:w-96 xl:w-[400px] bg-white shadow-2xl lg:shadow-xl border-r border-gray-200 flex flex-col z-20">
        {/* Desktop Header */}
        <div className="hidden lg:block px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            Ask4Rent
          </h1>
          <p className="text-blue-100 text-sm mt-1">{getResultText()}</p>
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
                <div className="text-6xl mb-4">🏠</div>
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
                    <span className="text-4xl opacity-60 group-hover:opacity-80 transition-opacity">🏠</span>
                  </div>
                  
                  {/* Property Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-base leading-tight mb-2 line-clamp-2">
                      {property.title || property.address}
                    </h3>
                    
                    <div className="flex items-start gap-1.5 text-gray-600 text-sm mb-3">
                      <span className="text-blue-500">📍</span>
                      <span className="line-clamp-1">{property.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <span>🛏️</span>
                        <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🚿</span>
                        <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-blue-600">
                        ${property.rent_per_week}/week
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        View on map →
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
    </div>
  );
}

export default App;
