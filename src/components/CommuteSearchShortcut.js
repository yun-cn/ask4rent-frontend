import React, { useCallback } from 'react';
import { LoadingSpinner } from '../utils/icons';

const CommuteSearchShortcut = ({ onShowCommuteSearch, isLoading }) => {
  const handleShowCommuteSearch = useCallback(() => {
    if (onShowCommuteSearch) {
      onShowCommuteSearch();
    }
  }, [onShowCommuteSearch]);

  return (
    <div className="relative group">
      <button
        onClick={handleShowCommuteSearch}
        disabled={isLoading}
        className={`w-24 h-24 rounded-3xl transition-all duration-500 ease-out flex flex-col items-center justify-center relative overflow-hidden shadow-xl ${
          isLoading
            ? 'bg-gray-100 cursor-not-allowed'
            : 'bg-gradient-to-br from-orange-400 via-orange-500 to-red-600 hover:from-orange-500 hover:via-red-500 hover:to-red-700 hover:shadow-2xl hover:shadow-orange-500/30 transform hover:scale-125 hover:-translate-y-3 active:scale-105 active:translate-y-0'
        }`}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
        
        {/* Content */}
        <div className="relative z-10 transition-all duration-300">
          {isLoading ? (
            <LoadingSpinner size="lg" className="text-orange-600" />
          ) : (
            <>
              <div className="text-4xl mb-2 drop-shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                🚗
              </div>
              <span className="text-xs text-white/95 font-bold tracking-wider drop-shadow-sm group-hover:text-white transition-colors duration-300 uppercase">
                COMMUTE
              </span>
            </>
          )}
        </div>
        
        {/* Enhanced shine effect */}
        {!isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
        )}
        
        {/* Pulse ring on hover */}
        {!isLoading && (
          <div className="absolute inset-0 rounded-3xl border-2 border-white/50 scale-100 opacity-0 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500"></div>
        )}

      </button>
      
      {/* Tooltip */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-gray-900 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
          Isochrone Commute Search
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

export default CommuteSearchShortcut;