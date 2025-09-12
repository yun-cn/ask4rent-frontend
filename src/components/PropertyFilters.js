import React, { useState, useEffect } from 'react';


const PropertyFilters = ({ onFilterChange, displayMode }) => {
  // State for property filters
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    maxBedrooms: '',
    minBathrooms: '',
    maxBathrooms: ''
  });

  // State for pending filters (not yet applied)
  const [pendingFilters, setPendingFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    maxBedrooms: '',
    minBathrooms: '',
    maxBathrooms: ''
  });

  // Handle filter changes (only update pending state)
  const handlePendingFilterChange = (filterType, value) => {
    console.log('=== PENDING FILTER CHANGE ===');
    console.log('Filter type:', filterType);
    console.log('New value:', value);
    
    const newPendingFilters = { ...pendingFilters, [filterType]: value };
    setPendingFilters(newPendingFilters);
    
    console.log('Updated pending filters:', newPendingFilters);
  };

  // Apply filters when user clicks confirm
  const applyFilters = () => {
    console.log('=== APPLYING FILTERS ===');
    console.log('Pending filters:', pendingFilters);
    
    setFilters(pendingFilters);
    
    // Convert to the format expected by parent
    const parentFilters = {
      minPrice: pendingFilters.minPrice,
      maxPrice: pendingFilters.maxPrice,
      bedrooms: pendingFilters.minBedrooms || pendingFilters.maxBedrooms ? `${pendingFilters.minBedrooms || ''}-${pendingFilters.maxBedrooms || ''}` : '',
      bathrooms: pendingFilters.minBathrooms || pendingFilters.maxBathrooms ? `${pendingFilters.minBathrooms || ''}-${pendingFilters.maxBathrooms || ''}` : '',
      minBedrooms: pendingFilters.minBedrooms,
      maxBedrooms: pendingFilters.maxBedrooms,
      minBathrooms: pendingFilters.minBathrooms,
      maxBathrooms: pendingFilters.maxBathrooms
    };
    
    console.log('Parent filters to send:', parentFilters);
    
    // Call parent callback if provided
    if (onFilterChange) {
      onFilterChange(parentFilters);
    }
  };

  // Reset filters when display mode changes (but not on first mount)
  const [hasInitialized, setHasInitialized] = useState(false);
  
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
      return;
    }
    
    console.log('=== RESETTING FILTERS due to displayMode change ===');
    console.log('displayMode:', displayMode);
    
    const defaultFilters = {
      minPrice: '',
      maxPrice: '',
      minBedrooms: '',
      maxBedrooms: '',
      minBathrooms: '',
      maxBathrooms: ''
    };
    setFilters(defaultFilters);
    setPendingFilters(defaultFilters);
    
    if (onFilterChange) {
      const parentFilters = {
        minPrice: '',
        maxPrice: '',
        bedrooms: '',
        bathrooms: ''
      };
      onFilterChange(parentFilters);
    }
  }, [displayMode]); // Only depend on displayMode to avoid loops

  // Reset function
  const resetFilters = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('=== RESET FILTERS CLICKED ===');
    
    const defaultFilters = {
      minPrice: '',
      maxPrice: '',
      minBedrooms: '',
      maxBedrooms: '',
      minBathrooms: '',
      maxBathrooms: ''
    };
    setFilters(defaultFilters);
    setPendingFilters(defaultFilters);
    
    if (onFilterChange) {
      const parentFilters = {
        minPrice: '',
        maxPrice: '',
        bedrooms: '',
        bathrooms: ''
      };
      onFilterChange(parentFilters);
    }
  };


  // Only show filters when in properties mode
  if (displayMode !== 'properties') {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
        <button
          onClick={resetFilters}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Reset
        </button>
      </div>
      
      <div className="space-y-5">
        {/* Price Range */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Rent per week
          </label>
          <div className="grid grid-cols-5 gap-2 items-center">
            <div className="col-span-2">
              <select
                value={pendingFilters.minPrice}
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePendingFilterChange('minPrice', e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Any</option>
                {(() => {
                  const prices = [];
                  // $50 to $1000 in $50 increments
                  for (let i = 50; i <= 1000; i += 50) {
                    prices.push(i);
                  }
                  // $1250 to $2500 in $250 increments
                  for (let i = 1250; i <= 2500; i += 250) {
                    prices.push(i);
                  }
                  return prices.map(price => (
                    <option key={price} value={price}>${price}</option>
                  ));
                })()}
              </select>
            </div>
            <div className="col-span-1 flex justify-center">
              <span className="text-gray-500 text-sm font-medium">-</span>
            </div>
            <div className="col-span-2">
              <select
                value={pendingFilters.maxPrice}
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePendingFilterChange('maxPrice', e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Any</option>
                {(() => {
                  const prices = [];
                  // $50 to $1000 in $50 increments
                  for (let i = 50; i <= 1000; i += 50) {
                    prices.push(i);
                  }
                  // $1250 to $2500 in $250 increments
                  for (let i = 1250; i <= 2500; i += 250) {
                    prices.push(i);
                  }
                  return prices.map(price => (
                    <option key={price} value={price}>${price}</option>
                  ));
                })()}
              </select>
            </div>
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Bedrooms
          </label>
          <div className="grid grid-cols-5 gap-2 items-center">
            <div className="col-span-2">
              <select
                value={pendingFilters.minBedrooms}
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePendingFilterChange('minBedrooms', e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Any</option>
                {Array.from({length: 6}, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1 flex justify-center">
              <span className="text-gray-500 text-sm font-medium">-</span>
            </div>
            <div className="col-span-2">
              <select
                value={pendingFilters.maxBedrooms}
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePendingFilterChange('maxBedrooms', e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Any</option>
                {Array.from({length: 6}, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bathrooms */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Bathrooms
          </label>
          <div className="grid grid-cols-5 gap-2 items-center">
            <div className="col-span-2">
              <select
                value={pendingFilters.minBathrooms}
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePendingFilterChange('minBathrooms', e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Any</option>
                {Array.from({length: 6}, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1 flex justify-center">
              <span className="text-gray-500 text-sm font-medium">-</span>
            </div>
            <div className="col-span-2">
              <select
                value={pendingFilters.maxBathrooms}
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePendingFilterChange('maxBathrooms', e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Any</option>
                {Array.from({length: 6}, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="pt-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              applyFilters();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilters;