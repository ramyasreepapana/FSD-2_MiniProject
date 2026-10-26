/**
 * Authentication Context
 * 
 * Manages user authentication session, user profile, registration,
 * login, and logout against the Express / MongoDB backend.
 */

import React, { useState, useEffect } from 'react';
import authService, { normalizeUser } from '../services/authService';
import { AuthContext } from './authContextDef.js';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize auth state on mount by verifying stored token
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (authService.hasToken()) {
          const currentUser = await authService.getMe();
          if (mounted && currentUser) {
            setUser(currentUser);
            setSession({ user: currentUser });
          } else if (mounted) {
            setUser(null);
            setSession(null);
          }
        } else {
          if (mounted) {
            setUser(null);
            setSession(null);
          }
        }
      } catch (err) {
        console.error('Error during auth initialization:', err);
        if (mounted) {
          setUser(null);
          setSession(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Listen for session expired events from the API client
    const handleSessionExpired = () => {
      if (mounted) {
        setUser(null);
        setSession(null);
        setAuthError('Your session has expired. Please log in again.');
      }
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      mounted = false;
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, []);

  /**
   * Log In
   */
  const login = async (email, password) => {
    setAuthError(null);

    try {
      const { user: loggedInUser } = await authService.login(email.trim().toLowerCase(), password);
      setUser(loggedInUser);
      setSession({ user: loggedInUser });
      return loggedInUser;
    } catch (err) {
      const friendlyMessage = err.message || 'Login failed. Please check your credentials.';
      setAuthError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  /**
   * Sign Up
   */
  const signup = async (name, email, password) => {
    setAuthError(null);

    try {
      const { user: registeredUser } = await authService.register(
        name.trim(),
        email.trim().toLowerCase(),
        password
      );
      setUser(registeredUser);
      setSession({ user: registeredUser });
      return { user: registeredUser, requiresEmailConfirmation: false };
    } catch (err) {
      const friendlyMessage = err.message || 'Registration failed. Please try again.';
      setAuthError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  /**
   * Log Out
   */
  const logout = async () => {
    setAuthError(null);
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setSession(null);
    }
  };

  const clearAuthError = () => setAuthError(null);

  const value = {
    user,
    session,
    loading,
    authError,
    isAuthenticated: Boolean(user),
    isSupabaseConfigured: false,
    login,
    signup,
    logout,
    clearAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
