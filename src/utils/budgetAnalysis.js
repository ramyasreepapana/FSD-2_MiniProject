/**
 * Budget Feasibility Analysis Utility
 * 
 * Compares user budget against estimated total expenses and determines feasibility:
 * - Within budget: displays remaining savings
 * - Exceeds budget: displays additional amount needed
 */

import { formatCurrency } from './calculateExpenses.js';

/**
 * Perform budget feasibility comparison
 * 
 * @param {number} userBudget - User's proposed budget
 * @param {number} estimatedTotal - Calculated total trip cost
 * @returns {Object} Analysis metrics, difference, status and recommendation
 */
export const analyzeBudgetFeasibility = (userBudget, estimatedTotal) => {
  const budget = Math.max(0, Number(userBudget) || 0);
  const total = Math.max(0, Number(estimatedTotal) || 0);

  const difference = budget - total;
  const isWithinBudget = difference >= 0;
  const percentageUsed = budget > 0 ? Math.round((total / budget) * 100) : 100;

  if (isWithinBudget) {
    return {
      isWithinBudget: true,
      status: 'within',
      headline: 'Trip is within your budget',
      badgeText: 'Within Budget ✓',
      icon: '🟢',
      difference: Math.abs(difference),
      differenceFormatted: formatCurrency(Math.abs(difference)),
      diffLabel: 'Remaining Savings',
      estimatedFormatted: formatCurrency(total),
      budgetFormatted: formatCurrency(budget),
      percentageUsed,
      message: `Great news! Your budget comfortably covers this trip with ${formatCurrency(Math.abs(difference))} remaining as a safety cushion for shopping or unexpected indulgences.`,
      themeColor: '#16A34A',
      bgColor: '#F0FDF4',
      borderColor: '#BBF7D0',
      textColor: '#166534'
    };
  }

  return {
    isWithinBudget: false,
    status: 'exceeds',
    headline: 'Trip exceeds your budget',
    badgeText: 'Exceeds Budget ⚠️',
    icon: '🔴',
    difference: Math.abs(difference),
    differenceFormatted: formatCurrency(Math.abs(difference)),
    diffLabel: 'Additional Amount Needed',
    estimatedFormatted: formatCurrency(total),
    budgetFormatted: formatCurrency(budget),
    percentageUsed,
    message: `This trip is estimated to cost ${formatCurrency(Math.abs(difference))} more than your current budget. Consider adjusting duration, travelers, or saving up a bit more before booking.`,
    themeColor: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA',
    textColor: '#991B1B'
  };
};
