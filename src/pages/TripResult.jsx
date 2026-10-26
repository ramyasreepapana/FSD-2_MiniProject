import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Check, Loader2, Navigation, 
  Users, Calendar, AlertCircle, PlusCircle, Sparkles, Plane,
  Info, MapPin, Wallet, Sliders, Crown
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { tripService } from '../services/tripService';
import { formatCurrency } from '../utils/calculateExpenses';
import { analyzeBudgetFeasibility } from '../utils/budgetAnalysis';
import BudgetStatus from '../components/BudgetStatus';
import ExpenseBreakdown from '../components/ExpenseBreakdown';
import SmartSuggestions from '../components/SmartSuggestions';
import WeatherCard from '../components/WeatherCard';
import EmptyState from '../components/EmptyState';

const STYLE_ICONS = {
  budget: Wallet,
  moderate: Sliders,
  premium: Crown,
};

const TripResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const tripData = location.state?.tripData || (() => {
    try {
      const cached = localStorage.getItem('budgettrip_active_result');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  })();

  const [activeTier, setActiveTier] = useState(tripData?.travelStyle || 'moderate');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Graceful handling if no calculation exists
  if (!tripData) {
    return (
      <div className="py-16 px-4 max-w-lg mx-auto">
        <EmptyState
          icon="✈️"
          title="No Trip Calculated Yet"
          description="It looks like you haven't calculated a trip yet, or your previous session has ended."
          actionLabel="Plan a Trip Now"
          onAction={() => navigate('/plan')}
        />
      </div>
    );
  }

  const {
    origin,
    originLocation,
    destination,
    budget,
    travelers,
    duration,
    travelStyle = 'moderate',
    destinationMeta,
    expenses,
    feasibility,
    summary,
    assumptions = [],
    smartSuggestions,
    weather,
  } = tripData;

  // Active tier breakdown (falls back to base expenses)
  const currentTierData = tripData.threeTiers?.[activeTier] || expenses;
  const currentTotalCost = currentTierData.totalCost || expenses.totalCost;
  const currentFeasibility = analyzeBudgetFeasibility(budget, currentTotalCost);
  const currentCategories = currentTierData.categories || expenses.categories;
  const currentSummary = currentTierData.summary || summary;
  const currentAssumptions = currentTierData.assumptions || assumptions;

  const StyleIcon = STYLE_ICONS[activeTier] || Sliders;

  const handleSaveTrip = async () => {
    if (isSaving || isSaved) return;

    if (!isAuthenticated || !user) {
      navigate('/login', {
        state: {
          from: location,
          message: 'Please log in to save your trip calculation to your account.',
        },
      });
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const record = {
        user_id: user.id,
        origin,
        origin_location: originLocation,
        destination,
        travelers: Number(travelers),
        duration: Number(duration),
        budget: Number(budget),
        travel_style: travelStyle,
        travel_cost: expenses.travelCost,
        accommodation_cost: expenses.accommodationCost,
        food_cost: expenses.foodCost,
        transport_cost: expenses.transportCost,
        activities_cost: expenses.activitiesCost,
        total_cost: expenses.totalCost,
        budget_difference: feasibility.difference * (feasibility.isWithinBudget ? 1 : -1),
        budget_status: feasibility.status,
        ai_summary: (tripData?.aiSummary || summary) || null,
        ai_suggestions: smartSuggestions || null,
        weather: weather || null,
      };

      await tripService.saveTrip(record);
      setIsSaved(true);
    } catch (err) {
      console.error('Failed to save trip:', err);
      setSaveError(
        err.message?.includes('fetch') || !navigator.onLine
          ? 'Unable to complete this request. Please check your internet connection and try again.'
          : err.message || 'We could not save your trip. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-10 px-3 sm:px-6 space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <button
          type="button"
          onClick={() => navigate('/plan', {
            state: {
              preselectedOrigin: origin,
              preselectedOriginLocation: originLocation,
              preselectedDestination: destination,
            }
          })}
          className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-primary transition self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Trip Parameters</span>
        </button>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <Link
            to="/plan"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Plan Another</span>
          </Link>

          <button
            type="button"
            onClick={handleSaveTrip}
            disabled={isSaving || isSaved}
            className={`px-4 sm:px-5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2 ${
              isSaved
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-primary hover:bg-primary-light text-white active:scale-95 disabled:opacity-60'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : isSaved ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Saved to My Trips ✓</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Save Itinerary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Error Alert */}
      {saveError && (
        <div 
          role="alert" 
          className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{saveError}</span>
          </div>
          <button 
            type="button" 
            onClick={handleSaveTrip}
            className="text-xs font-bold underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* ========================================================
          BOARDING PASS / TRAVEL ROUTE HEADER
      ======================================================== */}
      <section className="bg-gradient-to-br from-primary via-primary-dark to-[#08222B] text-white rounded-3xl p-6 sm:p-8 shadow-elevated relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-secondary/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative space-y-6">
          {/* Top route row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            {/* Origin */}
            <div className="space-y-1">
              <span className="text-[11px] uppercase font-bold tracking-widest text-teal-300 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5" />
                Origin Point
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {origin}
              </h2>
              {originLocation?.admin1 && (
                <p className="text-xs text-slate-300">
                  {originLocation.admin1}, {originLocation.country}
                </p>
              )}
            </div>

            {/* Visual Route Indicator */}
            <div className="flex flex-col items-center justify-center px-4 py-2 bg-white/5 rounded-2xl border border-white/10 self-start md:self-center">
              <div className="flex items-center space-x-2 text-accent">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                <span className="h-[2px] w-12 sm:w-20 bg-gradient-to-r from-teal-400 to-accent"></span>
                <Plane className="w-5 h-5 text-accent animate-pulse" />
                <span className="h-[2px] w-12 sm:w-20 bg-gradient-to-r from-accent to-secondary-light"></span>
                <span className="w-2 h-2 rounded-full bg-secondary-light"></span>
              </div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-300 mt-1">
                {duration} Days • Direct Route
              </span>
            </div>

            {/* Destination */}
            <div className="space-y-1 md:text-right">
              <span className="text-[11px] uppercase font-bold tracking-widest text-secondary-light flex items-center md:justify-end gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Destination Hotspot
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {destination}
              </h2>
              <p className="text-xs text-slate-300">
                {destinationMeta?.region || 'Curated Hotspot'}
              </p>
            </div>
          </div>

          {/* Bottom metadata chips */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-white font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-300" />
              <span>{duration} Days Itinerary</span>
            </span>

            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-white font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-300" />
              <span>{travelers} Traveler{travelers > 1 ? 's' : ''}</span>
            </span>

            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-white font-medium flex items-center gap-1.5 capitalize">
              <StyleIcon className="w-3.5 h-3.5 text-accent" />
              <span>{activeTier} Travel Style</span>
            </span>

            {/* Benchmark Status Chip */}
            <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 font-semibold text-teal-200 flex items-center gap-1.5 ml-auto">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Benchmark Calibrated</span>
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================
          THREE TYPES OF EXPENDITURE (BUDGET TIERS COMPARISON)
      ======================================================== */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-secondary/10 text-secondary text-xs font-black uppercase tracking-wider">
                Expenditure Tiers
              </span>
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                Three Types of Travel Expenditure
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Compare Budget, Moderate, and Premium expenditures for your {duration}-day trip to {destination} ({travelers} traveler{travelers > 1 ? 's' : ''})
            </p>
          </div>

          <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
            Click any tier to switch the active breakdown
          </span>
        </div>

        {/* 3 Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 'budget',
              name: 'Type 1: Budget Expenditure',
              shortName: 'Budget Tier',
              icon: Wallet,
              desc: 'Economical guesthouses/hostels, public buses/trains, local street food & free sights',
              data: tripData.threeTiers?.budget,
            },
            {
              id: 'moderate',
              name: 'Type 2: Moderate Expenditure',
              shortName: 'Moderate Tier',
              icon: Sliders,
              desc: 'Comfortable 3-star hotels, standard cabs/autos, restaurant dining & popular sights',
              data: tripData.threeTiers?.moderate,
            },
            {
              id: 'premium',
              name: 'Type 3: Premium Expenditure',
              shortName: 'Premium / Luxury Tier',
              icon: Crown,
              desc: '4/5-star boutique resorts, private chauffeur cabs, fine dining & curated experiences',
              data: tripData.threeTiers?.premium,
            },
          ].map((tier) => {
            const isSelected = activeTier === tier.id;
            const tierTotal = tier.data?.totalCost || 0;
            const isWithin = Number(budget) >= tierTotal;
            const diff = Math.abs(Number(budget) - tierTotal);
            const TierIcon = tier.icon;

            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setActiveTier(tier.id)}
                className={`p-5 rounded-2xl border text-left transition-all duration-200 relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.02] shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <TierIcon className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-800">
                        {tier.shortName}
                      </h4>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-white px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    {tier.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 font-medium">Estimated Cost</span>
                    <span className="text-lg font-black text-slate-900">
                      {formatCurrency(tierTotal)}
                    </span>
                  </div>

                  <div className={`text-[11px] font-bold px-2 py-1 rounded-lg flex items-center justify-between ${
                    isWithin
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}>
                    <span>{isWithin ? '✓ Within Budget' : '⚠️ Exceeds Budget'}</span>
                    <span>{isWithin ? `+${formatCurrency(diff)}` : `-${formatCurrency(diff)}`}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          BUDGET STATUS & FEASIBILITY GAUGE
      ======================================================== */}
      <BudgetStatus
        analysis={currentFeasibility}
        budget={Number(budget)}
        estimatedTotal={currentTotalCost}
      />

      {/* ========================================================
          EXPENSE SUMMARY & PLANNING ASSUMPTIONS
      ======================================================== */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              {currentTierData.styleMeta?.label || `${activeTier.toUpperCase()} Expenditure Analysis`}
            </h3>
          </div>

          <span className="text-[11px] text-slate-500 font-medium">
            Standard Destination Rates Model
          </span>
        </div>

        {currentSummary && (
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
            "{currentSummary}"
          </p>
        )}

        {currentAssumptions.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Planning Assumptions:
            </span>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              {currentAssumptions.map((assumption, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-secondary font-black">•</span>
                  <span>{assumption}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          <span>These are realistic planning estimates for budgeting purposes, not guaranteed booking prices.</span>
        </div>
      </section>

      {/* ========================================================
          THREE TYPES OF EXPENDITURE BREAKDOWN
      ======================================================== */}
      <ExpenseBreakdown
        categories={currentCategories}
        totalCost={currentTotalCost}
        travelers={Number(travelers)}
        duration={Number(duration)}
      />

      {/* ========================================================
          SMART SUGGESTIONS
      ======================================================== */}
      <SmartSuggestions
        suggestionsData={smartSuggestions}
        destination={destination}
        travelStyle={activeTier}
      />

      {/* ========================================================
          LIVE DESTINATION WEATHER INTEGRATION
      ======================================================== */}
      {destinationMeta?.lat && destinationMeta?.lon && (
        <WeatherCard
          destinationName={destination}
          latitude={destinationMeta.lat}
          longitude={destinationMeta.lon}
        />
      )}
    </div>
  );
};

export default TripResult;
