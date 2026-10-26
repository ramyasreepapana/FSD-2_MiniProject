import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Trip must belong to a user'],
      index: true,
    },
    origin: {
      type: String,
      required: [true, 'Origin is required'],
      trim: true,
      maxlength: [200, 'Origin name cannot exceed 200 characters'],
    },
    origin_location: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
      maxlength: [100, 'Destination name cannot exceed 100 characters'],
    },
    travelers: {
      type: Number,
      required: [true, 'Number of travelers is required'],
      min: [1, 'At least 1 traveler is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Trip duration is required'],
      min: [1, 'Trip duration must be at least 1 day'],
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget cannot be negative'],
    },
    travel_style: {
      type: String,
      enum: {
        values: ['budget', 'moderate', 'premium'],
        message: 'Travel style must be budget, moderate, or premium',
      },
      default: 'moderate',
    },
    travel_cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    accommodation_cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    food_cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    transport_cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    activities_cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    total_cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    budget_difference: {
      type: Number,
      default: 0,
    },
    budget_status: {
      type: String,
      enum: {
        values: ['within', 'exceeds'],
        message: 'Budget status must be either within or exceeds',
      },
      default: 'within',
    },
    ai_summary: {
      type: String,
      default: null,
    },
    ai_suggestions: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    weather: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        // Provide convenient camelCase aliases alongside snake_case for frontend
        ret.userId = ret.user ? ret.user.toString() : undefined;
        ret.travelStyle = ret.travel_style;
        ret.originLocation = ret.origin_location;
        ret.travelCost = ret.travel_cost;
        ret.accommodationCost = ret.accommodation_cost;
        ret.foodCost = ret.food_cost;
        ret.transportCost = ret.transport_cost;
        ret.activitiesCost = ret.activities_cost;
        ret.totalCost = ret.total_cost;
        ret.budgetDifference = ret.budget_difference;
        ret.budgetStatus = ret.budget_status;
        ret.aiSummary = ret.ai_summary;
        ret.aiSuggestions = ret.ai_suggestions;
        ret.created_at = ret.createdAt;
        ret.updated_at = ret.updatedAt;

        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for user query performance and sorting
tripSchema.index({ user: 1, createdAt: -1 });

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
