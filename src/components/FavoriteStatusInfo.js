import React from 'react';
import { isLoggedIn } from '../services/api';

const FavoriteStatusInfo = ({ className = '' }) => {
  const userLoggedIn = isLoggedIn();

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {userLoggedIn ? (
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            {userLoggedIn ? 'Account Favorites' : 'Guest Favorites'}
          </h3>
          <div className="text-sm text-gray-700">
            {userLoggedIn ? (
              <div>
                <p className="mb-2">✅ Your favorites are saved permanently to your account</p>
                <p className="text-xs text-gray-600">
                  You can access them from any device by logging in
                </p>
              </div>
            ) : (
              <div>
                <p className="mb-2">⚠️ Your favorites are saved temporarily to this browser session</p>
                <p className="text-xs text-gray-600 mb-2">
                  They may be lost when you close your browser or after some time
                </p>
                <p className="text-xs font-medium text-blue-600">
                  💡 <a href="/auth" className="underline hover:text-blue-800">Sign up or log in</a> to save favorites permanently
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoriteStatusInfo;