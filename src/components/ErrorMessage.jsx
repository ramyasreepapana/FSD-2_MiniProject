import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

const ErrorMessage = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  className = '',
}) => {
  return (
    <div 
      role="alert"
      className={`p-4 md:p-5 rounded-2xl bg-red-50/80 border border-red-200 text-red-900 shadow-sm ${className}`}
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1">
          <h4 className="font-semibold text-sm md:text-base text-red-800">
            {title}
          </h4>
          <p className="mt-1 text-xs md:text-sm text-red-700 leading-relaxed">
            {message}
          </p>

          {onRetry && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-semibold rounded-lg transition shadow-xs focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{retryLabel}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
