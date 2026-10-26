import { body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';

/**
 * Middleware to check validation results and return formatted 400 response
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array().map((e) => e.msg);
    return res.status(400).json({
      success: false,
      message: errorList[0],
      errors: errorList,
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
  handleValidationErrors,
];

/**
 * Validation rules for user login
 */
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
  handleValidationErrors,
];

/**
 * Validation rules for MongoDB ObjectId in request params
 */
export const validateObjectId = (paramName = 'id') => [
  param(paramName).custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error(`Invalid ${paramName} format. Must be a valid 24-character hexadecimal ID.`);
    }
    return true;
  }),
  handleValidationErrors,
];

/**
 * Validation rules for creating a trip
 */
export const validateTripCreate = [
  body('origin')
    .trim()
    .notEmpty()
    .withMessage('Origin is required.')
    .isLength({ max: 200 })
    .withMessage('Origin cannot exceed 200 characters.'),
  body('destination')
    .trim()
    .notEmpty()
    .withMessage('Destination is required.')
    .isLength({ max: 100 })
    .withMessage('Destination cannot exceed 100 characters.'),
  body('travelers')
    .notEmpty()
    .withMessage('Number of travelers is required.')
    .isInt({ min: 1 })
    .withMessage('Travelers must be an integer greater than or equal to 1.'),
  body('duration')
    .notEmpty()
    .withMessage('Duration is required.')
    .isInt({ min: 1 })
    .withMessage('Duration must be an integer of at least 1 day.'),
  body('budget')
    .notEmpty()
    .withMessage('Budget is required.')
    .isFloat({ min: 0 })
    .withMessage('Budget must be a non-negative number.'),
  body('travel_style')
    .optional()
    .isIn(['budget', 'moderate', 'premium'])
    .withMessage('Travel style must be budget, moderate, or premium.'),
  body('travelStyle')
    .optional()
    .isIn(['budget', 'moderate', 'premium'])
    .withMessage('Travel style must be budget, moderate, or premium.'),
  handleValidationErrors,
];

/**
 * Validation rules for updating a trip
 */
export const validateTripUpdate = [
  body('travelers')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Travelers must be at least 1.'),
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 day.'),
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a non-negative number.'),
  body('travel_style')
    .optional()
    .isIn(['budget', 'moderate', 'premium'])
    .withMessage('Travel style must be budget, moderate, or premium.'),
  body('travelStyle')
    .optional()
    .isIn(['budget', 'moderate', 'premium'])
    .withMessage('Travel style must be budget, moderate, or premium.'),
  handleValidationErrors,
];
