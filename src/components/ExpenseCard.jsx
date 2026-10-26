import React from 'react';
import { formatCurrency } from '../utils/calculateExpenses';

const ExpenseCard = ({ category }) => {
  const { icon, name, amount, percentage, description, color } = category;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-soft transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl sm:text-3xl p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              {icon}
            </span>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-slate-800">
                {name}
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">
                {percentage}% of total
              </span>
            </div>
          </div>

          <span className="text-base sm:text-lg font-extrabold text-slate-900">
            {formatCurrency(amount)}
          </span>
        </div>

        <p className="text-xs text-slate-500 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100/80">
          {description}
        </p>
      </div>

      {/* Mini Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.max(4, percentage)}%`,
            backgroundColor: color || '#2A9D8F',
          }}
        />
      </div>
    </div>
  );
};

export default ExpenseCard;
