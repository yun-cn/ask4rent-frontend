import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getIcon, LoadingSpinner } from '../utils/icons';
import { searchPlaces } from '../services/api';

const CommuteSearchComponent = ({ 
  onSearch, 
  isLoading, 
  selectedLocation, 
  setSelectedLocation,
  isMapClickMode,
  setIsMapClickMode,
  onClose 
}) => {
  const [commuteMinutes, setCommuteMinutes] = useState(30);
  
  // Address search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Handle commute search
  const handleSearch = useCallback(async () => {
    if (!selectedLocation || !onSearch) return;
    
    try {
      await onSearch(selectedLocation.lng, selectedLocation.lat, commuteMinutes);
    } catch (error) {
      console.error('Commute search failed:', error);
    }
  }, [selectedLocation, commuteMinutes, onSearch]);


  // Toggle map click mode
  const handleToggleMapClick = useCallback(() => {
    setIsMapClickMode(!isMapClickMode);
  }, [isMapClickMode, setIsMapClickMode]);

  // Handle address search with debouncing
  const handleSearchInput = useCallback((query) => {
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await searchPlaces(query, 8);
        if (result.success) {
          setSearchResults(result.places);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  // Handle selecting a search result
  const handleSelectPlace = useCallback((place) => {
    setSelectedLocation({
      lat: place.lat,
      lng: place.lon
    });
    setSearchQuery(place.display_name);
    setShowResults(false);
    setSearchResults([]);
    setIsMapClickMode(false); // Turn off map click mode when address is selected
  }, [setSelectedLocation, setIsMapClickMode]);

  // Clear search and selected location
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setSelectedLocation(null);
    setIsMapClickMode(false);
  }, [setSelectedLocation, setIsMapClickMode]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);


  return (
    <div className="commute-search-panel bg-white rounded-xl shadow-lg border border-gray-200 p-5">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Commute Search
          </h2>
          <p className="text-gray-500 text-xs mt-0.5">Find properties within travel time</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
          >
            {getIcon('close', 'sm', 'current')}
          </button>
        )}
      </div>

      {/* Location Selection */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
          Select Target Location
        </h3>
        
        {/* Address Search Input */}
        <div className="mb-4 relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="Search address or place..."
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none transition-colors duration-200 pr-9"
            />
            
            {/* Search icon or clear button */}
            <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
              {isSearching ? (
                <LoadingSpinner size="sm" className="text-blue-500" />
              ) : searchQuery ? (
                <button
                  onClick={handleClearSearch}
                  className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {getIcon('close', 'sm', 'current')}
                </button>
              ) : (
                <div className="text-gray-400">
                  {getIcon('search', 'sm', 'current')}
                </div>
              )}
            </div>
          </div>
          
          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {searchResults.map((place) => (
                <button
                  key={place.id}
                  onClick={() => handleSelectPlace(place)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none"
                >
                  <div className="font-medium text-gray-800 text-sm">{place.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5 truncate">{place.display_name}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* OR Divider */}
        <div className="flex items-center my-3">
          <div className="flex-1 border-t border-gray-200"></div>
          <div className="px-3 text-xs text-gray-500 font-medium">OR</div>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>
        
        <button
          onClick={handleToggleMapClick}
          className={`group w-full p-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm ${
            isMapClickMode 
              ? 'bg-blue-500 text-white shadow-md' 
              : 'bg-gray-50 border border-gray-200 hover:border-blue-300 text-gray-700 hover:bg-blue-50'
          }`}
        >
          {isMapClickMode ? (
            <>
              <div className="animate-pulse">
                {getIcon('target', 'sm', 'white')}
              </div>
              <span className="font-medium">Click map to select</span>
            </>
          ) : (
            <>
              {getIcon('click', 'sm', 'primary')}
              <span className="font-medium">Use Map Selection</span>
            </>
          )}
        </button>

        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-700 font-medium text-sm">Location Ready</span>
              <div className="ml-auto text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                ✓
              </div>
            </div>
            <div className="text-xs text-green-600 ml-4">
              {searchQuery && searchQuery !== '' ? (
                <div className="bg-white px-2 py-1 rounded border border-green-200">
                  <div className="font-medium">📍 {searchQuery}</div>
                </div>
              ) : (
                <div className="font-mono bg-white px-2 py-1 rounded border border-green-200">
                  📍 {Math.abs(selectedLocation.lat).toFixed(4)}°{selectedLocation.lat >= 0 ? 'N' : 'S'}, {Math.abs(selectedLocation.lng).toFixed(4)}°{selectedLocation.lng >= 0 ? 'E' : 'W'}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Time Selection - Slider */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
          Travel Time
        </h3>
        
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          {/* Time Display */}
          <div className="text-center mb-3">
            <div className="inline-flex items-baseline gap-1">
              <div className="text-2xl font-bold text-gray-800">
                {commuteMinutes}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                min
              </div>
            </div>
          </div>
          
          {/* Slider */}
          <div className="px-2">
            <div className="relative">
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={commuteMinutes}
                onChange={(e) => setCommuteMinutes(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider-thumb"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>5</span>
                <span>30</span>
                <span>60</span>
                <span>120</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Actions */}
      <div>
        <button
          onClick={handleSearch}
          disabled={!selectedLocation || isLoading}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            !selectedLocation || isLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="text-current" />
              <span>Searching...</span>
            </>
          ) : !selectedLocation ? (
            <>
              {getIcon('alert', 'sm', 'current')}
              <span>Select Location First</span>
            </>
          ) : (
            <>
              {getIcon('search', 'sm', 'white')}
              <span>Find Properties</span>
            </>
          )}
        </button>

      </div>

    </div>
  );
};

export default CommuteSearchComponent;