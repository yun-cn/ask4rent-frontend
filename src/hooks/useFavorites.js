import { useState, useEffect, useCallback } from 'react';
import { addFavorite, removeFavorite, getFavorites } from '../services/api';
import { getStoredSession } from '../services/api';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastLoadTime, setLastLoadTime] = useState(0);
  
  const CACHE_DURATION = 300000;

  const getSession = useCallback(() => {
    return getStoredSession();
  }, []);
  const loadFavorites = useCallback(async (forceRefresh = false) => {
    let sessionId = getSession();
    
    if (!sessionId) {
      setFavorites([]);
      setError(null);
      return;
    }

    const now = Date.now();
    if (!forceRefresh && (now - lastLoadTime) < CACHE_DURATION) {
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
      if (err.message && (err.message.includes('CORS') || err.message.includes('Failed to fetch'))) {
        setFavorites([]);
        setError(null);
        setLastLoadTime(now);
      } else {
        console.error('Error loading favorites:', err);
        setError('Failed to load favorites');
        setFavorites([]);
        setLastLoadTime(now);
      }
    } finally {
      setLoading(false);
    }
  }, [getSession, lastLoadTime, CACHE_DURATION]);

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
        setTimeout(() => loadFavorites(true), 100);
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

  const isFavorited = useCallback((listingId) => {
    return favorites.some(fav => fav.listing_id === listingId || fav.id === listingId);
  }, [favorites]);

  const toggleFavorite = useCallback(async (listingId) => {
    const isCurrentlyFavorited = isFavorited(listingId);
    
    if (isCurrentlyFavorited) {
      return await removeFromFavorites(listingId);
    } else {
      return await addToFavorites(listingId);
    }
  }, [isFavorited, addToFavorites, removeFromFavorites]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'ask4rent_session' || e.key === 'ask4rent_access_token' || e.key === 'ask4rent_user') {
        const sessionId = getSession();
        if (!sessionId) {
          setFavorites([]);
          setError(null);
          setLastLoadTime(0);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [getSession]);

  useEffect(() => {
    const handleUserLoggedIn = () => {
      setLastLoadTime(0);
    };

    const handleUserLoggedOut = () => {
      setFavorites([]);
      setError(null);
      setLastLoadTime(0);
    };

    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    window.addEventListener('userLoggedOut', handleUserLoggedOut);
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLoggedIn);
      window.removeEventListener('userLoggedOut', handleUserLoggedOut);
    };
  }, []);

  const refreshFavorites = useCallback(() => {
    setFavorites([]);
    setError(null);
    setLastLoadTime(0);
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