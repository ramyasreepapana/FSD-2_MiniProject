/**
 * Validation Utility
 * 
 * Handles client-side validation for trip planning inputs and authentication forms.
 * Provides clear, accessible inline errors and guards against malicious or overflowing inputs.
 */

import { destinationCosts } from '../data/destinationCosts.js';

export const MAX_INPUT_LENGTH = 150; // Guard against 400+ character spam
export const ALLOWED_TRAVEL_STYLES = ['budget', 'moderate', 'premium'];

/**
 * Validate trip planning form fields
 * 
 * @param {Object} formData
 * @returns {Object} { isValid: boolean, errors: Object, formError: string|null }
 */
export const validateTripForm = (formData) => {
  const errors = {};
  let formError = null;

  const { origin, originLocation, destination, budget, travelers, duration, travelStyle } = formData;

  // 1. Origin (Starting Location)
  if (!origin || (typeof origin === 'string' && !origin.trim())) {
    errors.origin = 'Starting location is required.';
  } else if (typeof origin === 'string' && origin.length > MAX_INPUT_LENGTH) {
    errors.origin = `Starting location must not exceed ${MAX_INPUT_LENGTH} characters.`;
  } else if (typeof origin === 'string' && origin.trim().length < 2) {
    errors.origin = 'Starting location must be at least 2 characters.';
  } else if (originLocation !== undefined) {
    // If originLocation is evaluated, verify it is a recognized resolved location object
    if (!originLocation || typeof originLocation !== 'object' || !originLocation.name || typeof originLocation.latitude !== 'number') {
      errors.origin = 'Please select a valid recognized location from the suggestions.';
    }
  }

  // 2. Destination
  if (!destination || (typeof destination === 'string' && !destination.trim())) {
    errors.destination = 'Destination is required.';
  } else if (!destinationCosts[destination]) {
    errors.destination = 'Please select a supported destination from the list.';
  }

  // 3. Travel Style
  if (travelStyle !== undefined) {
    if (!travelStyle || !ALLOWED_TRAVEL_STYLES.includes(travelStyle)) {
      errors.travelStyle = 'Please select a valid travel style: Budget, Moderate, or Premium.';
    }
  }

  // 3. Budget
  if (budget === undefined || budget === null || String(budget).trim() === '') {
    errors.budget = 'Total budget is required.';
  } else {
    const numBudget = Number(budget);
    if (isNaN(numBudget)) {
      errors.budget = 'Budget must be a valid number.';
    } else if (numBudget <= 0) {
      errors.budget = 'Budget must be greater than ₹0.';
    } else if (numBudget > 10000000) {
      errors.budget = 'Budget cannot exceed ₹1,00,00,000 for realistic planning.';
    }
  }

  // 4. Travelers
  if (travelers === undefined || travelers === null || String(travelers).trim() === '') {
    errors.travelers = 'Number of travelers is required.';
  } else {
    const numTravelers = Number(travelers);
    if (!Number.isInteger(numTravelers)) {
      errors.travelers = 'Number of travelers must be a whole number.';
    } else if (numTravelers < 1) {
      errors.travelers = 'At least 1 traveler is required.';
    } else if (numTravelers > 50) {
      errors.travelers = 'Maximum 50 travelers supported per group trip.';
    }
  }

  // 5. Duration
  if (duration === undefined || duration === null || String(duration).trim() === '') {
    errors.duration = 'Trip duration is required.';
  } else {
    const numDuration = Number(duration);
    if (!Number.isInteger(numDuration)) {
      errors.duration = 'Duration must be a whole number of days.';
    } else if (numDuration < 1) {
      errors.duration = 'Trip duration must be at least 1 day.';
    } else if (numDuration > 90) {
      errors.duration = 'Maximum trip duration is 90 days.';
    }
  }

  // Check if completely empty
  const allEmpty = !origin && !destination && !budget && !travelers && !duration;
  if (allEmpty) {
    formError = 'Please fill in all required fields.';
  }

  const isValid = Object.keys(errors).length === 0 && !formError;
  return { isValid, errors, formError };
};

/**
 * Check individual password criteria
 */
export const checkPasswordCriteria = (password = '') => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
};

/**
 * Validate Sign Up form
 */
export const validateSignupForm = ({ name, email, password, confirmPassword }) => {
  const errors = {};

  if (!name || !name.trim()) {
    errors.name = 'Full name is required.';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  } else if (name.length > MAX_INPUT_LENGTH) {
    errors.name = 'Name is too long.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!emailRegex.test(email.trim())) {
    errors.email = 'Please enter a valid email address.';
  } else if (email.length > MAX_INPUT_LENGTH) {
    errors.email = 'Email is too long.';
  }

  const criteria = checkPasswordCriteria(password);
  if (!password) {
    errors.password = 'Password is required.';
  } else if (!criteria.minLength) {
    errors.password = 'Password must contain at least 8 characters.';
  } else if (!criteria.hasUppercase) {
    errors.password = 'Password must contain at least one uppercase letter.';
  } else if (!criteria.hasLowercase) {
    errors.password = 'Password must contain at least one lowercase letter.';
  } else if (!criteria.hasNumber) {
    errors.password = 'Password must contain at least one number.';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirming your password is required.';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate Login form
 */
export const validateLoginForm = ({ email, password }) => {
  const errors = {};

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!emailRegex.test(email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
