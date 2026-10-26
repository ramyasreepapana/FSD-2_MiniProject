import React from 'react';
import { Sparkles, Lightbulb, Compass, CloudSun, ShieldAlert, ArrowUpRight } from 'lucide-react';

const CATEGORY_ICONS = {
  Accommodation: Lightbulb,
  Transport: Compass,
  'Budget Optimization': ShieldAlert,
  'Safety Buffer': ShieldAlert,
  'Weather Prep': CloudSun,
  Activities: Sparkles,
};

const IMPACT_STYLES = {
  High: {
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    dot: 'bg-rose-500',
    border: 'border-l-rose-500',
  },
  Medium: {
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    border: 'border-l-amber-500',
  },
  Low: {
    badge: 'bg-teal-100 text-teal-800 border-teal-200',
    dot: 'bg-teal-500',
    border: 'border-l-teal-500',
  },
};

const SmartSuggestions = ({
  suggestionsData,
  destination = '',
  travelStyle = 'moderate',
}) => {
  if (!suggestionsData) return null;

  const {
    overallAdvice,
    suggestions = [],
  } = suggestionsData;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent/30 to-secondary/30 flex items-center justify-center text-primary shadow-xs">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                Smart Trip Recommendations
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Actionable advice tailored for your {destination} itinerary ({travelStyle} style)
            </p>
          </div>
        </div>

        {/* Strategy Tag */}
        <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Expert Recommendations</span>
        </span>
      </div>

      {/* Overall Strategic Advice Card */}
      {overallAdvice && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border border-primary/10">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary block mb-1">
            Trip Strategy & Optimization
          </span>
          <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
            "{overallAdvice}"
          </p>
        </div>
      )}

      {/* Suggestions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((item, index) => {
          const impact = item.impact || 'Medium';
          const style = IMPACT_STYLES[impact] || IMPACT_STYLES.Medium;
          const CategoryIcon = CATEGORY_ICONS[item.category] || Lightbulb;

          return (
            <div
              key={index}
              className={`p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all duration-200 border-l-4 ${style.border} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600">
                    <CategoryIcon className="w-3.5 h-3.5 text-secondary" />
                    <span>{item.category || 'General'}</span>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${style.badge}`}
                  >
                    <span className={`w-1 h-1 rounded-full ${style.dot}`} />
                    <span>{impact} Impact</span>
                  </span>
                </div>

                <h4 className="font-bold text-sm sm:text-base text-slate-900 mb-1.5 flex items-start justify-between">
                  <span>{item.title}</span>
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Actionable Tip #{index + 1}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SmartSuggestions;
