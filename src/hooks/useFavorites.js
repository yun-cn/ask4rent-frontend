import { useState, useEffect, useCallback } from 'react';
import { addFavorite, removeFavorite, getFavorites } from '../services/api';
import { getStoredSession } from '../services/api';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get current session
  const getSession = useCallback(() => {
    return getStoredSession();
  }, []);

  // Load favorites from backend
  const loadFavorites = useCallback(async () => {
    let sessionId = getSession();
    
    // If no session exists, try to create one
    if (!sessionId) {
      console.log('No session available, attempting to create new session');
      try {
        const { getSession: createSession } = await import('../services/api');
        const sessionResult = await createSession();
        if (sessionResult.success) {
          sessionId = sessionResult.sessionId;
        } else {
          console.error('Failed to create session');
          setError('Failed to create session');
          return;
        }
      } catch (err) {
        console.error('Error creating session:', err);
        setError('Failed to create session');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getFavorites(sessionId);
      if (result.success) {
        setFavorites(result.favorites || []);
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
  }, [getSession]);

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
        await loadFavorites();
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
        // Reload favorites to get updated list
        await loadFavorites();
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
    loadFavorites();
  }, [loadFavorites]);

  // Listen for storage changes (including session changes after logout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'ask4rent_session' || e.key === 'ask4rent_access_token') {
        console.log('Session or auth changed, reloading favorites');
        loadFavorites();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadFavorites]);

  // Listen for logout events to refresh favorites
  useEffect(() => {
    const handleUserLoggedOut = () => {
      console.log('User logged out, refreshing favorites');
      setFavorites([]);
      setError(null);
      setTimeout(() => loadFavorites(), 100); // Small delay to ensure new session is ready
    };

    window.addEventListener('userLoggedOut', handleUserLoggedOut);
    return () => window.removeEventListener('userLoggedOut', handleUserLoggedOut);
  }, [loadFavorites]);

  // Force refresh favorites (useful after logout)
  const refreshFavorites = useCallback(() => {
    setFavorites([]);
    setError(null);
    loadFavorites();
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