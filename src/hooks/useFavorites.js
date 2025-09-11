import { useState, useEffect, useCallback } from 'react';
import { addFavorite, removeFavorite, getFavorites } from '../services/api';
import { getStoredSession } from '../services/api';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastLoadTime, setLastLoadTime] = useState(0);
  
  // Cache duration: 30 seconds
  const CACHE_DURATION = 30000;

  // Get current session
  const getSession = useCallback(() => {
    return getStoredSession();
  }, []);

  // Load favorites from backend with caching
  const loadFavorites = useCallback(async (forceRefresh = false) => {
    let sessionId = getSession();
    
    // If no session exists, just clear favorites and return
    if (!sessionId) {
      console.log('No session found for favorites');
      setFavorites([]);
      setError(null);
      return;
    }

    // Check cache if not forcing refresh
    const now = Date.now();
    if (!forceRefresh && (now - lastLoadTime) < CACHE_DURATION) {
      console.log('Using cached favorites data');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getFavorites(sessionId);
      if (result.success) {
        setFavorites(result.favorites || []);
        setLastLoadTime(now);
      } else {
        setError(result.error || 'Failed to load favorites');
        setFavorites([]);
      }
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Failed to load favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [getSession, lastLoadTime, CACHE_DURATION]);

  // Add a property to favorites
  const addToFavorites = useCallback(async (listingId) => {
    const sessionId = getSession();
    if (!sessionId) {
      setError('No session available');
      return { success: false, error: 'No session available' };
    }

    try {
      setError(null);
      const result = await addFavorite(sessionId, listingId);
      
      if (result.success) {
        // Reload favorites to get updated list
        await loadFavorites(true);
        return { success: true };
      } else {
        setError(result.error || 'Failed to add to favorites');
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error adding to favorites:', err);
      const errorMsg = 'Failed to add to favorites';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [getSession, loadFavorites]);

  // Remove a property from favorites
  const removeFromFavorites = useCallback(async (listingId) => {
    const sessionId = getSession();
    if (!sessionId) {
      setError('No session available');
      return { success: false, error: 'No session available' };
    }

    try {
      setError(null);
      const result = await removeFavorite(sessionId, listingId);
      
      if (result.success && result.result) {
        // Force reload favorites to get updated list
        await loadFavorites(true);
        return { success: true };
      } else {
        setError(result.error || 'Failed to remove from favorites');
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error removing from favorites:', err);
      const errorMsg = 'Failed to remove from favorites';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [getSession, loadFavorites]);

  // Check if a property is favorited
  const isFavorited = useCallback((listingId) => {
    return favorites.some(fav => fav.listing_id === listingId || fav.id === listingId);
  }, [favorites]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (listingId) => {
    const isCurrentlyFavorited = isFavorited(listingId);
    
    if (isCurrentlyFavorited) {
      return await removeFromFavorites(listingId);
    } else {
      return await addToFavorites(listingId);
    }
  }, [isFavorited, addToFavorites, removeFromFavorites]);

  // Load favorites on mount and when session changes
  useEffect(() => {
    // Only load favorites if we have a valid session
    const sessionId = getSession();
    if (sessionId) {
      loadFavorites();
    }
  }, [loadFavorites, getSession]);

  // Listen for storage changes (including session changes after logout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'ask4rent_session' || e.key === 'ask4rent_access_token') {
        console.log('Session or auth changed, reloading favorites');
        // Only reload if we have a valid session
        const sessionId = getSession();
        if (sessionId) {
          loadFavorites();
        } else {
          // Clear favorites if no session
          setFavorites([]);
          setError(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadFavorites, getSession]);

  // Listen for logout events to refresh favorites
  useEffect(() => {
    const handleUserLoggedOut = () => {
      console.log('User logged out, clearing favorites');
      setFavorites([]);
      setError(null);
      // Don't automatically reload after logout - let user action trigger it
    };

    window.addEventListener('userLoggedOut', handleUserLoggedOut);
    return () => window.removeEventListener('userLoggedOut', handleUserLoggedOut);
  }, []);

  // Force refresh favorites (useful after logout)
  const refreshFavorites = useCallback(() => {
    setFavorites([]);
    setError(null);
    setLastLoadTime(0); // Reset cache
    loadFavorites(true);
  }, [loadFavorites]);

  return {
    favorites,
    loading,
    error,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorited,
    loadFavorites,
    refreshFavorites
  };
};