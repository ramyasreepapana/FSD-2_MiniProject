import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, Search, Check, Loader2, X, AlertCircle } from 'lucide-react';
import { searchLocations } from '../services/geocodingApi';

const OriginLocationSearch = ({
  value = '',
  selectedLocation = null,
  onLocationSelect,
  error = null,
}) => {
  const [inputValue, setInputValue] = useState(selectedLocation?.formattedName || value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const [prevSelected, setPrevSelected] = useState(selectedLocation);
  const [prevVal, setPrevVal] = useState(value);

  // Sync internal input value if selectedLocation or value changes from outside
  if (selectedLocation !== prevSelected || value !== prevVal) {
    setPrevSelected(selectedLocation);
    setPrevVal(value);
    if (selectedLocation?.formattedName) {
      setInputValue(selectedLocation.formattedName);
    } else if (selectedLocation?.name) {
      setInputValue(selectedLocation.name);
    } else if (value) {
      setInputValue(value);
    } else if (!value && !selectedLocation) {
      setInputValue('');
    }
  }

  // Debounced search
  useEffect(() => {
    let isMounted = true;

    const handler = setTimeout(async () => {
      // Don't search if the input matches already selected location
      if (selectedLocation && (inputValue === selectedLocation.formattedName || inputValue === selectedLocation.name)) {
        if (isMounted) {
          setSuggestions([]);
          setIsOpen(false);
        }
        return;
      }

      if (!inputValue || inputValue.trim().length < 2) {
        if (isMounted) {
          setSuggestions([]);
          setIsOpen(false);
          setLoading(false);
          setHasSearched(false);
          setSearchError(null);
        }
        return;
      }

      if (isMounted) {
        setLoading(true);
        setSearchError(null);
      }

      try {
        const results = await searchLocations(inputValue.trim(), 5);
        if (isMounted) {
          setSuggestions(results);
          setHasSearched(true);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }
      } catch (err) {
        if (isMounted) {
          setSearchError(err.message || 'Unable to fetch location suggestions.');
          setSuggestions([]);
          setIsOpen(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, 300); // 300ms debounce

    return () => {
      isMounted = false;
      clearTimeout(handler);
    };
  }, [inputValue, selectedLocation]);

  // Click outside listener to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback((location) => {
    setInputValue(location.formattedName);
    setIsOpen(false);
    setSuggestions([]);
    setSearchError(null);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  }, [onLocationSelect]);

  const handleClear = () => {
    setInputValue('');
    setSuggestions([]);
    setIsOpen(false);
    setSearchError(null);
    setHasSearched(false);
    if (onLocationSelect) {
      onLocationSelect(null);
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const isInvalidText = hasSearched && !loading && suggestions.length === 0 && !selectedLocation && inputValue.trim().length >= 2;

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label 
        htmlFor="origin-search" 
        className="block text-xs sm:text-sm font-semibold text-slate-800 flex items-center justify-between"
      >
        <span className="flex items-center gap-1.5">
          <Navigation className="w-4 h-4 text-secondary" />
          <span>Starting Location (Origin)</span>
        </span>
        <span className="text-[11px] font-normal text-slate-400">e.g. Vijayawada, Delhi, Hyderabad</span>
      </label>

      {/* Input container */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-secondary" />
          ) : selectedLocation ? (
            <Check className="w-4 h-4 text-emerald-600 font-bold" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        <input
          id="origin-search"
          ref={inputRef}
          type="text"
          value={inputValue}
          maxLength={100}
          autoComplete="off"
          onChange={(e) => {
            setInputValue(e.target.value);
            // If user changes text, unselect previous location until newly confirmed
            if (selectedLocation && e.target.value !== selectedLocation.formattedName) {
              onLocationSelect(null);
            }
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search starting city (e.g. Vijayawada)..."
          className={`w-full pl-10 pr-10 py-3 text-sm bg-white border rounded-xl transition duration-150 focus:outline-none focus:ring-2 ${
            error || isInvalidText
              ? 'border-red-400 focus:ring-red-200 bg-red-50/20'
              : selectedLocation
              ? 'border-emerald-400 focus:ring-emerald-200 bg-emerald-50/20 text-slate-900 font-medium'
              : 'border-slate-200 focus:border-secondary focus:ring-secondary/20'
          }`}
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-describedby={error ? 'origin-error' : undefined}
        />

        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            aria-label="Clear location"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Verified Location Badge */}
      {selectedLocation && (
        <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="font-semibold">{selectedLocation.formattedName || selectedLocation.name}</span>
            <span className="text-emerald-700 text-[10px] uppercase font-bold bg-emerald-100 px-1.5 py-0.5 rounded">Verified</span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] text-emerald-700 hover:underline font-semibold"
          >
            Change
          </button>
        </div>
      )}

      {/* Suggestion Dropdown */}
      {isOpen && (
        <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-elevated overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
          {searchError ? (
            <div className="p-4 text-xs text-amber-800 bg-amber-50 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>{searchError}</span>
            </div>
          ) : suggestions.length > 0 ? (
            <ul role="listbox" className="py-1">
              {suggestions.map((loc, idx) => (
                <li
                  key={loc.id || `${loc.latitude}-${loc.longitude}-${idx}`}
                  role="option"
                  aria-selected={highlightedIndex === idx}
                  onClick={() => handleSelect(loc)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-4 py-2.5 text-xs sm:text-sm cursor-pointer transition flex items-center justify-between ${
                    highlightedIndex === idx ? 'bg-secondary/10 text-primary' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <MapPin className={`w-4 h-4 flex-shrink-0 ${highlightedIndex === idx ? 'text-secondary' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-bold text-slate-900 block">{loc.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {loc.countryCode || ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : hasSearched ? (
            <div className="p-4 text-center text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">❌ Location not found</p>
              <p className="text-[11px]">We couldn't find "{inputValue}". Please select a recognized city or region.</p>
            </div>
          ) : null}
        </div>
      )}

      {/* Field Validation Error Feedback */}
      {error && !selectedLocation && (
        <p id="origin-error" className="text-xs text-red-600 flex items-center gap-1 mt-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Invalid Text Feedback */}
      {isInvalidText && !error && (
        <p className="text-xs text-amber-700 flex items-center gap-1 mt-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>We couldn't find this location. Please select a valid starting destination.</span>
        </p>
      )}
    </div>
  );
};

export default OriginLocationSearch;
