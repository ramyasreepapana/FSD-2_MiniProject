import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectTestDB, clearTestDB, closeTestDB } from './setup.js';

describe('Trip CRUD API (/api/trips)', () => {
  let userAToken;
  let userBToken;
  let userAId;
  let userBId;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_jwt_secret_key_at_least_32_characters_long';
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    // Register User A
    const resA = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Alpha',
        email: 'alpha@example.com',
        password: 'Password123!',
      });
    userAToken = resA.body.token;
    userAId = resA.body.user.id;

    // Register User B
    const resB = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Beta',
        email: 'beta@example.com',
        password: 'Password123!',
      });
    userBToken = resB.body.token;
    userBId = resB.body.user.id;
  });

  const sampleTripData = {
    origin: 'Vijayawada, Andhra Pradesh, India',
    originLocation: { name: 'Vijayawada', latitude: 16.5062, longitude: 80.648 },
    destination: 'Goa',
    travelers: 2,
    duration: 3,
    budget: 20000,
    travelStyle: 'moderate',
    travelCost: 5000,
    accommodationCost: 5400,
    foodCost: 4200,
    transportCost: 1500,
    activitiesCost: 2100,
    totalCost: 18200,
    budgetDifference: 1800,
    budgetStatus: 'within',
    aiSummary: 'A balanced coastal itinerary.',
    aiSuggestions: [{ title: 'Book early', impact: 'High' }],
    weather: { temperature: 29, condition: 'Sunny' },
  };

  describe('POST /api/trips', () => {
    it('should create a trip associated with the authenticated user and return 201', async () => {
      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(sampleTripData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.trip).toBeDefined();
      expect(res.body.trip.id).toBeDefined();
      expect(res.body.trip.destination).toBe('Goa');
      expect(res.body.trip.travelers).toBe(2);
      expect(res.body.trip.duration).toBe(3);
      expect(res.body.trip.budget).toBe(20000);
      expect(res.body.trip.totalCost).toBe(18200);
      expect(res.body.trip.budgetStatus).toBe('within');
      expect(res.body.trip.userId).toBe(userAId);
    });

    it('should reject trip creation if unauthenticated (401)', async () => {
      const res = await request(app)
        .post('/api/trips')
        .send(sampleTripData);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject trip creation with invalid request body (400)', async () => {
      const invalidData = {
        origin: '',
        destination: '',
        travelers: 0,
        duration: -1,
        budget: -500,
      };

      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/trips', () => {
    beforeEach(async () => {
      // Create 2 trips for User A
      await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ ...sampleTripData, destination: 'Goa' });

      await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ ...sampleTripData, destination: 'Manali' });

      // Create 1 trip for User B
      await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ ...sampleTripData, destination: 'Jaipur' });
    });

    it('should list only trips belonging to the authenticated user', async () => {
      const res = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.trips.length).toBe(2);

      const destinations = res.body.trips.map((t) => t.destination);
      expect(destinations).toContain('Goa');
      expect(destinations).toContain('Manali');
      expect(destinations).not.toContain('Jaipur');
    });

    it('should support destination query filter', async () => {
      const res = await request(app)
        .get('/api/trips?destination=goa')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.trips[0].destination).toBe('Goa');
    });
  });

  describe('GET /api/trips/:id', () => {
    let tripAId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(sampleTripData);
      tripAId = res.body.trip.id;
    });

    it('should fetch a single trip owned by the authenticated user', async () => {
      const res = await request(app)
        .get(`/api/trips/${tripAId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.trip.id).toBe(tripAId);
      expect(res.body.trip.destination).toBe('Goa');
    });

    it('should reject malformed trip ID with 400', async () => {
      const res = await request(app)
        .get('/api/trips/invalid-not-an-objectid')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Must be a valid 24-character hexadecimal ID');
    });

    it('should prevent User B from accessing User A trip (returns 404)', async () => {
      const res = await request(app)
        .get(`/api/trips/${tripAId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/trips/:id', () => {
    let tripAId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(sampleTripData);
      tripAId = res.body.trip.id;
    });

    it('should update a trip owned by the authenticated user', async () => {
      const res = await request(app)
        .put(`/api/trips/${tripAId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          budget: 25000,
          travelStyle: 'premium',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.trip.budget).toBe(25000);
      expect(res.body.trip.travelStyle).toBe('premium');
    });

    it('should prevent User B from updating User A trip (returns 404)', async () => {
      const res = await request(app)
        .put(`/api/trips/${tripAId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ budget: 99999 });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/trips/:id', () => {
    let tripAId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(sampleTripData);
      tripAId = res.body.trip.id;
    });

    it('should prevent User B from deleting User A trip (returns 404)', async () => {
      const res = await request(app)
        .delete(`/api/trips/${tripAId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      // Verify trip still exists for User A
      const checkRes = await request(app)
        .get(`/api/trips/${tripAId}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(checkRes.status).toBe(200);
    });

    it('should delete trip owned by authenticated user successfully (200)', async () => {
      const res = await request(app)
        .delete(`/api/trips/${tripAId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted successfully');

      // Verify trip no longer exists
      const checkRes = await request(app)
        .get(`/api/trips/${tripAId}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(checkRes.status).toBe(404);
    });
  });
});
