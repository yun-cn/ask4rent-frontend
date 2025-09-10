import React, { useState, useEffect } from 'react';
import { getIcon } from '../utils/icons';

const NotificationToast = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <Toast 
          key={notification.id} 
          notification={notification} 
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};

const Toast = ({ notification, onDismiss }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (notification.autoClose !== false) {
      const timer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(() => {
          onDismiss(notification.id);
        }, 300); // Animation duration
      }, notification.duration || 4000);

      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  };

  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: 'text-green-500',
          iconName: 'checkCircle',
          text: 'text-green-800',
          title: 'text-green-900'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'text-red-500',
          iconName: 'exclamation',
          text: 'text-red-800',
          title: 'text-red-900'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-500',
          iconName: 'alert',
          text: 'text-yellow-800',
          title: 'text-yellow-900'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-500',
          iconName: 'info',
          text: 'text-blue-800',
          title: 'text-blue-900'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`
      transform transition-all duration-300 ease-in-out
      ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      ${!isLeaving ? 'scale-100' : 'scale-95'}
    `}>
      <div className={`
        relative rounded-lg border p-4 shadow-lg backdrop-blur-sm
        ${styles.bg}
        min-w-[320px] max-w-sm
      `}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${styles.icon}`}>
            {getIcon(styles.iconName, 'lg')}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {notification.title && (
              <h4 className={`text-sm font-semibold mb-1 ${styles.title}`}>
                {notification.title}
              </h4>
            )}
            <p className={`text-sm ${styles.text} leading-relaxed`}>
              {notification.message}
            </p>
            
            {notification.action && (
              <div className="mt-3">
                <button
                  onClick={notification.action.onClick}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                    notification.type === 'success' 
                      ? 'bg-green-100 hover:bg-green-200 text-green-700'
                      : notification.type === 'error'
                      ? 'bg-red-100 hover:bg-red-200 text-red-700' 
                      : notification.type === 'warning'
                      ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                  }`}
                >
                  {notification.action.label}
                </button>
              </div>
            )}
          </div>
          
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className={`flex-shrink-0 p-1 rounded-full transition-colors hover:bg-black/5 ${styles.icon}`}
          >
            {getIcon('close', 'sm')}
          </button>
        </div>
        
        {/* Progress bar for auto-close */}
        {notification.autoClose !== false && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 rounded-b-lg overflow-hidden">
            <div 
              className={`h-full transition-all ease-linear ${
                notification.type === 'success' ? 'bg-green-400' :
                notification.type === 'error' ? 'bg-red-400' :
                notification.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
              }`}
              style={{
                animation: `shrink ${notification.duration || 4000}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// CSS for progress bar animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;
document.head.appendChild(style);

export default NotificationToast;