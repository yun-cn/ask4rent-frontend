import React, { useState, useCallback } from 'react';
import { getIcon, LoadingSpinner } from '../utils/icons';
import { useSessionManager } from '../hooks/useSessionManager';
import CommuteSearchShortcut from './CommuteSearchShortcut';

const HomePage = ({ onSearch, onShowZones, onShowCommuteSearch, isLoading, user, onShowLogin, onLogout }) => {
  
  // Use the session manager hook
  const { 
    sessionId, 
    isSessionValid, 
    isLoading: sessionLoading, 
    initializeSession 
  } = useSessionManager();


  // Enhanced search handler with session validation
  const handleSearchWithSession = useCallback(async (query) => {
    if (!sessionId || !isSessionValid) {
      console.warn('Session not valid, attempting to initialize...');
      
      if (!sessionLoading) {
        await initializeSession();
      }
      
      // Wait a moment for session to initialize then retry
      setTimeout(() => {
        if (query.trim()) {
          onSearch(query);
        }
      }, 1000);
      
      return;
    }
    
    if (query.trim()) {
      onSearch(query);
    }
  }, [sessionId, isSessionValid, sessionLoading, initializeSession, onSearch]);

  const renderSearchContent = () => {
    // Show loading state while session is initializing
    if (sessionLoading) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center py-16">
            <LoadingSpinner size="xl" className="text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Initializing session...</p>
          </div>
        </div>
      );
    }

    // Show session status if not valid
    if (!isSessionValid) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center py-16">
            <div className="text-yellow-500 mb-4">
              {getIcon('alert', 'xxl', 'warning')}
            </div>
            <p className="text-gray-600 text-lg mb-4">Session not initialized</p>
            <button
              onClick={initializeSession}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Initialize Session
            </button>
          </div>
        </div>
      );
    }

    // Always return AI Search Form
    return <AISearchForm onSearch={handleSearchWithSession} isLoading={isLoading} sessionValid={isSessionValid} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Main Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Ask4Rent
          </h1>
          <p className="text-gray-600 text-lg">Your trusted rental companion</p>
        </div>

        {/* Search Form */}
        <div className="max-w-4xl mx-auto">
          {renderSearchContent()}
          
          {/* Search Shortcuts */}
          {(isSessionValid || !sessionLoading) && (
            <div className="flex justify-center items-end gap-12 mt-8">
              <SchoolsSearchShortcut onShowSchools={onShowZones} isLoading={isLoading} />
              <CommuteSearchShortcut onShowCommuteSearch={onShowCommuteSearch} isLoading={isLoading} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const SubmitButton = ({ children, color = 'blue', className = '', ...props }) => {
  const colorClasses = {
    blue: 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
    green: 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
    purple: 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
  };

  return (
    <button
      type="submit"
      className={`w-full bg-gradient-to-r ${colorClasses[color]} text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:shadow-blue-500/25 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Search Form Components
const AISearchForm = ({ onSearch, isLoading, sessionValid }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  }, [query, onSearch]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
          {getIcon('bot', 'xl', 'primary')}
          AI Assistant
        </h2>
        <p className="text-gray-600">Ask in natural language and let AI find your perfect rental</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {getIcon('search', 'md', 'primary')}
          </div>
          <textarea
            placeholder="Ask about rental properties in natural language... e.g., 'Show me 2-bedroom apartments near Massey University under $600 per week with parking'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={4}
            className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-2xl outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:shadow-lg placeholder:text-gray-500 bg-gray-50 focus:bg-white resize-none hover:border-gray-300 hover:shadow-sm"
          />
        </div>
        
        <SubmitButton disabled={isLoading || !query.trim() || !sessionValid}>
          {isLoading ? (
            <>
              <LoadingSpinner size="md" className="text-white" />
              <span>Searching...</span>
            </>
          ) : !sessionValid ? (
            <>
              {getIcon('alert', 'md', 'white')}
              <span>Session Initializing...</span>
            </>
          ) : (
            <>
              {getIcon('bot', 'md', 'white')}
              <span>Ask AI Assistant</span>
            </>
          )}
        </SubmitButton>
      </form>
    </div>
  );
};

// Schools Search Shortcut Component
const SchoolsSearchShortcut = ({ onShowSchools, isLoading }) => {
  const handleShowSchools = useCallback(() => {
    if (onShowSchools) {
      onShowSchools();
    }
  }, [onShowSchools]);

  return (
    <div className="relative group">
        <button
          onClick={handleShowSchools}
          disabled={isLoading}
          className={`w-24 h-24 rounded-3xl transition-all duration-500 ease-out flex flex-col items-center justify-center relative overflow-hidden shadow-xl ${
            isLoading
              ? 'bg-gray-100 cursor-not-allowed'
              : 'bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 hover:from-green-500 hover:via-green-600 hover:to-emerald-700 hover:shadow-2xl hover:shadow-green-500/30 transform hover:scale-125 hover:-translate-y-3 active:scale-105 active:translate-y-0'
          }`}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
          
          {/* Content */}
          <div className="relative z-10 transition-all duration-300">
            {isLoading ? (
              <LoadingSpinner size="lg" className="text-green-600" />
            ) : (
              <>
                <div className="text-4xl mb-2 drop-shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  🎓
                </div>
                <span className="text-sm text-white/95 font-bold tracking-wider drop-shadow-sm group-hover:text-white transition-colors duration-300">
                  SCHOOLS
                </span>
              </>
            )}
          </div>
          
          {/* Enhanced shine effect */}
          {!isLoading && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
          )}
          
          {/* Pulse ring on hover */}
          {!isLoading && (
            <div className="absolute inset-0 rounded-3xl border-2 border-white/50 scale-100 opacity-0 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500"></div>
          )}
        </button>
        
        {/* Tooltip */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
            Schools by Zone
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        </div>
      </div>
  );
};

export default HomePage;