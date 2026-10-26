/**
 * AI Smart Suggestions Service
 * 
 * Communicates with the secure backend endpoint /api/smart-suggestions
 * to generate actionable recommendations for trip optimization.
 * 
 * Strict Fallback:
 * If the LLM is unavailable or offline, executes a context-aware heuristic
 * rule engine analyzing budget deficit/surplus, category distributions,
 * travel styles, and live weather conditions.
 */

import { validateAISuggestionsResponse } from '../utils/suggestionValidation.js';
import { formatCurrency } from '../utils/calculateExpenses.js';

/**
 * Generate intelligent heuristic fallback suggestions
 */
export const getFallbackSmartSuggestions = ({
  destination,
  budget,
  totalCost,
  budgetDifference,
  budgetStatus,
  travelStyle = 'moderate',
  expenses = {},
  duration = 1,
  weather = null,
}) => {
  const isOverBudget = budgetStatus === 'exceeds' || budgetDifference < 0;
  const absDiff = Math.abs(budgetDifference);
  const suggestions = [];

  // 1. Primary Budget Feasibility Recommendation
  if (isOverBudget) {
    const diffFormatted = formatCurrency(absDiff);
    if (travelStyle === 'premium') {
      suggestions.push({
        title: 'Switch to Moderate Travel Style',
        description: `Your trip exceeds your budget by ${diffFormatted}. Switching to Moderate style could save up to 35% on stays and transport.`,
        category: 'Travel Style',
        impact: 'High',
      });
    } else if (travelStyle === 'moderate') {
      suggestions.push({
        title: 'Adopt Budget Travel Techniques',
        description: `You need an additional ${diffFormatted}. Choosing budget stays and utilizing local public transit will bridge this gap.`,
        category: 'Budget Optimization',
        impact: 'High',
      });
    }

    if (duration > 2) {
      const dailyCost = Math.round(totalCost / duration);
      suggestions.push({
        title: 'Consider Adjusting Trip Duration',
        description: `Reducing the itinerary by 1 day saves approximately ${formatCurrency(dailyCost)}, bringing the trip comfortably within reach.`,
        category: 'Duration',
        impact: 'High',
      });
    }
  } else {
    // Under budget
    const cushion = Math.round(absDiff * 0.4);
    suggestions.push({
      title: 'Maintain an Emergency Buffer',
      description: `You have ${formatCurrency(absDiff)} remaining. Keep at least ${formatCurrency(cushion)} reserved for unexpected transit or emergency expenses.`,
      category: 'Safety Buffer',
      impact: 'Medium',
    });

    if (absDiff > 2500) {
      suggestions.push({
        title: 'Add a Special Experience',
        description: `Your surplus budget leaves plenty of room for an authentic guided activity, culinary tasting, or local excursion in ${destination}.`,
        category: 'Activities',
        impact: 'Low',
      });
    }
  }

  // 2. Identify and Target Largest Expense Category
  const expenseEntries = [
    { cat: 'Accommodation', amt: expenses.accommodationCost || 0 },
    { cat: 'Travel & Commute', amt: expenses.travelCost || 0 },
    { cat: 'Food & Dining', amt: expenses.foodCost || 0 },
    { cat: 'Sightseeing & Activities', amt: expenses.activitiesCost || 0 },
  ].sort((a, b) => b.amt - a.amt);

  const topCategory = expenseEntries[0];
  if (topCategory && topCategory.amt > 0) {
    if (topCategory.cat === 'Accommodation') {
      suggestions.push({
        title: 'Optimize Lodging Location',
        description: 'Accommodation is your highest expense. Consider booking stays just outside central tourist zones for better rates.',
        category: 'Accommodation',
        impact: isOverBudget ? 'High' : 'Medium',
      });
    } else if (topCategory.cat === 'Travel & Commute') {
      suggestions.push({
        title: 'Book Travel in Advance',
        description: 'Transit represents a significant portion of your total. Booking tickets 3–4 weeks early can lock in standard rates.',
        category: 'Transport',
        impact: 'Medium',
      });
    }
  }

  // 3. Weather-Responsive Suggestion
  if (weather) {
    const condition = (weather.condition || '').toLowerCase();
    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('storm')) {
      suggestions.push({
        title: 'Prepare Rainy Weather Alternatives',
        description: `${weather.condition} is forecast in ${destination}. Keep indoor attractions, heritage museums, and covered markets handy.`,
        category: 'Weather Prep',
        impact: 'Medium',
      });
    } else if (weather.temperature >= 32) {
      suggestions.push({
        title: 'Beat the Afternoon Heat',
        description: `Temperatures around ${weather.temperature}°C expected. Schedule outdoor exploration before 11:00 AM or after 4:30 PM.`,
        category: 'Weather Prep',
        impact: 'Low',
      });
    }
  }

  // General travel style recommendation if we still have room
  if (suggestions.length < 3) {
    suggestions.push({
      title: 'Leverage Public & Shared Transit',
      description: 'Using local metros, scheduled ferries, or daily passes avoids peak tourist auto/cab surges.',
      category: 'Local Transit',
      impact: 'Low',
    });
  }

  return {
    overallAdvice: isOverBudget
      ? `This trip currently exceeds your budget by ${formatCurrency(absDiff)}. Consider adjustments to accommodation and duration to make it financially feasible.`
      : `Your planned trip to ${destination} is well within your ₹${budget.toLocaleString('en-IN')} budget with comfortable savings remaining.`,
    suggestions: suggestions.slice(0, 4),
    isAiGenerated: false,
    fallbackReason: 'AI recommendations unavailable. Showing rule-based smart advice.',
  };
};

/**
 * Generate smart trip suggestions via AI with graceful fallback
 */
export const generateSmartSuggestionsWithAI = async ({
  origin,
  originLocation,
  destination,
  budget,
  travelers,
  duration,
  travelStyle = 'moderate',
  expenses,
  totalCost,
  budgetDifference,
  budgetStatus,
  weather,
}) => {
  // If offline, immediate fallback
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return getFallbackSmartSuggestions({
      destination,
      budget,
      totalCost,
      budgetDifference,
      budgetStatus,
      travelStyle,
      expenses,
      duration,
      weather,
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000); // 9-second timeout

  const storedKey = (typeof localStorage !== 'undefined' && localStorage.getItem('budgettrip_gemini_key')) || 
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || 
    '';

  const headers = {
    'Content-Type': 'application/json',
  };
  if (storedKey) {
    headers['x-gemini-api-key'] = storedKey;
  }

  try {
    const response = await fetch('/api/smart-suggestions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        origin,
        originLocation,
        destination,
        budget,
        travelers,
        duration,
        travelStyle,
        expenses,
        totalCost,
        budgetDifference,
        budgetStatus,
        weather,
        geminiApiKey: storedKey || undefined,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`AI Suggestions API returned status ${response.status}. Using smart heuristic fallback.`);
      return getFallbackSmartSuggestions({
        destination,
        budget,
        totalCost,
        budgetDifference,
        budgetStatus,
        travelStyle,
        expenses,
        duration,
        weather,
      });
    }

    const json = await response.json();

    if (json.fallback || json.isAiGenerated === false) {
      return {
        ...getFallbackSmartSuggestions({
          destination,
          budget,
          totalCost,
          budgetDifference,
          budgetStatus,
          travelStyle,
          expenses,
          duration,
          weather,
        }),
        fallbackReason: json.reason || 'AI recommendations unavailable. Showing rule-based smart advice.',
      };
    }

    const validation = validateAISuggestionsResponse(json);
    if (!validation.isValid) {
      console.warn('AI Suggestions response failed schema validation:', validation.error);
      return getFallbackSmartSuggestions({
        destination,
        budget,
        totalCost,
        budgetDifference,
        budgetStatus,
        travelStyle,
        expenses,
        duration,
        weather,
      });
    }

    return {
      ...validation.data,
      isAiGenerated: true,
      fallbackReason: null,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('AI Suggestions request failed:', err.message);
    return getFallbackSmartSuggestions({
      destination,
      budget,
      totalCost,
      budgetDifference,
      budgetStatus,
      travelStyle,
      expenses,
      duration,
      weather,
    });
  }
};
