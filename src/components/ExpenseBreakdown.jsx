import React from 'react';
import ExpenseCard from './ExpenseCard';
import { formatCurrency } from '../utils/calculateExpenses';
import { Layers } from 'lucide-react';

const ExpenseBreakdown = ({ categories = [], totalCost = 0, travelers = 1, duration = 1 }) => {
  return (
    <div className="space-y-6">
      {/* Visual Multi-Segment Proportion Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                Three Types of Expenditure Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                1. Transit & Commute • 2. Stay & Accommodation • 3. Food & Activities
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Per traveler: <strong className="text-slate-800 font-bold">{formatCurrency(totalCost / travelers)}</strong> • Per day: <strong className="text-slate-800 font-bold">{formatCurrency(totalCost / duration)}</strong>
          </div>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner mb-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="h-full transition-all duration-300 relative group cursor-pointer"
              style={{
                width: `${cat.percentage}%`,
                backgroundColor: cat.color,
              }}
              title={`${cat.name}: ${formatCurrency(cat.amount)} (${cat.percentage}%)`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center space-x-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: cat.color }}
              />
              <span className="font-medium">{cat.shortName}</span>
              <span className="text-slate-400 font-normal">({cat.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid of Individual Expense Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <ExpenseCard key={category.id} category={category} />
        ))}

        {/* Total Cost Summary Card */}
        <div className="bg-gradient-to-br from-primary to-primary-light text-white p-5 rounded-2xl shadow-elevated flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-200">
              Complete Trip
            </span>
            <h4 className="text-lg font-bold text-white mt-1 mb-2">
              Estimated Total
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              Consolidated estimate for {travelers} traveler{travelers > 1 ? 's' : ''} for a {duration}-day journey.
            </p>
          </div>

          <div className="pt-4 border-t border-white/20 mt-4">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {formatCurrency(totalCost)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseBreakdown;
