import React from 'react';
import { Wallet, Sliders, Crown, Check } from 'lucide-react';

const TRAVEL_STYLES = [
  {
    id: 'budget',
    title: 'Budget',
    badge: 'Economical',
    description: 'Save more with economical stays, transit, and free activities.',
    icon: Wallet,
    color: 'emerald',
    borderColor: 'border-emerald-500',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-700',
    ringColor: 'ring-emerald-500',
  },
  {
    id: 'moderate',
    title: 'Moderate',
    badge: 'Popular',
    description: 'Balance comfort and cost with pleasant stays and balanced travel.',
    icon: Sliders,
    color: 'teal',
    borderColor: 'border-teal-500',
    bgColor: 'bg-teal-500/10',
    textColor: 'text-teal-700',
    ringColor: 'ring-teal-500',
  },
  {
    id: 'premium',
    title: 'Premium',
    badge: 'Luxury',
    description: 'Prioritize comfort, convenience, boutique hotels, and curated experiences.',
    icon: Crown,
    color: 'amber',
    borderColor: 'border-amber-500',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-700',
    ringColor: 'ring-amber-500',
  },
];

const TravelStyleSelector = ({ value = 'moderate', onChange, error = null }) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <span>Choose Your Travel Style</span>
        </label>
        <span className="text-[11px] text-slate-400 font-medium">Personalizes AI cost predictions</span>
      </div>

      <div 
        role="radiogroup" 
        aria-label="Travel Style Options"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {TRAVEL_STYLES.map((style) => {
          const isSelected = value === style.id;
          const IconComponent = style.icon;

          return (
            <div
              key={style.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onChange(style.id)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  onChange(style.id);
                }
              }}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative flex flex-col justify-between select-none ${
                isSelected
                  ? `${style.borderColor} bg-white shadow-soft ring-2 ${style.ringColor}/20`
                  : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white text-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`p-2 rounded-xl flex items-center justify-center transition ${
                        isSelected ? style.bgColor : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <IconComponent className={`w-4 h-4 ${isSelected ? style.textColor : 'text-slate-500'}`} />
                    </span>
                    <span className="font-bold text-sm sm:text-base text-slate-900">
                      {style.title}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isSelected
                        ? `${style.bgColor} ${style.textColor}`
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {style.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {style.description}
                </p>
              </div>

              {/* Selection Checkmark Indicator */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-slate-400">
                  {style.id === 'budget' ? 'Economy Tier' : style.id === 'moderate' ? 'Standard Tier' : 'Premium Tier'}
                </span>
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition ${
                    isSelected ? 'bg-primary text-white' : 'border border-slate-300'
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
};

export default TravelStyleSelector;
