import React, { useState } from 'react';
import { getIcon, LoadingSpinner } from '../utils/icons';

const SearchComponent = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const exampleQueries = [
    "3-bedroom apartment near Massey University under $700/week",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleExampleClick = (exampleQuery) => {
    setQuery(exampleQuery);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 m-5 relative z-50">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Input with Icon */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {getIcon('search', 'md', 'primary')}
          </div>
          <input
            type="text"
            placeholder="Ask about rental properties in natural language... e.g., 'Show me 2-bedroom apartments near Massey University under $600 per week'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-xl outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 placeholder:text-gray-500 bg-gray-50 focus:bg-white"
          />
        </div>
        
        {/* Search Button */}
        <button 
          type="submit" 
          disabled={isLoading || !query.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="md" className="text-white" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              {getIcon('home', 'md', 'white')}
              <span>Search Properties</span>
            </>
          )}
        </button>
      </form>
      
      {/* Example Queries */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-start gap-2">
          {getIcon('lightbulb', 'md', 'primary')}
          <div>
            <p className="font-medium text-blue-900 text-sm mb-2">Try these example searches:</p>
            <div className="space-y-2">
              {exampleQueries.map((example, index) => (
                <button
                  key={index} 
                  onClick={() => handleExampleClick(example)}
                  className="block text-left text-blue-600 hover:text-blue-800 text-sm underline hover:no-underline transition-all p-1 rounded hover:bg-blue-100 w-full"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchComponent;