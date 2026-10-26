import api from './api.js';

/**
 * Normalize trip record to support both camelCase and snake_case properties
 * so that any frontend component can read either convention seamlessly.
 */
export const normalizeTripRecord = (record) => {
  if (!record) return null;
  const travelStyle = record.travel_style || record.travelStyle || 'moderate';
  const originLocation = record.origin_location || record.originLocation || null;
  const aiSummary = record.ai_summary || record.aiSummary || null;
  const aiSuggestions = record.ai_suggestions || record.aiSuggestions || null;

  return {
    ...record,
    id: record.id || record._id,
    travel_style: travelStyle,
    travelStyle: travelStyle,
    origin_location: originLocation,
    originLocation: originLocation,
    travel_cost: Number(record.travel_cost ?? record.travelCost ?? 0),
    travelCost: Number(record.travel_cost ?? record.travelCost ?? 0),
    accommodation_cost: Number(record.accommodation_cost ?? record.accommodationCost ?? 0),
    accommodationCost: Number(record.accommodation_cost ?? record.accommodationCost ?? 0),
    food_cost: Number(record.food_cost ?? record.foodCost ?? 0),
    foodCost: Number(record.food_cost ?? record.foodCost ?? 0),
    transport_cost: Number(record.transport_cost ?? record.transportCost ?? 0),
    transportCost: Number(record.transport_cost ?? record.transportCost ?? 0),
    activities_cost: Number(record.activities_cost ?? record.activitiesCost ?? 0),
    activitiesCost: Number(record.activities_cost ?? record.activitiesCost ?? 0),
    total_cost: Number(record.total_cost ?? record.totalCost ?? 0),
    totalCost: Number(record.total_cost ?? record.totalCost ?? 0),
    budget_difference: Number(record.budget_difference ?? record.budgetDifference ?? 0),
    budgetDifference: Number(record.budget_difference ?? record.budgetDifference ?? 0),
    budget_status: record.budget_status || record.budgetStatus || 'within',
    budgetStatus: record.budget_status || record.budgetStatus || 'within',
    ai_summary: aiSummary,
    aiSummary: aiSummary,
    ai_suggestions: aiSuggestions,
    aiSuggestions: aiSuggestions,
    weather: record.weather || null,
    created_at: record.created_at || record.createdAt || new Date().toISOString(),
  };
};

export const tripService = {
  /**
   * Fetch all trips belonging to current authenticated user
   */
  async getTrips() {
    const data = await api.get('/trips');
    const trips = data.trips || data || [];
    return trips.map(normalizeTripRecord);
  },

  /**
   * Fetch a single trip by ID
   */
  async getTripById(id) {
    if (!id) throw new Error('Trip ID is required.');
    const data = await api.get(`/trips/${id}`);
    return normalizeTripRecord(data.trip || data);
  },

  /**
   * Save a newly calculated trip
   */
  async saveTrip(tripData) {
    const data = await api.post('/trips', tripData);
    return normalizeTripRecord(data.trip || data);
  },

  /**
   * Update an existing trip
   */
  async updateTrip(id, tripData) {
    if (!id) throw new Error('Trip ID is required.');
    const data = await api.put(`/trips/${id}`, tripData);
    return normalizeTripRecord(data.trip || data);
  },

  /**
   * Delete a saved trip
   */
  async deleteTrip(tripId) {
    if (!tripId) throw new Error('Trip ID is required.');
    await api.delete(`/trips/${tripId}`);
    return true;
  },
};

export default tripService;
