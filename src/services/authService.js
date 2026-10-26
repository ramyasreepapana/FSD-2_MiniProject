import api, { tokenStorage } from './api.js';

/**
 * Format user object to maintain backward compatibility with components
 * that read user.user_metadata.name or user.name
 */
export const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    user_metadata: {
      name: user.name || user.email?.split('@')[0] || 'Traveler',
      ...(user.user_metadata || {}),
    },
  };
};

export const authService = {
  /**
   * Register a new user account
   */
  async register(name, email, password) {
    const data = await api.post('/auth/register', { name, email, password });
    if (data.token) {
      tokenStorage.set(data.token);
    }
    return {
      token: data.token,
      user: normalizeUser(data.user),
    };
  },

  /**
   * Log into existing account
   */
  async login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    if (data.token) {
      tokenStorage.set(data.token);
    }
    return {
      token: data.token,
      user: normalizeUser(data.user),
    };
  },

  /**
   * Fetch current authenticated user profile
   */
  async getMe() {
    const token = tokenStorage.get();
    if (!token) return null;

    try {
      const data = await api.get('/auth/me');
      return normalizeUser(data.user);
    } catch (err) {
      tokenStorage.clear();
      return null;
    }
  },

  /**
   * Log out user
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Continue even if network error
    } finally {
      tokenStorage.clear();
    }
  },

  /**
   * Check if a token currently exists in storage
   */
  hasToken() {
    return Boolean(tokenStorage.get());
  },
};

export default authService;
