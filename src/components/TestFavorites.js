import React from 'react';
import { useFavorites } from '../hooks/useFavorites';
import FavoriteButton from './FavoriteButton';

const TestFavorites = () => {
  const { favorites, loading, error, addToFavorites, removeFromFavorites, isFavorited } = useFavorites();

  const testProperty = {
    id: 12345,
    address: "Test Property Address",
    rent_per_week: 600,
    bedrooms: 3,
    bathrooms: 2
  };

  const handleTestAdd = async () => {
    console.log('Testing add to favorites...');
    const result = await addToFavorites(testProperty.id);
    console.log('Add result:', result);
  };

  const handleTestRemove = async () => {
    console.log('Testing remove from favorites...');
    const result = await removeFromFavorites(testProperty.id);
    console.log('Remove result:', result);
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Favorites Test Component</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Current Status:</h3>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
        <p>Favorites count: {favorites.length}</p>
        <p>Test property favorited: {isFavorited(testProperty.id) ? 'Yes' : 'No'}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Test Actions:</h3>
        <div className="flex gap-2 mb-4">
          <button 
            onClick={handleTestAdd}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Test Property
          </button>
          <button 
            onClick={handleTestRemove}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Remove Test Property
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <span>Favorite Button Component:</span>
          <FavoriteButton 
            listingId={testProperty.id}
            size="medium"
            showText={true}
          />
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Current Favorites:</h3>
        {favorites.length === 0 ? (
          <p className="text-gray-500">No favorites yet</p>
        ) : (
          <div className="space-y-2">
            {favorites.map((fav, index) => (
              <div key={fav.listing_id || index} className="p-2 bg-white rounded border">
                <p>ID: {fav.listing_id || 'N/A'}</p>
                <p>Address: {fav.address || 'N/A'}</p>
                <p>Added: {fav.added_date ? new Date(fav.added_date).toLocaleString() : 'N/A'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestFavorites;