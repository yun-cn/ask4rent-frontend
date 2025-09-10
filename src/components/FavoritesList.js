import React, { useEffect, useState } from 'react';
import { useFavorites } from '../hooks/useFavorites';
import FavoriteButton from './FavoriteButton';
import FavoriteStatusInfo from './FavoriteStatusInfo';
import { LoadingSpinner } from '../utils/icons';

const FavoritesList = ({ isVisible, onClose }) => {
  const { favorites, loading, error, loadFavorites } = useFavorites();
  const [showDetails, setShowDetails] = useState({});

  useEffect(() => {
    if (isVisible) {
      loadFavorites();
    }
  }, [isVisible, loadFavorites]);

  const toggleDetails = (listingId) => {
    setShowDetails(prev => ({
      ...prev,
      [listingId]: !prev[listingId]
    }));
  };

  const formatPrice = (price) => {
    if (!price) return 'Price not available';
    return `$${price}/week`;
  };

  const formatBedrooms = (bedrooms) => {
    if (!bedrooms || bedrooms === 0) return 'Studio';
    return `${bedrooms} bed${bedrooms > 1 ? 's' : ''}`;
  };

  const formatBathrooms = (bathrooms) => {
    if (!bathrooms || bathrooms === 0) return '';
    return `${bathrooms} bath${bathrooms > 1 ? 's' : ''}`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">My Favorites</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Status Info */}
          <FavoriteStatusInfo className="mb-6" />

          {loading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && favorites.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
              <p className="text-gray-500">Start adding properties to your favorites to see them here.</p>
            </div>
          )}

          {!loading && !error && favorites.length > 0 && (
            <div className="grid gap-4">
              {favorites.map((favorite, index) => (
                <div key={favorite.listing_id || favorite.id || index} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {favorite.property?.address || favorite.address || 'Address not available'}
                        </h3>
                        <FavoriteButton 
                          listingId={favorite.listing_id || favorite.id}
                          size="small"
                        />
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="font-semibold text-blue-600">
                          {formatPrice(favorite.property?.rent_per_week || favorite.rent_per_week || favorite.price)}
                        </span>
                        {(favorite.property?.bedrooms !== undefined || favorite.bedrooms !== undefined || favorite.beds !== undefined) && (
                          <span>{formatBedrooms(favorite.property?.bedrooms || favorite.bedrooms || favorite.beds)}</span>
                        )}
                        {(favorite.property?.bathrooms !== undefined || favorite.bathrooms !== undefined || favorite.baths !== undefined) && (
                          <span>{formatBathrooms(favorite.property?.bathrooms || favorite.bathrooms || favorite.baths)}</span>
                        )}
                      </div>

                      {/* Additional details */}
                      {showDetails[favorite.listing_id || favorite.id] && (
                        <div className="mt-3 p-3 bg-white rounded border text-sm text-gray-600">
                          <div className="grid grid-cols-2 gap-2">
                            {favorite.listing_id && (
                              <div><strong>Listing ID:</strong> {favorite.listing_id}</div>
                            )}
                            {(favorite.property?.property_type || favorite.property_type) && (
                              <div><strong>Type:</strong> {favorite.property?.property_type || favorite.property_type}</div>
                            )}
                            {((favorite.property?.longitude && favorite.property?.latitude) || 
                              (favorite.coordinates?.lon && favorite.coordinates?.lat)) && (
                              <div><strong>Location:</strong> {(favorite.property?.latitude || favorite.coordinates?.lat)?.toFixed(4)}, {(favorite.property?.longitude || favorite.coordinates?.lon)?.toFixed(4)}</div>
                            )}
                            {favorite.added_date && (
                              <div><strong>Added:</strong> {new Date(favorite.added_date).toLocaleDateString()}</div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <button
                          onClick={() => toggleDetails(favorite.listing_id || favorite.id)}
                          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {showDetails[favorite.listing_id || favorite.id] ? 'Hide Details' : 'Show Details'}
                        </button>
                        
                        {((favorite.property?.longitude && favorite.property?.latitude) || 
                          (favorite.coordinates?.lon && favorite.coordinates?.lat)) && (
                          <button
                            onClick={() => {
                              // This could trigger showing the property on the map
                              console.log('Show on map:', favorite);
                            }}
                            className="text-sm text-green-600 hover:text-green-800 transition-colors"
                          >
                            View on Map
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && favorites.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600 text-center">
              {favorites.length} propert{favorites.length !== 1 ? 'ies' : 'y'} in your favorites
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesList;