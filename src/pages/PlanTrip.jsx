import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TripForm from '../components/TripForm';
import { destinationCosts } from '../data/destinationCosts';
import { calculateExpenses } from '../utils/calculateExpenses';
import { analyzeBudgetFeasibility } from '../utils/budgetAnalysis';
import { getFallbackSmartSuggestions } from '../services/aiSuggestionsApi';
import { fetchDestinationWeather } from '../services/weatherApi';
import { Sparkles, AlertCircle } from 'lucide-react';

const PlanTrip = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatingStage, setCalculatingStage] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const initialValues = (() => {
    // 1. Navigation state takes precedence if user navigated with preselected values
    if (location.state?.preselectedOrigin || location.state?.preselectedDestination) {
      return {
        origin: location.state.preselectedOrigin || '',
        originLocation: location.state.preselectedOriginLocation || null,
        destination: location.state.preselectedDestination || '',
        budget: '',
        travelers: '2',
        duration: '3',
        travelStyle: 'moderate',
      };
    }

    // 2. Restore saved draft on refresh so entered starting location and inputs are never lost
    try {
      const saved = localStorage.getItem('budgettrip_trip_form_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            origin: parsed.origin || '',
            originLocation: parsed.originLocation || null,
            destination: parsed.destination || '',
            budget: parsed.budget ? String(parsed.budget) : '',
            travelers: parsed.travelers ? String(parsed.travelers) : '2',
            duration: parsed.duration ? String(parsed.duration) : '3',
            travelStyle: parsed.travelStyle || 'moderate',
          };
        }
      }
    } catch {
      // Ignore localStorage parse errors
    }

    return {
      origin: '',
      originLocation: null,
      destination: '',
      budget: '',
      travelers: '2',
      duration: '3',
      travelStyle: 'moderate',
    };
  })();

  const handleTripCalculation = async (formData) => {
    setIsCalculating(true);
    setErrorMessage(null);
    setCalculatingStage('Calculating your trip expenditure across 3 categories...');

    try {
      const destinationMeta = destinationCosts[formData.destination];
      if (!destinationMeta) {
        throw new Error('Selected destination rate model not found.');
      }

      // 1. Direct, instantaneous expenditure calculation (Three Types of Expenditure & 3 Tiers)
      const expenses = calculateExpenses(
        destinationMeta,
        formData.travelers,
        formData.duration,
        formData.travelStyle
      );

      // 2. Budget Feasibility Analysis
      const feasibility = analyzeBudgetFeasibility(formData.budget, expenses.totalCost);

      // 3. Optional weather check for weather-aware smart suggestions
      let destinationWeather = null;
      if (destinationMeta.lat && destinationMeta.lon && navigator.onLine) {
        try {
          destinationWeather = await fetchDestinationWeather(destinationMeta.lat, destinationMeta.lon);
        } catch {
          // Weather failure does not block trip calculation
        }
      }

      // 4. Generate Rule-Based Smart Suggestions (No LLM, zero network errors)
      const smartSuggestions = getFallbackSmartSuggestions({
        destination: formData.destination,
        budget: Number(formData.budget),
        totalCost: expenses.totalCost,
        budgetDifference: Number(formData.budget) - expenses.totalCost,
        budgetStatus: feasibility.status,
        travelStyle: formData.travelStyle,
        expenses,
        duration: Number(formData.duration),
        weather: destinationWeather,
      });

      const completeTripData = {
        origin: formData.origin,
        originLocation: formData.originLocation,
        destination: formData.destination,
        budget: formData.budget,
        travelers: formData.travelers,
        duration: formData.duration,
        travelStyle: formData.travelStyle,
        destinationMeta,
        expenses,
        threeTiers: expenses.threeTiers,
        feasibility,
        summary: expenses.summary,
        assumptions: expenses.assumptions,
        smartSuggestions,
        weather: destinationWeather,
        calculatedAt: new Date().toISOString(),
      };

      // Cache active trip result for refresh resilience
      try {
        localStorage.setItem('budgettrip_active_result', JSON.stringify(completeTripData));
      } catch (err) {
        console.warn('Failed to cache trip result:', err);
      }

      // Navigate immediately to Result Dashboard
      setIsCalculating(false);
      navigate('/result', { state: { tripData: completeTripData } });
    } catch (err) {
      console.error('Trip calculation error:', err);
      setIsCalculating(false);
      setErrorMessage(err.message || 'Unable to calculate trip. Please check your inputs and try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8">
      {/* Title & Subtitle */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Smart Travel Command Center</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Plan Your Next Journey ✈️
        </h1>
        <p className="text-xs sm:text-base text-slate-500 leading-relaxed">
          Enter your starting point, pick a destination, set your budget, and choose how you travel.
          Get realistic expenditure estimates across 3 key categories and compare budget tiers instantly.
        </p>
      </div>

      {/* Global Calculation Error Alert */}
      {errorMessage && (
        <div 
          role="alert" 
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-center justify-between gap-3 animate-shake"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Guided Trip Form */}
      <TripForm
        onSubmit={handleTripCalculation}
        initialValues={initialValues}
        isCalculating={isCalculating}
        calculatingStage={calculatingStage}
      />
    </div>
  );
};

export default PlanTrip;
