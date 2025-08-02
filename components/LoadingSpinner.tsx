
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-24 h-24">
        <div className="absolute border-4 border-cyber-neon-blue/20 rounded-full w-full h-full"></div>
        <div className="absolute border-t-4 border-cyber-neon-blue rounded-full w-full h-full animate-spin"></div>
      </div>
      <p className="text-cyber-text-secondary tracking-widest animate-pulse">LOADING DATA...</p>
    </div>
  );
};

export default LoadingSpinner;
