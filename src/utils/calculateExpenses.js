/**
 * Expense Calculation Utility
 * 
 * Computes estimated costs based on destination standards:
 * - Travel: travelPerPerson * travelers
 * - Accommodation: hotelPerNight * duration
 * - Food: foodPerPersonPerDay * travelers * duration
 * - Local Transport: transportPerPersonPerDay * travelers * duration
 * - Activities: activitiesPerPersonPerDay * travelers * duration
 */

/**
 * Format numerical amounts in Indian Rupee format (e.g. ₹15,800)
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Math.round(amount));
};

/**
 * Calculate detailed expense breakdown for a planned trip.
 * 
 * @param {Object} rates - Cost rates from destinationCosts.js
 * @param {number} travelers - Number of people traveling (>= 1)
 * @param {number} duration - Trip length in days (>= 1)
 * @returns {Object} Calculated expense categories, totals, and percentages
 */
/**
 * Multipliers for the 3 expenditure styles / tiers
 */
export const TRAVEL_STYLE_MULTIPLIERS = {
  budget: {
    travel: 0.75,
    accommodation: 0.70,
    food: 0.80,
    transport: 0.65,
    activities: 0.60,
    label: 'Budget Expenditure',
    tierName: 'Budget',
    summary: 'Economical travel plan with budget stays, public transit, local street food, and free attractions.',
    assumptions: [
      'Stays in verified budget guesthouses or hostels.',
      'Public buses, trains, and shared rides for local transit.',
      'Dining at authentic local eateries and markets.',
      'Focus on public landmarks, scenic viewpoints, and free access sights.'
    ]
  },
  moderate: {
    travel: 1.00,
    accommodation: 1.00,
    food: 1.00,
    transport: 1.00,
    activities: 1.00,
    label: 'Moderate Expenditure',
    tierName: 'Moderate',
    summary: 'Standard balanced travel plan featuring comfortable 3-star hotels, mixed transit, and popular attractions.',
    assumptions: [
      'Accommodation in clean, comfortable 3-star hotels.',
      'Combination of app-based cabs, autos, and standard transit.',
      'Dining at popular local restaurants and cafes.',
      'Standard sightseeing admissions and cultural highlights.'
    ]
  },
  premium: {
    travel: 1.45,
    accommodation: 1.60,
    food: 1.45,
    transport: 1.50,
    activities: 1.40,
    label: 'Premium Expenditure',
    tierName: 'Premium',
    summary: 'Upscale travel plan featuring boutique 4/5-star resorts, private dedicated transit, and premium experiences.',
    assumptions: [
      'Accommodation in 4-star boutique resorts or premier hotels.',
      'Private chauffeur cabs and convenient door-to-door transit.',
      'Gourmet dining and fine culinary experiences.',
      'Priority attraction entry, guided tours, and curated activities.'
    ]
  },
};

/**
 * Computes single tier expense breakdown
 */
const computeTierBreakdown = (rates, numTravelers, numDuration, travelStyle = 'moderate') => {
  const style = TRAVEL_STYLE_MULTIPLIERS[travelStyle] || TRAVEL_STYLE_MULTIPLIERS.moderate;

  const travelCost = Math.round(rates.travelPerPerson * numTravelers * style.travel);
  const accommodationCost = Math.round(rates.hotelPerNight * numDuration * style.accommodation);
  const foodCost = Math.round(rates.foodPerPersonPerDay * numTravelers * numDuration * style.food);
  const transportCost = Math.round(rates.transportPerPersonPerDay * numTravelers * numDuration * style.transport);
  const activitiesCost = Math.round(rates.activitiesPerPersonPerDay * numTravelers * numDuration * style.activities);

  const totalCost = travelCost + accommodationCost + foodCost + transportCost + activitiesCost;
  const calcPercent = (val) => (totalCost > 0 ? Math.round((val / totalCost) * 100) : 0);

  // THREE TYPES OF EXPENDITURE
  // 1. Travel & Transportation (Intercity travel + local transit)
  // 2. Stay & Accommodation (Hotel / lodging)
  // 3. Food, Dining & Activities (Meals + sightseeing)
  const travelAndTransport = travelCost + transportCost;
  const stayAndAccommodation = accommodationCost;
  const foodAndActivities = foodCost + activitiesCost;

  const pct1 = calcPercent(travelAndTransport);
  const pct2 = calcPercent(stayAndAccommodation);
  const pct3 = Math.max(0, 100 - (pct1 + pct2));

  const threeTypesCategories = [
    {
      id: 'travel_transport',
      name: 'Travel & Transportation',
      shortName: 'Transit',
      icon: '🚆',
      amount: travelAndTransport,
      percentage: pct1,
      description: `Commute to destination (${formatCurrency(travelCost)}) + local transit (${formatCurrency(transportCost)})`,
      color: '#0F4C5C',
      subcategories: [
        { name: 'Travel & Commute', amount: travelCost },
        { name: 'Local Transport', amount: transportCost },
      ],
    },
    {
      id: 'stay_accommodation',
      name: 'Stay & Accommodation',
      shortName: 'Stay',
      icon: '🏨',
      amount: stayAndAccommodation,
      percentage: pct2,
      description: `${numDuration} night${numDuration > 1 ? 's' : ''} accommodation for ${numTravelers} traveler${numTravelers > 1 ? 's' : ''} (${style.tierName} tier)`,
      color: '#2A9D8F',
      subcategories: [
        { name: 'Hotel / Lodging', amount: accommodationCost },
      ],
    },
    {
      id: 'food_activities',
      name: 'Food, Dining & Activities',
      shortName: 'Food & Activities',
      icon: '🍽️',
      amount: foodAndActivities,
      percentage: pct3,
      description: `Daily dining (${formatCurrency(foodCost)}) + sightseeing & attractions (${formatCurrency(activitiesCost)})`,
      color: '#F4A261',
      subcategories: [
        { name: 'Food & Dining', amount: foodCost },
        { name: 'Sightseeing & Activities', amount: activitiesCost },
      ],
    },
  ];

  const detailedCategories = [
    {
      id: 'travel',
      name: 'Travel & Commute',
      shortName: 'Travel',
      icon: '🚆',
      amount: travelCost,
      percentage: calcPercent(travelCost),
      description: `${formatCurrency(rates.travelPerPerson * style.travel)} × ${numTravelers} traveler${numTravelers > 1 ? 's' : ''}`,
      color: '#0F4C5C'
    },
    {
      id: 'accommodation',
      name: 'Accommodation',
      shortName: 'Hotel',
      icon: '🏨',
      amount: accommodationCost,
      percentage: calcPercent(accommodationCost),
      description: `${formatCurrency(rates.hotelPerNight * style.accommodation)}/night × ${numDuration} night${numDuration > 1 ? 's' : ''}`,
      color: '#2A9D8F'
    },
    {
      id: 'food',
      name: 'Food & Dining',
      shortName: 'Food',
      icon: '🍛',
      amount: foodCost,
      percentage: calcPercent(foodCost),
      description: `${formatCurrency(rates.foodPerPersonPerDay * style.food)}/day × ${numTravelers} people × ${numDuration} days`,
      color: '#F4A261'
    },
    {
      id: 'transport',
      name: 'Local Transport',
      shortName: 'Local Transport',
      icon: '🚌',
      amount: transportCost,
      percentage: calcPercent(transportCost),
      description: `${formatCurrency(rates.transportPerPersonPerDay * style.transport)}/day × ${numTravelers} people × ${numDuration} days`,
      color: '#E76F51'
    },
    {
      id: 'activities',
      name: 'Sightseeing & Activities',
      shortName: 'Activities',
      icon: '🎯',
      amount: activitiesCost,
      percentage: calcPercent(activitiesCost),
      description: `${formatCurrency(rates.activitiesPerPersonPerDay * style.activities)}/day × ${numTravelers} people × ${numDuration} days`,
      color: '#16A34A'
    }
  ];

  return {
    travelStyle,
    styleMeta: style,
    travelCost,
    accommodationCost,
    foodCost,
    transportCost,
    activitiesCost,
    totalCost,
    perPersonCost: Math.round(totalCost / numTravelers),
    perDayCost: Math.round(totalCost / numDuration),
    categories: threeTypesCategories,
    detailedCategories,
    summary: style.summary,
    assumptions: style.assumptions,
  };
};

/**
 * Calculate expense breakdown for a planned trip, with Three Types of Expenditure
 * 
 * @param {Object} rates - Cost rates from destinationCosts.js
 * @param {number} travelers - Number of people traveling (>= 1)
 * @param {number} duration - Trip length in days (>= 1)
 * @param {string} travelStyle - 'budget' | 'moderate' | 'premium'
 * @returns {Object} Calculated expense categories, totals, and percentages
 */
export const calculateExpenses = (rates, travelers, duration, travelStyle = 'moderate') => {
  if (!rates) {
    throw new Error('Destination cost rates must be provided.');
  }

  const numTravelers = Math.max(1, parseInt(travelers, 10) || 1);
  const numDuration = Math.max(1, parseInt(duration, 10) || 1);

  const activeResult = computeTierBreakdown(rates, numTravelers, numDuration, travelStyle);

  // Compute all three expenditure tiers
  const budgetTier = computeTierBreakdown(rates, numTravelers, numDuration, 'budget');
  const moderateTier = computeTierBreakdown(rates, numTravelers, numDuration, 'moderate');
  const premiumTier = computeTierBreakdown(rates, numTravelers, numDuration, 'premium');

  return {
    ...activeResult,
    threeTiers: {
      budget: budgetTier,
      moderate: moderateTier,
      premium: premiumTier,
    },
  };
};
