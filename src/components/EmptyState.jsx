import React from 'react';

const EmptyState = ({
  icon = '🌍',
  title = 'No Results Found',
  description = 'Nothing matches your current criteria.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-soft max-w-lg mx-auto ${className}`}>
      <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-3xl md:text-4xl mb-4 shadow-inner">
        <span role="img" aria-label="Icon">
          {icon}
        </span>
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">
        {title}
      </h3>

      <p className="text-slate-600 text-sm md:text-base max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-6 py-2.5 bg-primary hover:bg-primary-light active:scale-95 text-white font-medium text-sm rounded-xl transition duration-200 shadow-sm focus:ring-2 focus:ring-secondary focus:outline-none"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
