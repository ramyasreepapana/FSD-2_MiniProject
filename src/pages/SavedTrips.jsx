import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plane, Calendar, Users, Trash2, Eye, CheckCircle2, Plus, 
  Sparkles, Wallet, Sliders, Crown 
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { tripService } from '../services/tripService';
import { formatCurrency, calculateExpenses } from '../utils/calculateExpenses';
import { analyzeBudgetFeasibility } from '../utils/budgetAnalysis';
import { destinationCosts } from '../data/destinationCosts';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

const SavedTrips = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(Boolean(user?.id));
  const [error, setError] = useState(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState(null);

  const userId = user?.id;

  const fetchTrips = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await tripService.getTrips(userId);
      setTrips(data || []);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError(
        err.message?.includes('fetch') || !navigator.onLine
          ? 'Unable to complete this request. Please check your internet connection and try again.'
          : 'Could not load your saved trips. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let ignore = false;
    if (!userId) {
      return;
    }
    tripService.getTrips(userId)
      .then((data) => {
        if (!ignore) {
          setTrips(data || []);
          setError(null);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Error fetching trips:', err);
          setError(
            err.message?.includes('fetch') || !navigator.onLine
              ? 'Unable to complete this request. Please check your internet connection and try again.'
              : 'Could not load your saved trips. Please try again.'
          );
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [userId]);

  const handleDeleteTrip = async (tripId) => {
    if (!user?.id || deletingId) return;

    setDeletingId(tripId);
    setError(null);

    try {
      await tripService.deleteTrip(tripId, user.id);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      setDeleteConfirmationId(null);
      setDeleteSuccessMessage('Trip deleted successfully.');
      setTimeout(() => setDeleteSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting trip:', err);
      setError('Failed to delete trip. Please check your connection and try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewTrip = (trip) => {
    const meta = destinationCosts[trip.destination] || {
      name: trip.destination,
      region: 'Custom destination',
      tagline: 'Planned trip',
      hotelPerNight: Math.round(Number(trip.accommodation_cost || 0) / (Number(trip.duration) || 1)),
      foodPerPersonPerDay: Math.round(Number(trip.food_cost || 0) / ((Number(trip.travelers) || 1) * (Number(trip.duration) || 1))),
      transportPerPersonPerDay: Math.round(Number(trip.transport_cost || 0) / ((Number(trip.travelers) || 1) * (Number(trip.duration) || 1))),
      activitiesPerPersonPerDay: Math.round(Number(trip.activities_cost || 0) / ((Number(trip.travelers) || 1) * (Number(trip.duration) || 1))),
      travelPerPerson: Math.round(Number(trip.travel_cost || 0) / (Number(trip.travelers) || 1)),
    };

    const travelers = Number(trip.travelers) || 1;
    const duration = Number(trip.duration) || 1;
    const travelStyle = trip.travel_style || trip.travelStyle || 'moderate';

    // Preserve exact saved breakdown
    const travelCost = Number(trip.travel_cost ?? trip.travelCost ?? Math.round((meta.travelPerPerson || 2000) * travelers));
    const accommodationCost = Number(trip.accommodation_cost ?? trip.accommodationCost ?? Math.round((meta.hotelPerNight || 1500) * duration));
    const foodCost = Number(trip.food_cost ?? trip.foodCost ?? Math.round((meta.foodPerPersonPerDay || 600) * travelers * duration));
    const transportCost = Number(trip.transport_cost ?? trip.transportCost ?? Math.round((meta.transportPerPersonPerDay || 200) * travelers * duration));
    const activitiesCost = Number(trip.activities_cost ?? trip.activitiesCost ?? Math.round((meta.activitiesPerPersonPerDay || 300) * travelers * duration));
    const totalCost = Number(trip.total_cost ?? trip.totalCost ?? (travelCost + accommodationCost + foodCost + transportCost + activitiesCost));

    const calcPercent = (val) => (totalCost > 0 ? Math.round((val / totalCost) * 100) : 0);

    const travelAndTransport = travelCost + transportCost;
    const stayAndAccommodation = accommodationCost;
    const foodAndActivities = foodCost + activitiesCost;

    const pct1 = calcPercent(travelAndTransport);
    const pct2 = calcPercent(stayAndAccommodation);
    const pct3 = Math.max(0, 100 - (pct1 + pct2));

    const categories = [
      {
        id: 'travel_transport',
        name: 'Travel & Transportation',
        shortName: 'Transit',
        icon: '🚆',
        amount: travelAndTransport,
        percentage: pct1,
        description: `Commute to destination (${formatCurrency(travelCost)}) + local transit (${formatCurrency(transportCost)})`,
        color: '#0F4C5C',
      },
      {
        id: 'stay_accommodation',
        name: 'Stay & Accommodation',
        shortName: 'Stay',
        icon: '🏨',
        amount: stayAndAccommodation,
        percentage: pct2,
        description: `${duration} night${duration > 1 ? 's' : ''} accommodation for ${travelers} traveler${travelers > 1 ? 's' : ''} (${travelStyle} tier)`,
        color: '#2A9D8F',
      },
      {
        id: 'food_activities',
        name: 'Food, Dining & Activities',
        shortName: 'Food & Activities',
        icon: '🍽️',
        amount: foodAndActivities,
        percentage: pct3,
        description: `Daily dining (${formatCurrency(foodCost)}) + sightseeing & attractions (${formatCurrency(activitiesCost)})`,
        color: '#F4A261',
      },
    ];

    const fullTierCalc = calculateExpenses(meta, travelers, duration, travelStyle);

    const expenses = {
      travelCost,
      accommodationCost,
      foodCost,
      transportCost,
      activitiesCost,
      totalCost,
      categories,
    };

    const feasibility = analyzeBudgetFeasibility(trip.budget, totalCost);

    const tripData = {
      origin: trip.origin,
      originLocation: trip.origin_location || trip.originLocation || null,
      destination: trip.destination,
      budget: Number(trip.budget),
      travelers,
      duration,
      travelStyle,
      destinationMeta: meta,
      expenses,
      threeTiers: fullTierCalc.threeTiers,
      feasibility,
      summary: trip.ai_summary || trip.aiSummary || fullTierCalc.summary,
      assumptions: fullTierCalc.assumptions || [],
      smartSuggestions: trip.ai_suggestions || trip.aiSuggestions || null,
      weather: trip.weather || null,
      id: trip.id,
      savedAt: trip.created_at,
    };

    navigate('/result', { state: { tripData } });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
            <Plane className="w-3.5 h-3.5" />
            <span>Saved Itineraries</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            My Trips ✈️
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your previously calculated travel budgets and feasibility evaluations
          </p>
        </div>

        <Link
          to="/plan"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-light active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Plan New Trip</span>
        </Link>
      </div>

      {/* Delete Feedback Toast */}
      {deleteSuccessMessage && (
        <div 
          role="status" 
          className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium rounded-xl flex items-center gap-2 animate-in fade-in duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{deleteSuccessMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <ErrorMessage
          title="Could not load trips"
          message={error}
          onRetry={fetchTrips}
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-20">
          <LoadingState message="Loading your trips..." size="lg" />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && trips.length === 0 && (
        <div className="py-12">
          <EmptyState
            icon="✈️"
            title="No trips saved yet"
            description="Plan your first trip and save it here to track its feasibility over time."
            actionLabel="Plan a Trip"
            onAction={() => navigate('/plan')}
          />
        </div>
      )}

      {/* Saved Trips Grid */}
      {!loading && trips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const isWithin = trip.budget_status === 'within' || trip.total_cost <= trip.budget;
            const isConfirmingDelete = deleteConfirmationId === trip.id;
            const style = trip.travel_style || trip.travelStyle || 'moderate';
            const StyleIcon = style === 'budget' ? Wallet : style === 'premium' ? Crown : Sliders;
            const styleBadgeClass = style === 'budget' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : style === 'premium' 
                ? 'bg-purple-50 text-purple-700 border-purple-200' 
                : 'bg-blue-50 text-blue-700 border-blue-200';
            const aiSnippet = trip.ai_summary || trip.aiSummary;

            return (
              <div
                key={trip.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-soft transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Destination & Route */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-primary transition">
                        {trip.destination}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                        <span className="font-semibold text-slate-700 truncate max-w-[110px]">{trip.origin}</span>
                        <span className="text-secondary font-bold">──✈──&gt;</span>
                        <span className="font-semibold text-slate-700 truncate max-w-[110px]">{trip.destination}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        isWithin
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isWithin ? 'Within Budget ✓' : 'Exceeds Budget ⚠️'}
                    </span>
                  </div>

                  {/* Travel Style & AI Indicators */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styleBadgeClass} capitalize`}>
                      <StyleIcon className="w-3 h-3" />
                      <span>{style} Tier</span>
                    </span>

                    {aiSnippet && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                        <span>AI Calibrated</span>
                      </span>
                    )}
                  </div>

                  {/* AI Summary Snippet (if available) */}
                  {aiSnippet && (
                    <p className="text-[11px] text-slate-600 line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
                      "{aiSnippet}"
                    </p>
                  )}

                  {/* Trip Meta Pills */}
                  <div className="flex items-center gap-3 text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      {trip.travelers} Traveler{trip.travelers > 1 ? 's' : ''}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-accent-dark" />
                      {trip.duration} Day{trip.duration > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Budget & Estimated Comparison */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Your Budget
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {formatCurrency(trip.budget)}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Estimated
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {formatCurrency(trip.total_cost)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions & Delete Confirmation */}
                <div className="pt-4 border-t border-slate-100">
                  {isConfirmingDelete ? (
                    <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-xs space-y-2 animate-in fade-in duration-150">
                      <p className="font-semibold text-red-800">
                        Delete this saved trip?
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteTrip(trip.id)}
                          disabled={deletingId === trip.id}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs transition disabled:opacity-50"
                        >
                          {deletingId === trip.id ? 'Deleting...' : 'Yes, Delete'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmationId(null)}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-xs transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleViewTrip(trip)}
                        className="flex-1 py-2 px-3 bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Breakdown</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmationId(trip.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                        title="Delete Trip"
                        aria-label={`Delete trip to ${trip.destination}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedTrips;
