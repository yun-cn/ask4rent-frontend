import React, { useState } from 'react';
import { useFavorites } from '../hooks/useFavorites';

const FavoriteButton = ({ 
  listingId, 
  size = 'medium', 
  showText = false,
  className = '',
  onToggle
}) => {
  const { isFavorited, toggleFavorite } = useFavorites();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation(); // Prevent event bubbling
    
    if (isProcessing) return;

    // Validate listingId
    if (!listingId || isNaN(listingId)) {
      console.warn('Invalid listing ID:', listingId);
      if (onToggle) {
        onToggle(listingId, false, { success: false, error: 'Invalid listing ID' });
      }
      return;
    }

    setIsProcessing(true);
    try {
      const result = await toggleFavorite(parseInt(listingId));
      if (onToggle) {
        onToggle(listingId, !isFavorited(listingId), result);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      if (onToggle) {
        onToggle(listingId, false, { success: false, error: error.message });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const isCurrentlyFavorited = isFavorited(listingId);

  // Size configurations
  const sizeConfigs = {
    small: {
      button: 'w-6 h-6 text-xs',
      icon: 'text-sm',
      text: 'text-xs'
    },
    medium: {
      button: 'w-8 h-8 text-sm',
      icon: 'text-base',
      text: 'text-sm'
    },
    large: {
      button: 'w-10 h-10 text-base',
      icon: 'text-lg',
      text: 'text-base'
    }
  };

  const config = sizeConfigs[size] || sizeConfigs.medium;

  const buttonClasses = `
    inline-flex items-center justify-center
    ${config.button}
    rounded-full
    border-2
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed
    ${isCurrentlyFavorited 
      ? 'bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600 hover:scale-105 active:scale-95' 
      : 'bg-white border-gray-300 text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-500'
    }
    ${className}
  `.trim();

  const iconClasses = `
    ${config.icon}
    transition-transform duration-200
    ${isProcessing ? 'animate-pulse' : ''}
    ${isCurrentlyFavorited ? 'scale-110' : ''}
  `.trim();

  const HeartIcon = () => (
    <svg 
      className={iconClasses}
      fill={isCurrentlyFavorited ? 'currentColor' : 'none'}
      stroke="currentColor" 
      viewBox="0 0 24 24"
      strokeWidth={isCurrentlyFavorited ? 0 : 2}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
      />
    </svg>
  );

  if (showText) {
    return (
      <button
        onClick={handleToggle}
        disabled={isProcessing}
        className={`
          inline-flex items-center space-x-2 px-3 py-2 rounded-lg
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isCurrentlyFavorited 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300'
          }
          ${className}
        `.trim()}
      >
        <HeartIcon />
        <span className={config.text}>
          {isProcessing 
            ? (isCurrentlyFavorited ? 'Removing...' : 'Adding...') 
            : (isCurrentlyFavorited ? 'Favorited' : 'Add to Favorites')
          }
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isProcessing}
      className={buttonClasses}
      title={isCurrentlyFavorited ? 'Click to remove from favorites' : 'Add to favorites'}
      aria-label={isCurrentlyFavorited ? 'Click to remove from favorites' : 'Add to favorites'}
    >
      <HeartIcon />
    </button>
  );
};

export default FavoriteButton;