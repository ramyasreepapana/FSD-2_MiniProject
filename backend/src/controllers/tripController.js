import Trip from '../models/Trip.js';

/**
 * Extract and normalize trip attributes from request body
 */
const extractTripPayload = (body) => {
  const travelStyle = body.travel_style || body.travelStyle || 'moderate';
  const originLocation = body.origin_location !== undefined ? body.origin_location : body.originLocation;
  const travelCost = body.travel_cost !== undefined ? body.travel_cost : body.travelCost;
  const accommodationCost = body.accommodation_cost !== undefined ? body.accommodation_cost : body.accommodationCost;
  const foodCost = body.food_cost !== undefined ? body.food_cost : body.foodCost;
  const transportCost = body.transport_cost !== undefined ? body.transport_cost : body.transportCost;
  const activitiesCost = body.activities_cost !== undefined ? body.activities_cost : body.activitiesCost;
  const totalCost = body.total_cost !== undefined ? body.total_cost : body.totalCost;
  const budgetDifference = body.budget_difference !== undefined ? body.budget_difference : body.budgetDifference;
  const budgetStatus = body.budget_status || body.budgetStatus;
  const aiSummary = body.ai_summary !== undefined ? body.ai_summary : body.aiSummary;
  const aiSuggestions = body.ai_suggestions !== undefined ? body.ai_suggestions : body.aiSuggestions;

  const payload = {};
  if (body.origin !== undefined) payload.origin = body.origin;
  if (originLocation !== undefined) payload.origin_location = originLocation;
  if (body.destination !== undefined) payload.destination = body.destination;
  if (body.travelers !== undefined) payload.travelers = Number(body.travelers);
  if (body.duration !== undefined) payload.duration = Number(body.duration);
  if (body.budget !== undefined) payload.budget = Number(body.budget);
  if (travelStyle !== undefined) payload.travel_style = travelStyle;
  if (travelCost !== undefined) payload.travel_cost = Number(travelCost);
  if (accommodationCost !== undefined) payload.accommodation_cost = Number(accommodationCost);
  if (foodCost !== undefined) payload.food_cost = Number(foodCost);
  if (transportCost !== undefined) payload.transport_cost = Number(transportCost);
  if (activitiesCost !== undefined) payload.activities_cost = Number(activitiesCost);
  if (totalCost !== undefined) payload.total_cost = Number(totalCost);
  if (budgetDifference !== undefined) payload.budget_difference = Number(budgetDifference);
  if (budgetStatus !== undefined) payload.budget_status = budgetStatus;
  if (aiSummary !== undefined) payload.ai_summary = aiSummary;
  if (aiSuggestions !== undefined) payload.ai_suggestions = aiSuggestions;
  if (body.weather !== undefined) payload.weather = body.weather;

  return payload;
};

/**
 * @desc    Create a new trip for authenticated user
 * @route   POST /api/trips
 * @access  Private
 */
export const createTrip = async (req, res, next) => {
  try {
    const payload = extractTripPayload(req.body);
    // Explicitly associate with authenticated user ID
    payload.user = req.user._id;

    const trip = await Trip.create(payload);

    res.status(201).json({
      success: true,
      message: 'Trip saved successfully.',
      trip: trip.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all trips belonging to authenticated user
 * @route   GET /api/trips
 * @access  Private
 */
export const getTrips = async (req, res, next) => {
  try {
    const query = { user: req.user._id };

    // Support optional filters
    if (req.query.destination) {
      query.destination = new RegExp(req.query.destination.trim(), 'i');
    }
    if (req.query.travelStyle || req.query.travel_style) {
      query.travel_style = req.query.travelStyle || req.query.travel_style;
    }

    // Pagination support
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const total = await Trip.countDocuments(query);
    const trips = await Trip.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: trips.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      trips: trips.map((t) => t.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single trip by ID owned by authenticated user
 * @route   GET /api/trips/:id
 * @access  Private
 */
export const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found or you do not have permission to access it.',
      });
    }

    res.status(200).json({
      success: true,
      trip: trip.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a trip owned by authenticated user
 * @route   PUT /api/trips/:id
 * @access  Private
 */
export const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found or you do not have permission to update it.',
      });
    }

    // Protect ownership from being changed
    const payload = extractTripPayload(req.body);
    delete payload.user;
    delete payload.userId;
    delete payload._id;
    delete payload.id;

    Object.assign(trip, payload);
    const updatedTrip = await trip.save();

    res.status(200).json({
      success: true,
      message: 'Trip updated successfully.',
      trip: updatedTrip.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a trip owned by authenticated user
 * @route   DELETE /api/trips/:id
 * @access  Private
 */
export const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found or you do not have permission to delete it.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
