/**
 * Legacy Supabase Adapter (Migrated to Node.js & Express / MongoDB)
 * 
 * Authentication and trip persistence have been migrated to the Express REST API
 * (src/services/authService.js and src/services/tripService.js).
 * 
 * This file remains as a backward-compatible bridge for any legacy imports.
 */

import { tripService as realTripService, normalizeTripRecord as realNormalizeTripRecord } from './tripService.js';

export const isSupabaseConfigured = false;
export const supabase = null;

export const normalizeTripRecord = realNormalizeTripRecord;
export const tripService = realTripService;

export const demoAuth = {
  getUser: () => null,
  setUser: () => {},
};

export default tripService;
