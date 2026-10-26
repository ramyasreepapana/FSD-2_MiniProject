import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectTestDB, closeTestDB } from './setup.js';

describe('GET /api/health', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  it('should return 200 and healthy status when database is connected', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('budgettrip-backend');
    expect(res.body.database).toBeDefined();
    expect(res.body.database.status).toBe('connected');
    expect(res.body.database.ready).toBe(true);
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.uptime).toBeTypeOf('number');
  });

  it('should not expose database credentials or connection string', async () => {
    const res = await request(app).get('/api/health');
    const jsonString = JSON.stringify(res.body);

    expect(jsonString).not.toContain('mongodb://');
    expect(jsonString).not.toContain('password');
    expect(jsonString).not.toContain('secret');
  });
});
