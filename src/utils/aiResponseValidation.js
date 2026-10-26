/**
 * AI Response Validation Utility
 * 
 * Strictly validates structured JSON responses from LLM expense estimation.
 * Ensures numbers are numeric, non-negative, and that required fields exist.
 */

export const validateAIExpenseResponse = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return { isValid: false, error: 'Invalid response format: expected JSON object.' };
  }

  const requiredCategories = ['travel', 'accommodation', 'food', 'localTransport', 'activities'];
  const sanitized = {};

  for (const category of requiredCategories) {
    if (raw[category] === undefined || raw[category] === null) {
      return { isValid: false, error: `Missing required expense category: ${category}` };
    }

    const num = Number(raw[category]);
    if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) {
      return { isValid: false, error: `Expense value for ${category} must be a valid number.` };
    }

    if (num < 0) {
      return { isValid: false, error: `Expense value for ${category} cannot be negative.` };
    }

    sanitized[category] = Math.round(num);
  }

  // Validate assumptions
  let assumptions = [];
  if (Array.isArray(raw.assumptions) && raw.assumptions.length > 0) {
    assumptions = raw.assumptions
      .filter((item) => typeof item === 'string' && item.trim().length > 0)
      .slice(0, 5);
  }
  if (assumptions.length === 0) {
    assumptions = [
      'Estimates calibrated to seasonal destination averages.',
      'Prices exclude personal shopping and optional luxury indulgences.',
    ];
  }

  const summary = typeof raw.summary === 'string' && raw.summary.trim()
    ? raw.summary.trim()
    : 'AI personalized estimate calculated based on your destination and chosen travel style.';

  return {
    isValid: true,
    data: {
      ...sanitized,
      currency: 'INR',
      summary,
      assumptions,
    },
  };
};
