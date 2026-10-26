import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
      ? navigator.onLine
      : true
  );
  const [showReconnectedToast, setShowReconnectedToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedToast(true);
      const timer = setTimeout(() => {
        setShowReconnectedToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedToast(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* Offline Alert Banner (Fixed Non-blocking Top Bar) */}
      {!isOnline && (
        <div 
          role="alert" 
          aria-live="assertive"
          className="sticky top-0 z-50 bg-amber-500 text-slate-900 border-b border-amber-600 px-4 py-2.5 shadow-md transition-all duration-300"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-900 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-950"></span>
              </span>
              <WifiOff className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>⚠️ You're offline:</strong> Some features may not be available until your internet connection is restored.
              </span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-amber-900/10 hover:bg-amber-900/20 active:scale-95 px-2.5 py-1 rounded text-xs font-semibold underline underline-offset-2 flex-shrink-0"
            >
              Check Connection
            </button>
          </div>
        </div>
      )}

      {/* Reconnected Notification Toast */}
      {showReconnectedToast && (
        <div 
          role="status" 
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-elevated flex items-center space-x-2.5 animate-bounce text-sm font-semibold"
        >
          <Wifi className="w-5 h-5 text-emerald-100" />
          <span>✓ You're back online!</span>
        </div>
      )}
    </>
  );
};

export default OfflineBanner;
