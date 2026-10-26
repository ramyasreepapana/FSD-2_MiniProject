import React from 'react';
import { CheckCircle2, AlertOctagon, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../utils/calculateExpenses';

const BudgetStatus = ({ analysis, budget, estimatedTotal }) => {
  if (!analysis) return null;

  const { isWithinBudget, differenceFormatted, diffLabel, headline, message, percentageUsed } = analysis;

  return (
    <div
      role="region"
      aria-label="Budget Feasibility Analysis"
      className={`rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 transition-all shadow-soft ${
        isWithinBudget 
          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' 
          : 'bg-red-50/70 border-red-300 text-red-950'
      }`}
    >
      {/* Header Status & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-black/5">
        <div className="flex items-center space-x-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm flex-shrink-0 ${
              isWithinBudget ? 'bg-emerald-600' : 'bg-red-600'
            }`}
          >
            {isWithinBudget ? (
              <CheckCircle2 className="w-7 h-7" />
            ) : (
              <AlertOctagon className="w-7 h-7" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight">
                {headline}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium opacity-85 mt-0.5">
              {isWithinBudget ? '🟢 Feasible' : '🔴 Financial Adjustment Recommended'}
            </p>
          </div>
        </div>

        {/* Prominent Badge */}
        <span
          className={`self-start sm:self-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs ${
            isWithinBudget
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {isWithinBudget ? 'Within Budget ✓' : 'Exceeds Budget ⚠️'}
        </span>
      </div>

      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Stat 1: Estimated Total */}
        <div className="bg-white/90 p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">
            Estimated Trip Cost
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {formatCurrency(estimatedTotal)}
          </span>
        </div>

        {/* Stat 2: User's Budget */}
        <div className="bg-white/90 p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">
            Your Budget
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {formatCurrency(budget)}
          </span>
        </div>

        {/* Stat 3: Difference (Remaining vs Needed) */}
        <div
          className={`p-4 rounded-2xl border shadow-xs ${
            isWithinBudget
              ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900'
              : 'bg-red-100/70 border-red-300 text-red-900'
          }`}
        >
          <span className="text-xs font-semibold block mb-1">
            {diffLabel}
          </span>
          <div className="flex items-center gap-1.5">
            {isWithinBudget ? (
              <TrendingDown className="w-5 h-5 text-emerald-700" />
            ) : (
              <TrendingUp className="w-5 h-5 text-red-700" />
            )}
            <span className="text-xl sm:text-2xl font-black">
              {differenceFormatted}
            </span>
          </div>
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="space-y-1.5 mb-4">
        <div className="flex justify-between text-xs font-semibold text-slate-700">
          <span>Budget Utilization</span>
          <span>{percentageUsed}% of planned budget</span>
        </div>
        <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isWithinBudget ? 'bg-emerald-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, percentageUsed)}%` }}
          />
        </div>
      </div>

      {/* Explanatory Message */}
      <p className="text-xs sm:text-sm font-medium leading-relaxed opacity-90">
        {message}
      </p>
    </div>
  );
};

export default BudgetStatus;
