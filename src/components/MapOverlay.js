import React, { useState, useEffect, useCallback } from 'react';
import { getIcon } from '../utils/icons';

const MapOverlay = ({ message, type = 'info', onDismiss, duration = 5000, actions = [] }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 300);
  }, [onDismiss]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleDismiss]);


  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          text: 'text-white',
          border: 'border-green-600',
          icon: 'checkCircle'
        };
      case 'warning':
        return {
          bg: 'bg-amber-500',
          text: 'text-white',
          border: 'border-amber-600',
          icon: 'alert'
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          text: 'text-white',
          border: 'border-red-600',
          icon: 'exclamation'
        };
      default:
        return {
          bg: 'bg-blue-500',
          text: 'text-white',
          border: 'border-blue-600',
          icon: 'info'
        };
    }
  };

  const styles = getTypeStyles();

  // Component is always visible when rendered

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] max-w-md transition-all duration-300 ${
      isLeaving ? 'opacity-0 -translate-y-2 scale-95' : 'opacity-100 translate-y-0 scale-100'
    }`}>
      <div className={`${styles.bg} ${styles.text} ${styles.border} border-2 rounded-lg shadow-2xl p-4`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(styles.icon, 'lg', 'white')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-relaxed">
              {message}
            </p>
            
            {actions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick();
                      handleDismiss();
                    }}
                    className="text-xs px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors font-medium"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            {getIcon('close', 'sm', 'white')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapOverlay;