import { useState, useCallback } from 'react';

export const useMapOverlay = () => {
  const [overlay, setOverlay] = useState(null);

  const showOverlay = useCallback((message, options = {}) => {
    const id = Date.now();
    const newOverlay = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || 5000,
      actions: options.actions || [],
      ...options
    };
    
    setOverlay(newOverlay);
    return id;
  }, []);

  const hideOverlay = useCallback(() => {
    setOverlay(null);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message, options = {}) => {
    return showOverlay(message, { ...options, type: 'success' });
  }, [showOverlay]);

  const showError = useCallback((message, options = {}) => {
    return showOverlay(message, { ...options, type: 'error' });
  }, [showOverlay]);

  const showWarning = useCallback((message, options = {}) => {
    return showOverlay(message, { ...options, type: 'warning' });
  }, [showOverlay]);

  const showInfo = useCallback((message, options = {}) => {
    return showOverlay(message, { ...options, type: 'info' });
  }, [showOverlay]);

  return {
    overlay,
    showOverlay,
    hideOverlay,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};