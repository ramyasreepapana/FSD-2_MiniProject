import { Router } from 'express';
import {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
} from '../controllers/tripController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  validateTripCreate,
  validateTripUpdate,
  validateObjectId,
} from '../middleware/validation.js';

const router = Router();

// All trip routes are protected by JWT authentication
router.use(protect);

router.route('/')
  .post(validateTripCreate, createTrip)
  .get(getTrips);

router.route('/:id')
  .get(validateObjectId('id'), getTripById)
  .put(validateObjectId('id'), validateTripUpdate, updateTrip)
  .delete(validateObjectId('id'), deleteTrip);

export default router;
