import assert from 'node:assert';
import { calculateExpenses, formatCurrency } from '../calculateExpenses.js';
import { analyzeBudgetFeasibility } from '../budgetAnalysis.js';
import { validateTripForm, validateSignupForm, validateLoginForm, checkPasswordCriteria } from '../validation.js';
import { destinationCosts, getDestinationByName } from '../../data/destinationCosts.js';
import { validateAIExpenseResponse } from '../aiResponseValidation.js';
import { validateAISuggestionsResponse } from '../suggestionValidation.js';
import { getFallbackExpenseEstimate } from '../../services/llmExpenseApi.js';

console.log('🧪 Starting BUDGETTRIP Hackathon Logic & Stress Tests...\n');

// 1. Data Integrity Tests
console.log('Test 1: Destination Data Integrity');
assert(destinationCosts.Goa, 'Goa must exist in destination costs');
assert(destinationCosts.Hyderabad, 'Hyderabad must exist in destination costs');
assert(destinationCosts.Manali, 'Manali must exist in destination costs');
assert(destinationCosts.Goa.travelPerPerson === 2500, 'Goa travelPerPerson should match specification');
assert(destinationCosts.Goa.hotelPerNight === 1800, 'Goa hotelPerNight should match specification');
assert.strictEqual(getDestinationByName('goa')?.name, 'Goa', 'getDestinationByName should match case-insensitively');
assert.strictEqual(formatCurrency(2500).includes('2,500'), true, 'formatCurrency should format properly');
console.log('✓ Destination dataset verified.');

// 2. Expense Calculation Formula Accuracy (from Spec)
// Goa: 2 travelers, 3 days
// Travel = 2500 * 2 = 5000
// Accommodation = 1800 * 3 = 5400
// Food = 700 * 2 * 3 = 4200
// Local Transport = 250 * 2 * 3 = 1500
// Activities = 350 * 2 * 3 = 2100
// Total = 5000 + 5400 + 4200 + 1500 + 2100 = 18200
console.log('\nTest 2: Expense Calculation Formula Accuracy');
const goaRates = destinationCosts.Goa;
const goaResult = calculateExpenses(goaRates, 2, 3);
assert.strictEqual(goaResult.travelCost, 5000, 'Travel cost calculation mismatch');
assert.strictEqual(goaResult.accommodationCost, 5400, 'Accommodation cost calculation mismatch');
assert.strictEqual(goaResult.foodCost, 4200, 'Food cost calculation mismatch');
assert.strictEqual(goaResult.transportCost, 1500, 'Transport cost calculation mismatch');
assert.strictEqual(goaResult.activitiesCost, 2100, 'Activities cost calculation mismatch');
assert.strictEqual(goaResult.totalCost, 18200, 'Total cost calculation mismatch');
console.log('✓ Expense calculation verified with exact mathematical precision.');

// 3. Budget Feasibility Analysis
console.log('\nTest 3: Budget Feasibility Comparison');
// Scenario A: Within Budget (Budget 20,000 > Total 18,200)
const withinFeasibility = analyzeBudgetFeasibility(20000, 18200);
assert.strictEqual(withinFeasibility.isWithinBudget, true, 'Should be within budget');
assert.strictEqual(withinFeasibility.status, 'within', 'Status should be within');
assert.strictEqual(withinFeasibility.difference, 1800, 'Remaining difference should be 1800');
assert.strictEqual(withinFeasibility.headline, 'Trip is within your budget');

// Scenario B: Exceeds Budget (Budget 10,000 < Total 18,200)
const exceedsFeasibility = analyzeBudgetFeasibility(10000, 18200);
assert.strictEqual(exceedsFeasibility.isWithinBudget, false, 'Should exceed budget');
assert.strictEqual(exceedsFeasibility.status, 'exceeds', 'Status should be exceeds');
assert.strictEqual(exceedsFeasibility.difference, 8200, 'Needed difference should be 8200');
assert.strictEqual(exceedsFeasibility.headline, 'Trip exceeds your budget');
console.log('✓ Budget feasibility analysis verified (Within & Exceeds states).');

// 4. Input Validation Tests (Stress Tests 3, 4, 11, 12, 13, 14)
console.log('\nTest 4: Input Validation & Boundary Stress Tests');

// Empty form
const emptyVal = validateTripForm({ origin: '', destination: '', budget: '', travelers: '', duration: '' });
assert.strictEqual(emptyVal.isValid, false, 'Empty form must be invalid');
assert(emptyVal.formError.includes('Please fill in all required fields'), 'Should show generic empty form message');

// Invalid zero/negative budget
const zeroBudgetVal = validateTripForm({ origin: 'Vijayawada', destination: 'Goa', budget: '0', travelers: '2', duration: '3' });
assert.strictEqual(zeroBudgetVal.isValid, false);
assert(zeroBudgetVal.errors.budget.includes('greater than ₹0'));

const negBudgetVal = validateTripForm({ origin: 'Vijayawada', destination: 'Goa', budget: '-500', travelers: '2', duration: '3' });
assert.strictEqual(negBudgetVal.isValid, false);
assert(negBudgetVal.errors.budget.includes('greater than ₹0'));

// Invalid non-numeric budget
const strBudgetVal = validateTripForm({ origin: 'Vijayawada', destination: 'Goa', budget: 'not-a-number', travelers: '2', duration: '3' });
assert.strictEqual(strBudgetVal.isValid, false);
assert(strBudgetVal.errors.budget.includes('valid number'));

// Zero travelers
const zeroTravelersVal = validateTripForm({ origin: 'Vijayawada', destination: 'Goa', budget: '20000', travelers: '0', duration: '3' });
assert.strictEqual(zeroTravelersVal.isValid, false);
assert(zeroTravelersVal.errors.travelers.includes('At least 1 traveler is required'));

// Zero duration
const zeroDurationVal = validateTripForm({ origin: 'Vijayawada', destination: 'Goa', budget: '20000', travelers: '2', duration: '0' });
assert.strictEqual(zeroDurationVal.isValid, false);
assert(zeroDurationVal.errors.duration.includes('at least 1 day'));

// Negative duration
const negDurationVal = validateTripForm({ origin: 'Vijayawada', destination: 'Goa', budget: '20000', travelers: '2', duration: '-4' });
assert.strictEqual(negDurationVal.isValid, false);
assert(negDurationVal.errors.duration.includes('at least 1 day'));

// Unknown destination
const unknownDestVal = validateTripForm({ origin: 'Vijayawada', destination: 'AtlantisUndersea', budget: '20000', travelers: '2', duration: '3' });
assert.strictEqual(unknownDestVal.isValid, false);
assert(unknownDestVal.errors.destination.includes('supported destination'));

// 400+ characters origin length test
const longString = 'A'.repeat(450);
const longOriginVal = validateTripForm({ origin: longString, destination: 'Goa', budget: '20000', travelers: '2', duration: '3' });
assert.strictEqual(longOriginVal.isValid, false);
assert(longOriginVal.errors.origin.includes('must not exceed'));

console.log('✓ All input validation stress tests passed.');

// 5. Authentication Validation Tests (Stress Tests 8, 9, 10)
console.log('\nTest 5: Password & Signup Validation Standards');

// Missing uppercase
const noUpper = checkPasswordCriteria('password123');
assert.strictEqual(noUpper.hasUppercase, false);
assert.strictEqual(noUpper.minLength, true);

// Missing number
const noNum = checkPasswordCriteria('Password');
assert.strictEqual(noNum.hasNumber, false);
assert.strictEqual(noNum.hasUppercase, true);

// Too short
const tooShort = checkPasswordCriteria('Pass1');
assert.strictEqual(tooShort.minLength, false);

// Valid password
const validPw = checkPasswordCriteria('SecurePass123');
assert.strictEqual(validPw.minLength, true);
assert.strictEqual(validPw.hasUppercase, true);
assert.strictEqual(validPw.hasLowercase, true);
assert.strictEqual(validPw.hasNumber, true);

const signupRes = validateSignupForm({
  name: 'Alex Johnson',
  email: 'alex@example.com',
  password: 'Password123',
  confirmPassword: 'Password123'
});
assert.strictEqual(signupRes.isValid, true, 'Valid signup data should pass');

const mismatchSignup = validateSignupForm({
  name: 'Alex Johnson',
  email: 'alex@example.com',
  password: 'Password123',
  confirmPassword: 'DifferentPassword123'
});
assert.strictEqual(mismatchSignup.isValid, false);
assert(mismatchSignup.errors.confirmPassword.includes('Passwords do not match'));

const validLogin = validateLoginForm({ email: 'test@example.com', password: 'Password123' });
assert.strictEqual(validLogin.isValid, true, 'Valid login should pass');

const invalidLogin = validateLoginForm({ email: 'bad-email', password: '' });
assert.strictEqual(invalidLogin.isValid, false, 'Invalid login should fail');

console.log('✓ Authentication validation & password criteria tests passed.');

// 6. Edge Case & Group Size Tests
console.log('\nTest 6: Group Size & Exact Budget Matching');
// Exact match: budget = 18200, total = 18200
const exactFeasibility = analyzeBudgetFeasibility(18200, 18200);
assert.strictEqual(exactFeasibility.isWithinBudget, true, 'Exact budget match should be considered within budget');
assert.strictEqual(exactFeasibility.difference, 0, 'Difference should be 0');
assert.strictEqual(exactFeasibility.status, 'within', 'Status should be within for exact match');

// Large group: 10 travelers, 7 days in Jaipur
// Jaipur rates: travel 2200, hotel 1600, food 500, transport 220, activities 300
// Travel = 2200 * 10 = 22000
// Hotel = 1600 * 7 = 11200
// Food = 500 * 10 * 7 = 35000
// Transport = 220 * 10 * 7 = 15400
// Activities = 300 * 10 * 7 = 21000
// Total = 22000 + 11200 + 35000 + 15400 + 21000 = 104600
const jaipurRates = destinationCosts.Jaipur;
const jaipurLargeGroup = calculateExpenses(jaipurRates, 10, 7);
assert.strictEqual(jaipurLargeGroup.travelCost, 22000);
assert.strictEqual(jaipurLargeGroup.accommodationCost, 11200);
assert.strictEqual(jaipurLargeGroup.foodCost, 35000);
assert.strictEqual(jaipurLargeGroup.transportCost, 15400);
assert.strictEqual(jaipurLargeGroup.activitiesCost, 21000);
assert.strictEqual(jaipurLargeGroup.totalCost, 104600);
console.log('✓ Group size & exact budget matching tests passed.');

// 7. Origin Location Validation (Geocoded vs Invalid Text)
console.log('\nTest 7: Origin Location Validation & Resolution');
const validLocationObj = {
  name: 'Vijayawada',
  latitude: 16.5062,
  longitude: 80.648,
  country: 'India',
  admin1: 'Andhra Pradesh',
};
const validOriginForm = validateTripForm({
  origin: 'Vijayawada, Andhra Pradesh, India',
  originLocation: validLocationObj,
  destination: 'Goa',
  budget: '20000',
  travelers: '2',
  duration: '3',
  travelStyle: 'moderate',
});
assert.strictEqual(validOriginForm.isValid, true, 'Form with verified originLocation must be valid');

// Unresolved text (e.g. user typed "abcxyz123" without selecting a recognized location)
const invalidTextForm = validateTripForm({
  origin: 'abcxyz123',
  originLocation: null,
  destination: 'Goa',
  budget: '20000',
  travelers: '2',
  duration: '3',
  travelStyle: 'moderate',
});
assert.strictEqual(invalidTextForm.isValid, false, 'Unresolved origin text must be rejected');
assert(invalidTextForm.errors.origin.includes('valid recognized location'), 'Error must prompt to select from recognized suggestions');

// Malformed originLocation object (missing latitude)
const malformedOriginForm = validateTripForm({
  origin: 'Some Place',
  originLocation: { name: 'Some Place' },
  destination: 'Goa',
  budget: '20000',
  travelers: '2',
  duration: '3',
  travelStyle: 'moderate',
});
assert.strictEqual(malformedOriginForm.isValid, false);
assert(malformedOriginForm.errors.origin.includes('valid recognized location'));
console.log('✓ Origin location validation (verified vs arbitrary string) passed.');

// 8. Travel Style Selection Validation
console.log('\nTest 8: Travel Style Validation');
['budget', 'moderate', 'premium'].forEach((style) => {
  const res = validateTripForm({
    origin: 'Vijayawada',
    originLocation: validLocationObj,
    destination: 'Goa',
    budget: '20000',
    travelers: '2',
    duration: '3',
    travelStyle: style,
  });
  assert.strictEqual(res.isValid, true, `Travel style "${style}" must be valid`);
});

const invalidStyleForm = validateTripForm({
  origin: 'Vijayawada',
  originLocation: validLocationObj,
  destination: 'Goa',
  budget: '20000',
  travelers: '2',
  duration: '3',
  travelStyle: 'luxury-space-cruise',
});
assert.strictEqual(invalidStyleForm.isValid, false, 'Invalid travel style must be rejected');
assert(invalidStyleForm.errors.travelStyle.includes('valid travel style'));
console.log('✓ Travel style selector validation passed.');

// 9. AI Expense Response Schema Validation
console.log('\nTest 9: AI Expense Response Schema Validation');
const validAiExpense = {
  travel: 5200,
  accommodation: 6000,
  food: 4500,
  localTransport: 1600,
  activities: 2200,
  currency: 'INR',
  summary: 'Comfortable beach vacation estimate with mid-range hotels.',
  assumptions: ['Includes hotel in Calangute', 'Shared rides for local transit'],
};
const aiValidationResult = validateAIExpenseResponse(validAiExpense);
assert.strictEqual(aiValidationResult.isValid, true, 'Valid AI expense payload must pass validation');
assert.strictEqual(aiValidationResult.data.currency, 'INR');
assert.strictEqual(aiValidationResult.data.travel, 5200);

// Missing category
const missingCategoryExpense = { travel: 5000, accommodation: 5000, food: 4000, localTransport: 1500 };
const missingValidation = validateAIExpenseResponse(missingCategoryExpense);
assert.strictEqual(missingValidation.isValid, false, 'Missing category must fail validation');
assert(missingValidation.error.includes('Missing required expense category'));

// Negative amount
const negativeCategoryExpense = { travel: -1000, accommodation: 5000, food: 4000, localTransport: 1500, activities: 2000 };
const negValidation = validateAIExpenseResponse(negativeCategoryExpense);
assert.strictEqual(negValidation.isValid, false, 'Negative expense value must fail validation');
assert(negValidation.error.includes('cannot be negative'));

// Non-numeric amount
const nonNumCategoryExpense = { travel: 'five-thousand', accommodation: 5000, food: 4000, localTransport: 1500, activities: 2000 };
const nonNumValidation = validateAIExpenseResponse(nonNumCategoryExpense);
assert.strictEqual(nonNumValidation.isValid, false, 'Non-numeric expense value must fail validation');
console.log('✓ AI expense schema validation passed.');

// 10. AI Smart Suggestions Validation
console.log('\nTest 10: AI Smart Suggestions Validation');
const validSuggestionsPayload = {
  overallAdvice: 'Trim hotel expenses to bring this trip safely within your ₹20,000 budget.',
  suggestions: [
    { title: 'Book Stays Early', description: 'Save up to 25% by reserving 3 weeks ahead.', category: 'Accommodation', impact: 'High' },
    { title: 'Use Metro Pass', description: 'Unlimited local travel for ₹150/day.', category: 'Transport', impact: 'Medium' },
    { title: 'Street Food Tour', description: 'Authentic local cuisine at half the dining cost.', category: 'Food', impact: 'low' },
  ],
};
const suggestionsValidation = validateAISuggestionsResponse(validSuggestionsPayload);
assert.strictEqual(suggestionsValidation.isValid, true, 'Valid suggestions payload must pass validation');
assert.strictEqual(suggestionsValidation.data.suggestions.length, 3);
assert.strictEqual(suggestionsValidation.data.suggestions[2].impact, 'Low', 'Impact level should normalize casing to "Low"');

// Empty suggestions array
const emptySuggestionsPayload = { overallAdvice: 'Some advice', suggestions: [] };
const emptySuggestionsVal = validateAISuggestionsResponse(emptySuggestionsPayload);
assert.strictEqual(emptySuggestionsVal.isValid, false, 'Empty suggestions array must fail validation');
console.log('✓ AI smart suggestions schema validation passed.');

// 11. Deterministic Total Arithmetic & Style Benchmark Fallback Engine
console.log('\nTest 11: Deterministic Total Arithmetic & Style Benchmark Fallback Engine');
const baseBenchmark = destinationCosts.Goa;
const budgetFallback = getFallbackExpenseEstimate({
  destinationBenchmarkData: baseBenchmark,
  travelers: 2,
  duration: 3,
  travelStyle: 'budget',
});
const moderateFallback = getFallbackExpenseEstimate({
  destinationBenchmarkData: baseBenchmark,
  travelers: 2,
  duration: 3,
  travelStyle: 'moderate',
});
const premiumFallback = getFallbackExpenseEstimate({
  destinationBenchmarkData: baseBenchmark,
  travelers: 2,
  duration: 3,
  travelStyle: 'premium',
});

// Verify transparent disclosure flags
assert.strictEqual(budgetFallback.isAiGenerated, false, 'Fallback must disclose isAiGenerated: false');
assert(budgetFallback.fallbackReason.includes('benchmark-based estimate'));

// Verify style progression: budget < moderate < premium
const budgetSum = budgetFallback.travel + budgetFallback.accommodation + budgetFallback.food + budgetFallback.localTransport + budgetFallback.activities;
const moderateSum = moderateFallback.travel + moderateFallback.accommodation + moderateFallback.food + moderateFallback.localTransport + moderateFallback.activities;
const premiumSum = premiumFallback.travel + premiumFallback.accommodation + premiumFallback.food + premiumFallback.localTransport + premiumFallback.activities;

assert(budgetSum < moderateSum, `Budget total (${budgetSum}) must be less than moderate (${moderateSum})`);
assert(moderateSum < premiumSum, `Moderate total (${moderateSum}) must be less than premium (${premiumSum})`);
console.log(`✓ Travel style benchmark calibration verified: Budget ₹${budgetSum} < Moderate ₹${moderateSum} < Premium ₹${premiumSum}`);

// 12. Three Types of Expenditure & Three Tiers System Validation
console.log('\nTest 12: Three Types of Expenditure & Tiers Validation');
const tripCalc = calculateExpenses(baseBenchmark, 2, 3, 'moderate');
assert.strictEqual(tripCalc.categories.length, 3, 'Must return exactly 3 types of expenditure');
assert.strictEqual(tripCalc.categories[0].id, 'travel_transport', 'First expenditure type must be Travel & Transportation');
assert.strictEqual(tripCalc.categories[1].id, 'stay_accommodation', 'Second expenditure type must be Stay & Accommodation');
assert.strictEqual(tripCalc.categories[2].id, 'food_activities', 'Third expenditure type must be Food, Dining & Activities');

const threeTypesSum = tripCalc.categories.reduce((acc, cat) => acc + cat.amount, 0);
assert.strictEqual(threeTypesSum, tripCalc.totalCost, 'Sum of Three Types of Expenditure must equal totalCost');

assert(tripCalc.threeTiers.budget, 'Must compute Budget Tier');
assert(tripCalc.threeTiers.moderate, 'Must compute Moderate Tier');
assert(tripCalc.threeTiers.premium, 'Must compute Premium Tier');
assert(tripCalc.threeTiers.budget.totalCost < tripCalc.threeTiers.moderate.totalCost);
assert(tripCalc.threeTiers.moderate.totalCost < tripCalc.threeTiers.premium.totalCost);
console.log(`✓ Three Types of Expenditure verified: Transit ₹${tripCalc.categories[0].amount} + Stay ₹${tripCalc.categories[1].amount} + Food/Activities ₹${tripCalc.categories[2].amount} = Total ₹${threeTypesSum}`);

console.log('\n🎉 ALL LOGIC AND STRESS TESTS PASSED SUCCESSFULLY!\n');

