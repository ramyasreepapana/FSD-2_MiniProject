/**
 * AI Suggestion Validation Utility
 * 
 * Strictly validates structured suggestions returned by the AI.
 * Ensures expected fields, valid impact levels ('High', 'Medium', 'Low'),
 * and non-empty advice text.
 */

const ALLOWED_IMPACTS = new Set(['High', 'Medium', 'Low']);

export const validateAISuggestionsResponse = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return { isValid: false, error: 'Invalid suggestions format: expected JSON object.' };
  }

  const overallAdvice = typeof raw.overallAdvice === 'string' && raw.overallAdvice.trim()
    ? raw.overallAdvice.trim()
    : 'Review your trip budget distribution to balance comfort with financial feasibility.';

  let validSuggestions = [];
  if (Array.isArray(raw.suggestions)) {
    validSuggestions = raw.suggestions
      .filter((s) => s && typeof s === 'object')
      .map((s) => {
        const title = typeof s.title === 'string' ? s.title.trim() : 'Trip Optimization';
        const description = typeof s.description === 'string' ? s.description.trim() : '';
        const category = typeof s.category === 'string' ? s.category.trim() : 'General';
        
        let impact = typeof s.impact === 'string' ? s.impact.trim() : 'Medium';
        if (!ALLOWED_IMPACTS.has(impact)) {
          // Normalize casing or fallback
          const lower = impact.toLowerCase();
          if (lower === 'high') impact = 'High';
          else if (lower === 'low') impact = 'Low';
          else impact = 'Medium';
        }

        return {
          title: title || 'Trip Optimization Tip',
          description: description || 'Plan your expenses carefully to maximize your experience.',
          category: category || 'Planning',
          impact,
        };
      })
      .filter((s) => s.description.length > 0)
      .slice(0, 5);
  }

  if (validSuggestions.length === 0) {
    return {
      isValid: false,
      error: 'AI did not provide any valid suggestion items.',
    };
  }

  return {
    isValid: true,
    data: {
      overallAdvice,
      suggestions: validSuggestions,
    },
  };
};
