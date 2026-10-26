import React, { useState, useMemo } from 'react';
import { Search, X, Check } from 'lucide-react';
import { destinationList } from '../data/destinationCosts';
import { formatCurrency } from '../utils/calculateExpenses';
import EmptyState from './EmptyState';

const CATEGORIES = ['All', 'Beach & Leisure', 'Mountains & Snow', 'Royal Heritage', 'Hill Station', 'International'];

const DestinationSearch = ({ selectedDestination, onSelect, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredDestinations = useMemo(() => {
    return destinationList.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category.includes(activeCategory);
      const term = searchTerm.trim().toLowerCase();
      if (!term) return matchesCategory;

      const matchesName = item.name.toLowerCase().includes(term);
      const matchesRegion = item.region.toLowerCase().includes(term);
      const matchesHighlights = item.popularHighlights?.some(h => h.toLowerCase().includes(term));
      const matchesCategoryName = item.category.toLowerCase().includes(term);

      return matchesCategory && (matchesName || matchesRegion || matchesHighlights || matchesCategoryName);
    });
  }, [searchTerm, activeCategory]);

  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveCategory('All');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            maxLength={100}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search destination (e.g. Goa, Manali, Dubai)..."
            className={`w-full pl-10 pr-10 py-2.5 text-sm bg-white border rounded-xl transition duration-150 focus:outline-none focus:ring-2 focus:ring-secondary/20 ${
              error ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-secondary'
            }`}
            aria-label="Search destinations"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills (Horizontal scrolling safe) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Destination Banner */}
      {selectedDestination && (
        <div className="flex items-center justify-between p-3 bg-secondary/10 border border-secondary/20 rounded-xl text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-secondary font-bold" />
            <span className="text-slate-700">
              Selected Destination: <strong className="text-primary font-bold">{selectedDestination}</strong>
            </span>
          </div>
          <span className="text-xs text-secondary font-semibold">Ready to calculate</span>
        </div>
      )}

      {/* Destination Grid or Empty State */}
      {filteredDestinations.length === 0 ? (
        <div className="py-6">
          <EmptyState
            icon="🔍"
            title="No destinations found"
            description="We couldn't find a matching destination. Try another destination."
            actionLabel="Clear Search"
            onAction={handleClearSearch}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto p-1 rounded-xl border border-slate-100 bg-slate-50/50">
          {filteredDestinations.map((dest) => {
            const isSelected = selectedDestination === dest.name;
            return (
              <button
                key={dest.id}
                type="button"
                onClick={() => onSelect(dest.name)}
                className={`text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between group ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20'
                    : 'border-slate-200 bg-white hover:border-secondary hover:shadow-soft'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="font-bold text-slate-800 group-hover:text-primary transition text-sm">
                      {dest.name}
                    </span>
                    <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {dest.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                    {dest.region}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2 italic mb-3">
                    "{dest.tagline}"
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Avg Daily:</span>
                  <span className="font-semibold text-primary">
                    ~{formatCurrency(dest.hotelPerNight + dest.foodPerPersonPerDay + dest.transportPerPersonPerDay)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DestinationSearch;
