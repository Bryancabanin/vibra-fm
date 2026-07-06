import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

describe('GET /api/auth/me', () => {
  it('responds with 401 when not logged in', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
  });
});
