import React, { useState, useEffect } from 'react';


const BottomDrawer = ({ 
  properties = [
    {
      "address": "2/6 John Jennings Drive",
      "bedrooms": 3,
      "bathrooms": 1,
      "rent_per_week": 649,
      "longitude": 174.7193133,
      "latitude": -36.7143597
    },
    {
      "address": "42 Corricvale Way",
      "bedrooms": 1,
      "bathrooms": 1,
      "rent_per_week": 200,
      "longitude": 174.7229053,
      "latitude": -36.7062242
    },
    {
      "address": "89 Fairview Avenue",
      "bedrooms": 2,
      "bathrooms": 1,
      "rent_per_week": 525,
      "longitude": 174.71355,
      "latitude": -36.7111869
    },
    {
      "address": "Travis View Dr",
      "bedrooms": 5,
      "bathrooms": 3,
      "rent_per_week": 1100,
      "longitude": 174.7121696,
      "latitude": -36.7111774
    }
  ],
  isLoading = false, 
  onPropertySelect, 
  isOpen = false,
  onToggle,
  resultCount = 0
}) => {
  const [localIsOpen, setLocalIsOpen] = useState(false);

  useEffect(() => {
    if (properties.length > 0 || isLoading) {
      setLocalIsOpen(true);
    }
  }, [properties, isLoading]);

  const actualIsOpen = isOpen !== undefined ? isOpen : localIsOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setLocalIsOpen(!localIsOpen);
    }
  };

  const handleClose = () => {
    if (onToggle) {
      onToggle(false);
    } else {
      setLocalIsOpen(false);
    }
  };

  const getResultText = () => {
    if (isLoading) return "Searching...";
    if (properties.length === 0) return "No properties found";
    return `Found ${properties.length} ${properties.length === 1 ? 'property' : 'properties'}`;
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
        actualIsOpen ? 'translate-y-0' : 'translate-y-[calc(100%-5rem)]'
      }`}
    >
      {/* Drawer Handle */}
      <div 
        className="bg-white px-3 py-4 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] cursor-pointer flex items-center justify-between border-b border-gray-200 select-none hover:bg-gray-50 transition-colors"
        onClick={handleToggle}
      >
        <div className="w-8" />
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full transition-colors hover:bg-gray-400" />
          <div className="text-base font-semibold text-gray-800 text-center">
            {getResultText()}
          </div>
        </div>
        <button 
          className="w-8 h-8 flex items-center justify-center text-lg text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-full transition-colors"
          onClick={(e) => { e.stopPropagation(); handleClose(); }}
        >
          ×
        </button>
      </div>

      {/* Drawer Content */}
      <div className="bg-white max-h-[60vh] overflow-y-auto px-5 pb-5">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="loading-spinner mx-auto mb-4" />
            <div className="text-gray-600">Searching for properties...</div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏠</div>
            <div className="text-gray-600 text-lg">No properties found</div>
            <div className="text-gray-500 text-sm mt-2">
              Try adjusting your search criteria
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-5">
            {properties.map((property, index) => (
              <div 
                key={property.id || index}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 group"
                onClick={() => onPropertySelect && onPropertySelect(property)}
              >
                {/* Property Image */}
                <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl text-gray-400 group-hover:from-blue-50 group-hover:to-indigo-50 transition-colors">
                  🏠
                </div>
                
                {/* Property Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 leading-tight">
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
                    {property.parking > 0 && (
                      <div className="flex items-center gap-1">
                        <span>🚗</span>
                        <span>{property.parking}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-blue-600">
                      ${property.rent}/week
                    </div>
                    <div className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      View →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomDrawer;