import React, { useState } from 'react';
import { IndianRupee, Users, Calendar, ArrowRight, Loader2, Sparkles, MapPin } from 'lucide-react';
import { validateTripForm, MAX_INPUT_LENGTH } from '../utils/validation';
import DestinationSearch from './DestinationSearch';
import OriginLocationSearch from './OriginLocationSearch';
import TravelStyleSelector from './TravelStyleSelector';

const TripForm = ({ onSubmit, initialValues = null, isCalculating = false, calculatingStage = '' }) => {
  const [formData, setFormData] = useState({
    origin: initialValues?.origin || '',
    originLocation: initialValues?.originLocation || null,
    destination: initialValues?.destination || '',
    budget: initialValues?.budget ? String(initialValues.budget) : '',
    travelers: initialValues?.travelers ? String(initialValues.travelers) : '2',
    duration: initialValues?.duration ? String(initialValues.duration) : '3',
    travelStyle: initialValues?.travelStyle || 'moderate',
  });

  const [errors, setErrors] = useState({});
  const [formLevelError, setFormLevelError] = useState(null);

  const saveDraft = (data) => {
    try {
      localStorage.setItem('budgettrip_trip_form_draft', JSON.stringify(data));
    } catch {
      // Ignore
    }
  };

  const handleChange = (field, value) => {
    const sanitized = typeof value === 'string' && value.length > MAX_INPUT_LENGTH 
      ? value.slice(0, MAX_INPUT_LENGTH) 
      : value;

    setFormData((prev) => {
      const next = { ...prev, [field]: sanitized };
      saveDraft(next);
      return next;
    });

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    if (formLevelError) {
      setFormLevelError(null);
    }
  };

  const handleOriginSelect = (loc) => {
    if (loc) {
      const originName = loc.formattedName || loc.name;
      setFormData((prev) => {
        const next = {
          ...prev,
          origin: originName,
          originLocation: loc,
        };
        saveDraft(next);
        return next;
      });
      if (errors.origin) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.origin;
          return next;
        });
      }
    } else {
      setFormData((prev) => {
        const next = {
          ...prev,
          origin: '',
          originLocation: null,
        };
        saveDraft(next);
        return next;
      });
    }
  };

  const handleDestinationSelect = (destName) => {
    handleChange('destination', destName);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isCalculating) return; // Prevent double submission

    // Enforce verified origin location selection
    if (!formData.originLocation) {
      setErrors((prev) => ({
        ...prev,
        origin: 'Please select a verified starting location from the suggestions.',
      }));
      return;
    }

    const { isValid, errors: validationErrors, formError } = validateTripForm(formData);

    if (!isValid) {
      setErrors(validationErrors);
      setFormLevelError(formError);
      return;
    }

    setErrors({});
    setFormLevelError(null);

    onSubmit({
      origin: formData.origin.trim(),
      originLocation: formData.originLocation,
      destination: formData.destination.trim(),
      budget: Number(formData.budget),
      travelers: parseInt(formData.travelers, 10),
      duration: parseInt(formData.duration, 10),
      travelStyle: formData.travelStyle,
    });
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      noValidate 
      className="space-y-8 bg-white p-5 sm:p-8 md:p-10 rounded-3xl border border-slate-200/90 shadow-soft"
    >
      {/* Global Form Level Error Banner */}
      {formLevelError && (
        <div 
          role="alert" 
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-shake"
        >
          <span className="text-base">⚠️</span>
          <span>{formLevelError}</span>
        </div>
      )}

      {/* ========================================================
          STEP 01: ROUTE & DESTINATION
      ======================================================== */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <span className="w-7 h-7 rounded-xl bg-primary text-white text-xs font-black flex items-center justify-center shadow-xs">
            01
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Where are you going?
            </h3>
            <p className="text-xs text-slate-500">
              Verify your starting location and pick a supported hotspot
            </p>
          </div>
        </div>

        {/* Origin Geocoding Autocomplete */}
        <OriginLocationSearch
          value={formData.origin}
          selectedLocation={formData.originLocation}
          onLocationSelect={handleOriginSelect}
          error={errors.origin}
        />

        {/* Destination Picker */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-secondary" />
              <span>Target Destination</span>
            </label>
            <span className="text-[11px] text-slate-400">16+ Curated Hotspots</span>
          </div>

          <DestinationSearch
            selectedDestination={formData.destination}
            onSelect={handleDestinationSelect}
            error={errors.destination}
          />

          {errors.destination && (
            <p className="text-xs text-red-600 mt-1 font-medium">{errors.destination}</p>
          )}
        </div>
      </section>

      {/* ========================================================
          STEP 02: TRIP PARAMETERS
      ======================================================== */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <span className="w-7 h-7 rounded-xl bg-secondary text-white text-xs font-black flex items-center justify-center shadow-xs">
            02
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Tell us about your trip
            </h3>
            <p className="text-xs text-slate-500">
              Enter your target budget, number of travelers, and trip length
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Target Budget */}
          <div>
            <label 
              htmlFor="budget" 
              className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-secondary" />
                Total Budget
              </span>
              <span className="text-[10px] text-slate-400">in INR (₹)</span>
            </label>
            <div className="relative">
              <input
                id="budget"
                type="number"
                min="1"
                step="1"
                value={formData.budget}
                onChange={(e) => handleChange('budget', e.target.value)}
                placeholder="e.g. 25000"
                className={`w-full px-4 py-3 text-sm bg-white border rounded-xl transition duration-150 focus:outline-none focus:ring-2 ${
                  errors.budget 
                    ? 'border-red-400 focus:ring-red-200 bg-red-50/20' 
                    : 'border-slate-200 focus:border-secondary focus:ring-secondary/20'
                }`}
              />
            </div>
            {errors.budget && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.budget}</p>
            )}
          </div>

          {/* Number of Travelers */}
          <div>
            <label 
              htmlFor="travelers" 
              className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-secondary" />
                Travelers
              </span>
              <span className="text-[10px] text-slate-400">1–50 People</span>
            </label>
            <div className="relative">
              <input
                id="travelers"
                type="number"
                min="1"
                max="50"
                value={formData.travelers}
                onChange={(e) => handleChange('travelers', e.target.value)}
                className={`w-full px-4 py-3 text-sm bg-white border rounded-xl transition duration-150 focus:outline-none focus:ring-2 ${
                  errors.travelers 
                    ? 'border-red-400 focus:ring-red-200 bg-red-50/20' 
                    : 'border-slate-200 focus:border-secondary focus:ring-secondary/20'
                }`}
              />
            </div>
            {errors.travelers && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.travelers}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label 
              htmlFor="duration" 
              className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-secondary" />
                Duration
              </span>
              <span className="text-[10px] text-slate-400">1–90 Days</span>
            </label>
            <div className="relative">
              <input
                id="duration"
                type="number"
                min="1"
                max="90"
                value={formData.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
                className={`w-full px-4 py-3 text-sm bg-white border rounded-xl transition duration-150 focus:outline-none focus:ring-2 ${
                  errors.duration 
                    ? 'border-red-400 focus:ring-red-200 bg-red-50/20' 
                    : 'border-slate-200 focus:border-secondary focus:ring-secondary/20'
                }`}
              />
            </div>
            {errors.duration && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.duration}</p>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================
          STEP 03: TRAVEL STYLE
      ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <span className="w-7 h-7 rounded-xl bg-accent text-slate-950 text-xs font-black flex items-center justify-center shadow-xs">
            03
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              How do you travel?
            </h3>
            <p className="text-xs text-slate-500">
              Tailors accommodation, dining, transit, and activity allocations
            </p>
          </div>
        </div>

        <TravelStyleSelector
          value={formData.travelStyle}
          onChange={(style) => handleChange('travelStyle', style)}
          error={errors.travelStyle}
        />
      </section>

      {/* ========================================================
          SUBMIT ACTION BUTTON
      ======================================================== */}
      <div className="pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={isCalculating}
          className="w-full py-4 px-6 bg-gradient-to-r from-primary via-primary-light to-secondary hover:opacity-95 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-elevated transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:pointer-events-none"
        >
          {isCalculating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{calculatingStage || 'Calculating trip feasibility...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-accent" />
              <span>Calculate My Trip Feasibility</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-slate-400 mt-2.5">
          Pure deterministic arithmetic • Instant AI expense calibration • Zero booking fees
        </p>
      </div>
    </form>
  );
};

export default TripForm;
