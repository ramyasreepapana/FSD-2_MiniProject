/**
 * LLM Personalized Expense Estimation Service
 * 
 * Communicates with the secure backend endpoint /api/estimate-expenses
 * to personalize category expenses via an LLM.
 * 
 * Strict Fallback:
 * If the LLM is unavailable, offline, or times out, executes a transparent,
 * deterministic benchmark calculation adjusted by travel style multipliers.
 * NEVER claims to be AI-generated when fallback is active.
 */

import { validateAIExpenseResponse } from '../utils/aiResponseValidation.js';

// Style multipliers for transparent deterministic benchmark fallback
const TRAVEL_STYLE_MULTIPLIERS = {
  budget: {
    travel: 0.75,
    accommodation: 0.70,
    food: 0.80,
    localTransport: 0.65,
    activities: 0.60,
    summary: 'Economical benchmark estimate focusing on budget stays, local transport, and affordable dining.',
    assumptions: [
      'Accommodation based on budget guesthouses or hostels.',
      'Transport prioritizes public transit, buses, and shared rides.',
      'Food estimates cover local eateries and street-food experiences.',
      'Activities focus on free sights, scenic landmarks, and public attractions.',
    ],
  },
  moderate: {
    travel: 1.00,
    accommodation: 1.00,
    food: 1.00,
    localTransport: 1.00,
    activities: 1.00,
    summary: 'Standard destination benchmark balancing comfortable mid-range hotels, local cabs, and popular attractions.',
    assumptions: [
      'Accommodation in clean, verified 3-star hotels or private rooms.',
      'Combination of app-based cabs, autos, and standard transit.',
      'Dining at reputable local restaurants and cafes.',
      'Includes entry tickets to primary sightseeing highlights.',
    ],
  },
  premium: {
    travel: 1.45,
    accommodation: 1.60,
    food: 1.45,
    localTransport: 1.50,
    activities: 1.40,
    summary: 'Premium benchmark tailored for upscale resorts, private chauffeur cabs, and curated experiences.',
    assumptions: [
      'Accommodation in 4-star boutique resorts or premier hotels.',
      'Private dedicated cab hires and convenient door-to-door transit.',
      'Gourmet dining, popular beach clubs, or high-end cuisine.',
      'Covers guided tours, watersports, and priority adventure passes.',
    ],
  },
};

/**
 * Generate deterministic fallback estimates from destination benchmark rates
 */
export const getFallbackExpenseEstimate = ({
  destinationBenchmarkData,
  travelers = 1,
  duration = 1,
  travelStyle = 'moderate',
}) => {
  const style = TRAVEL_STYLE_MULTIPLIERS[travelStyle] || TRAVEL_STYLE_MULTIPLIERS.moderate;
  const numTravelers = Math.max(1, parseInt(travelers, 10) || 1);
  const numDuration = Math.max(1, parseInt(duration, 10) || 1);

  const rates = destinationBenchmarkData || {
    travelPerPerson: 2500,
    hotelPerNight: 1800,
    foodPerPersonPerDay: 700,
    transportPerPersonPerDay: 250,
    activitiesPerPersonPerDay: 350,
  };

  const travel = Math.round(rates.travelPerPerson * numTravelers * style.travel);
  const accommodation = Math.round(rates.hotelPerNight * numDuration * style.accommodation);
  const food = Math.round(rates.foodPerPersonPerDay * numTravelers * numDuration * style.food);
  const localTransport = Math.round(rates.transportPerPersonPerDay * numTravelers * numDuration * style.localTransport);
  const activities = Math.round(rates.activitiesPerPersonPerDay * numTravelers * numDuration * style.activities);

  return {
    travel,
    accommodation,
    food,
    localTransport,
    activities,
    currency: 'INR',
    summary: style.summary,
    assumptions: style.assumptions,
    isAiGenerated: false,
    fallbackReason: 'AI personalization unavailable. Showing benchmark-based estimate.',
  };
};

/**
 * Estimate personalized expenses using AI with automatic deterministic fallback
 */
export const estimateExpensesWithAI = async ({
  origin,
  originLocation,
  destination,
  budget,
  travelers,
  duration,
  travelStyle = 'moderate',
  destinationBenchmarkData,
}) => {
  // If offline, immediate fallback without waiting
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return getFallbackExpenseEstimate({
      destinationBenchmarkData,
      travelers,
      duration,
      travelStyle,
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
    const response = await fetch('/api/estimate-expenses', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        origin,
        originLocation,
        destination,
        budget: Number(budget),
        travelers: Number(travelers),
        duration: Number(duration),
        travelStyle,
        destinationBenchmarkData,
        geminiApiKey: storedKey || undefined,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`AI Estimation API returned status ${response.status}. Using deterministic fallback.`);
      return getFallbackExpenseEstimate({
        destinationBenchmarkData,
        travelers,
        duration,
        travelStyle,
      });
    }

    const json = await response.json();

    // Check if the API itself signaled fallback mode (e.g. no key configured)
    if (json.fallback || json.isAiGenerated === false) {
      return {
        ...getFallbackExpenseEstimate({
          destinationBenchmarkData,
          travelers,
          duration,
          travelStyle,
        }),
        fallbackReason: json.reason || 'AI personalization unavailable. Showing benchmark-based estimate.',
      };
    }

    // Validate the AI response strictly
    const validation = validateAIExpenseResponse(json);
    if (!validation.isValid) {
      console.warn('AI Estimation response failed schema validation:', validation.error);
      return getFallbackExpenseEstimate({
        destinationBenchmarkData,
        travelers,
        duration,
        travelStyle,
      });
    }

    return {
      ...validation.data,
      isAiGenerated: true,
      fallbackReason: null,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('AI Estimation request failed:', err.message);
    return getFallbackExpenseEstimate({
      destinationBenchmarkData,
      travelers,
      duration,
      travelStyle,
    });
  }
};
