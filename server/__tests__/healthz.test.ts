import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { healthzHandler } from '../routes/healthz';

describe('Health Check Endpoint', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.get('/api/healthz', healthzHandler);
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.OPENAI_API_KEY;
    delete process.env.GEMINI_API_KEY;
  });

  it('should return health status with memory storage and no providers', async () => {
    const response = await request(app)
      .get('/api/healthz')
      .expect(200);

    expect(response.body).toEqual({
      ok: true,
      storage: 'mem',
      providers: {
        openai: false,
        gemini: false,
      },
    });
  });

  it('should detect OpenAI API key when present', async () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';

    const response = await request(app)
      .get('/api/healthz')
      .expect(200);

    expect(response.body).toEqual({
      ok: true,
      storage: 'mem',
      providers: {
        openai: true,
        gemini: false,
      },
    });
  });

  it('should detect Gemini API key when present', async () => {
    process.env.GEMINI_API_KEY = 'test-gemini-key';

    const response = await request(app)
      .get('/api/healthz')
      .expect(200);

    expect(response.body).toEqual({
      ok: true,
      storage: 'mem',
      providers: {
        openai: false,
        gemini: true,
      },
    });
  });

  it('should detect both API keys when present', async () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.GEMINI_API_KEY = 'test-gemini-key';

    const response = await request(app)
      .get('/api/healthz')
      .expect(200);

    expect(response.body).toEqual({
      ok: true,
      storage: 'mem',
      providers: {
        openai: true,
        gemini: true,
      },
    });
  });

  it('should return JSON content type', async () => {
    const response = await request(app)
      .get('/api/healthz')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body.ok).toBe(true);
  });
});