import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = ({ message = 'Loading...', size = 'md', className = '' }) => {
  const iconSizes = {
    sm: 18,
    md: 26,
    lg: 40,
  };

  return (
    <div 
      role="status" 
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-6 text-center ${className}`}
    >
      <Loader2 
        size={iconSizes[size] || 26} 
        className="animate-spin text-secondary mb-3" 
        aria-hidden="true" 
      />
      <p className="text-slate-600 font-medium tracking-wide animate-pulse">
        {message}
      </p>
      <span className="sr-only">{message}</span>
    </div>
  );
};

export default LoadingState;
