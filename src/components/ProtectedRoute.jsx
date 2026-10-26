/**
 * Protected Route Component
 * 
 * Guards routes that require authentication (e.g. /plan, /trips).
 * Redirects unauthenticated users to /login with state for redirect-after-login.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import LoadingState from './LoadingState';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingState message="Verifying authentication..." size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location,
          message: 'Please log in or create an account to access this page.' 
        }} 
        replace 
      />
    );
  }

  return children;
};

export default ProtectedRoute;
