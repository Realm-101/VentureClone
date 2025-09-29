import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { healthzHandler, type HealthResponse } from './healthz';
import type { Request, Response } from 'express';

// Mock the minimal-storage module
vi.mock('../minimal-storage', () => ({
  minimalStorage: {
    constructor: { name: 'MemStorage' }
  }
}));

describe('Health Check Endpoint', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockReq = {};
    jsonSpy = vi.fn();
    mockRes = {
      json: jsonSpy
    };
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.NODE_ENV;
    delete process.env.OPENAI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.COMMIT_SHA;
    delete process.env.VERCEL_GIT_COMMIT_SHA;
    delete process.env.RAILWAY_GIT_COMMIT_SHA;
    delete process.env.npm_package_version;
  });

  it('should return basic health response with development environment', () => {
    process.env.NODE_ENV = 'development';
    // Clear version to test basic response
    delete process.env.npm_package_version;
    
    healthzHandler(mockReq as Request, mockRes as Response);

    const response = jsonSpy.mock.calls[0][0] as HealthResponse;
    expect(response.ok).toBe(true);
    expect(response.env).toBe('development');
    expect(response.storage).toBe('mem');
    expect(response.providers).toEqual({
      openai: false,
      gemini: false
    });
  });

  it('should return production environment when NODE_ENV is set', () => {
    process.env.NODE_ENV = 'production';
    
    healthzHandler(mockReq as Request, mockRes as Response);

    const response = jsonSpy.mock.calls[0][0] as HealthResponse;
    expect(response.env).toBe('production');
  });

  it('should default to development environment when NODE_ENV is not set', () => {
    healthzHandler(mockReq as Request, mockRes as Response);

    const response = jsonSpy.mock.calls[0][0] as HealthResponse;
    expect(response.env).toBe('development');
  });

  it('should detect AI provider availability', () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    
    healthzHandler(mockReq as Request, mockRes as Response);

    const response = jsonSpy.mock.calls[0][0] as HealthResponse;
    expect(response.providers).toEqual({
      openai: true,
      gemini: true
    });
  });

  it('should detect partial AI provider availability', () => {
    process.env.OPENAI_API_KEY = 'test-openai-key';
    // GEMINI_API_KEY not set
    
    healthzHandler(mockReq as Request, mockRes as Response);

    const response = jsonSpy.mock.calls[0][0] as HealthResponse;
    expect(response.providers).toEqual({
      openai: true,
      gemini: false
    });
  });

  it('should include commit information when available', () => {
    process.env.COMMIT_SHA = 'abc123def456';
    
    healthzHandler(mockReq as Request, mockRes as Response);

    const response = jsonSpy.mock.calls[0][0] as HealthResponse;
    expect(response.commit).toBe('abc123def456');
  });

  it('should include version information when available', () => {
    process.env.npm_package_version = '1.0.0';
    
    healthzHandler(mockReq as Request, mockRes as Response);

    const response = jsonSpy.mock.calls[0][0] as HealthResponse;
    expect(response.version).toBe('1.0.0');
  });

  it('should prioritize COMMIT_SHA over other commit environment variables', () => {
    process.env.COMMIT_SHA = 'primary-commit';
    process.env.VERCEL_GIT_COMMIT_SHA = 'vercel-commit';
    process.env.RAILWAY_GIT_COMMIT_SHA = 'railway-commit';
    
    healthzHandler(mockReq as Request, mockRes as Response);

    const response = jsonSpy.mock.calls[0][0] as HealthResponse;
    expect(response.commit).toBe('primary-commit');
  });

  it('should fallback to VERCEL_GIT_COMMIT_SHA when COMMIT_SHA is not available', () => {
    process.env.VERCEL_GIT_COMMIT_SHA = 'vercel-commit';
    process.env.RAILWAY_GIT_COMMIT_SHA = 'railway-commit';
    
    healthzHandler(mockReq as Request, mockRes as Response);

    const response = jsonSpy.mock.calls[0][0] as HealthResponse;
    expect(response.commit).toBe('vercel-commit');
  });

  it('should fallback to RAILWAY_GIT_COMMIT_SHA when others are not available', () => {
    // Ensure other commit env vars are not set
    delete process.env.COMMIT_SHA;
    delete process.env.VERCEL_GIT_COMMIT_SHA;
    process.env.RAILWAY_GIT_COMMIT_SHA = 'railway-commit';
    
    healthzHandler(mockReq as Request, mockRes as Response);

    const response = jsonSpy.mock.calls[0][0] as HealthResponse;
    expect(response.commit).toBe('railway-commit');
  });

  it('should not include commit or version fields when not available', () => {
    // Ensure all optional env vars are not set
    delete process.env.COMMIT_SHA;
    delete process.env.VERCEL_GIT_COMMIT_SHA;
    delete process.env.RAILWAY_GIT_COMMIT_SHA;
    delete process.env.npm_package_version;
    
    healthzHandler(mockReq as Request, mockRes as Response);

    const response = jsonSpy.mock.calls[0][0] as HealthResponse;
    expect(response).not.toHaveProperty('commit');
    expect(response).not.toHaveProperty('version');
  });

  it('should detect memory storage mode', () => {
    healthzHandler(mockReq as Request, mockRes as Response);

    const response = jsonSpy.mock.calls[0][0] as HealthResponse;
    expect(response.storage).toBe('mem');
  });

  it('should include all fields when fully configured', () => {
    process.env.NODE_ENV = 'production';
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    process.env.COMMIT_SHA = 'abc123def456';
    process.env.npm_package_version = '1.2.3';
    
    healthzHandler(mockReq as Request, mockRes as Response);

    const response = jsonSpy.mock.calls[0][0] as HealthResponse;
    expect(response).toEqual({
      ok: true,
      env: 'production',
      storage: 'mem',
      providers: {
        openai: true,
        gemini: true
      },
      commit: 'abc123def456',
      version: '1.2.3'
    });
  });
});