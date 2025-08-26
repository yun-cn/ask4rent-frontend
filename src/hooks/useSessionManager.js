import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getSession, 
  refreshSession, 
  getStoredSession, 
  updateLastActivity, 
  clearSession 
} from '../services/api';

export const useSessionManager = () => {
  const [sessionId, setSessionId] = useState(null);
  const [isSessionValid, setIsSessionValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimeoutRef = useRef(null);
  const sessionCheckIntervalRef = useRef(null);

  // Initialize session on component mount
  const initializeSession = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Check if there's a valid stored session first
      const storedSessionId = getStoredSession();
      
      if (storedSessionId) {
        // Try to refresh the existing session
        const refreshResponse = await refreshSession(storedSessionId);
        if (refreshResponse.success) {
          setSessionId(storedSessionId);
          setIsSessionValid(true);
          console.log('Restored existing session:', storedSessionId);
          return;
        }
      }
      
      // Create new session if no valid stored session exists
      const response = await getSession();
      if (response.success) {
        setSessionId(response.sessionId);
        setIsSessionValid(true);
        console.log('Created new session:', response.sessionId);
      } else {
        console.error('Failed to create session:', response.error);
        setIsSessionValid(false);
      }
    } catch (error) {
      console.error('Session initialization error:', error);
      setIsSessionValid(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh session and update activity timestamp
  const handleRefreshSession = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const response = await refreshSession(sessionId);
      if (response.success) {
        updateLastActivity();
        console.log('Session refreshed successfully');
      } else {
        console.error('Failed to refresh session, creating new one');
        await initializeSession();
      }
    } catch (error) {
      console.error('Session refresh error:', error);
      await initializeSession();
    }
  }, [sessionId, initializeSession]);

  // Handle user interaction to refresh session
  const handleUserInteraction = useCallback(() => {
    if (!sessionId || !isSessionValid) return;
    
    updateLastActivity();
    
    // Clear existing timeout and set a new one
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Refresh session after a short delay to avoid too frequent API calls
    refreshTimeoutRef.current = setTimeout(() => {
      handleRefreshSession();
    }, 1000); // 1 second delay
  }, [sessionId, isSessionValid, handleRefreshSession]);

  // Check session validity periodically
  const checkSessionValidity = useCallback(() => {
    const storedSessionId = getStoredSession();
    if (!storedSessionId && isSessionValid) {
      console.log('Session expired, clearing state');
      setIsSessionValid(false);
      setSessionId(null);
    }
  }, [isSessionValid]);

  // Set up event listeners for user interactions
  useEffect(() => {
    if (!sessionId || !isSessionValid) return;

    const interactionEvents = [
      'click', 
      'keydown', 
      'scroll', 
      'mousemove', 
      'touchstart'
    ];

    // Add event listeners
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { passive: true });
    });

    // Set up periodic session validity check (every minute)
    sessionCheckIntervalRef.current = setInterval(checkSessionValidity, 60000);

    // Cleanup function
    return () => {
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
      
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [sessionId, isSessionValid, handleUserInteraction, checkSessionValidity]);

  // Handle page unload (browser close/refresh)
  useEffect(() => {
    const handleBeforeUnload = () => {
      clearSession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Page is hidden (tab switched, minimized, etc.)
        updateLastActivity();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, []);

  return {
    sessionId,
    isSessionValid,
    isLoading,
    refreshSession: handleRefreshSession,
    initializeSession
  };
};