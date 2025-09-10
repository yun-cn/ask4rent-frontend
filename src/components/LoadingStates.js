import React from 'react';
import { getIcon, LoadingSpinner } from '../utils/icons';

// Enhanced loading spinner with context
export const ContextualLoader = ({ 
  size = 'md', 
  message = 'Loading...', 
  submessage = null,
  type = 'default' // default, search, data, school, zone
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'search':
        return {
          icon: 'search',
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          message: message || 'Searching properties...'
        };
      case 'school':
        return {
          icon: 'graduation',
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          message: message || 'Loading school data...'
        };
      case 'zone':
        return {
          icon: 'mapPin',
          color: 'text-purple-500',
          bgColor: 'bg-purple-50',
          message: message || 'Loading zones...'
        };
      case 'data':
        return {
          icon: 'loader',
          color: 'text-indigo-500',
          bgColor: 'bg-indigo-50',
          message: message || 'Processing data...'
        };
      default:
        return {
          icon: 'loader',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          message: message
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="text-center py-16">
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${styles.bgColor} mb-4`}>
        <LoadingSpinner size={size} className={styles.color} />
      </div>
      <p className="text-gray-700 text-lg font-medium mb-2">{styles.message}</p>
      {submessage && (
        <p className="text-gray-500 text-sm max-w-sm mx-auto">{submessage}</p>
      )}
    </div>
  );
};

// Skeleton loader for property cards
export const PropertyCardSkeleton = () => (
  <div className="bg-white border rounded-xl overflow-hidden animate-pulse">
    {/* Image skeleton */}
    <div className="h-28 bg-gray-200"></div>
    
    {/* Content skeleton */}
    <div className="p-3">
      {/* Title */}
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
      
      {/* Details */}
      <div className="flex gap-2 mb-3">
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 rounded-full w-12"></div>
      </div>
      
      {/* Price and button */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="h-8 bg-gray-200 rounded-full w-24"></div>
      </div>
    </div>
  </div>
);

// Empty state with helpful suggestions
export const EmptyState = ({ 
  icon = 'home', 
  title = 'No results found',
  message = 'Try adjusting your search criteria',
  action = null,
  type = 'default'
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'search':
        return {
          icon: 'search',
          iconColor: 'text-blue-400',
          title: title || 'No properties found',
          message: message || 'Try different search terms or explore other areas'
        };
      case 'school':
        return {
          icon: 'graduation',
          iconColor: 'text-green-400',
          title: title || 'No schools found',
          message: message || 'Try selecting a different territorial authority'
        };
      case 'zone':
        return {
          icon: 'mapPin',
          iconColor: 'text-purple-400',
          title: title || 'No zones available',
          message: message || 'Zone data might not be available for this area'
        };
      default:
        return {
          icon: icon,
          iconColor: 'text-gray-400',
          title: title,
          message: message
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
        {getIcon(styles.icon, 'xxxl', 'muted')}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{styles.title}</h3>
      <p className="text-gray-500 text-base max-w-sm mx-auto mb-6 leading-relaxed">
        {styles.message}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          {action.icon && getIcon(action.icon, 'sm', 'white')}
          <span>{action.label}</span>
        </button>
      )}
    </div>
  );
};

// Error state with retry functionality
export const ErrorState = ({ 
  title = 'Something went wrong',
  message = 'Please try again or contact support if the problem persists',
  onRetry = null,
  technical = null
}) => (
  <div className="text-center py-16 px-4">
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
      {getIcon('exclamation', 'xxxl', 'danger')}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 text-base max-w-sm mx-auto mb-6 leading-relaxed">
      {message}
    </p>
    
    <div className="flex items-center justify-center gap-3">
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          {getIcon('arrow', 'sm', 'white')}
          <span>Try Again</span>
        </button>
      )}
      
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
      >
        {getIcon('arrow', 'sm', 'secondary')}
        <span>Refresh Page</span>
      </button>
    </div>
    
    {technical && (
      <details className="mt-6 text-left max-w-md mx-auto">
        <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
          Technical details
        </summary>
        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700 overflow-auto">
          {technical}
        </pre>
      </details>
    )}
  </div>
);

// Progress indicator for multi-step processes
export const ProgressIndicator = ({ 
  steps = [], 
  currentStep = 0,
  className = '' 
}) => (
  <div className={`flex items-center justify-center gap-2 ${className}`}>
    {steps.map((step, index) => (
      <React.Fragment key={index}>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors ${
          index < currentStep 
            ? 'bg-green-500 text-white' 
            : index === currentStep
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-500'
        }`}>
          {index < currentStep ? (
            getIcon('checkCircle', 'sm', 'white')
          ) : (
            <span>{index + 1}</span>
          )}
        </div>
        {index < steps.length - 1 && (
          <div className={`w-12 h-1 rounded-full ${
            index < currentStep ? 'bg-green-500' : 'bg-gray-200'
          }`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

const LoadingStates = {
  ContextualLoader,
  PropertyCardSkeleton,
  EmptyState,
  ErrorState,
  ProgressIndicator
};

export default LoadingStates;