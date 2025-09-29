import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { createRateLimit, cleanupRateLimit } from '../middleware/rateLimit';

// Mock Express Request and Response
const mockRequest = (overrides = {}) => ({
  ip: '127.0.0.1',
  connection: { remoteAddress: '127.0.0.1' },
  user: { id: 'test-user' },
  requestId: 'test-request-id',
  ...overrides,
}) as Request;

const mockResponse = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext = vi.fn() as NextFunction;

describe('Rate Limiting Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanupRateLimit(); // Clean up between tests
  });

  it('should allow requests under the limit', () => {
    const rateLimit = createRateLimit({ windowMs: 60000, max: 5 });
    const req = mockRequest();
    const res = mockResponse();

    rateLimit(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should block requests over the limit', () => {
    const rateLimit = createRateLimit({ windowMs: 60000, max: 2 });
    const req = mockRequest();
    const res = mockResponse();

    // Make 2 allowed requests
    rateLimit(req, res, mockNext);
    rateLimit(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(2);

    // Third request should be blocked
    rateLimit(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Too many requests. Maximum 2 requests allowed per 1 minutes.',
      code: 'RATE_LIMITED',
      requestId: 'test-request-id'
    });
    expect(mockNext).toHaveBeenCalledTimes(2); // Should not call next for blocked request
  });

  it('should track requests per IP+user combination', () => {
    const rateLimit = createRateLimit({ windowMs: 60000, max: 2 });
    const req1 = mockRequest({ ip: '127.0.0.1', user: { id: 'user1' } });
    const req2 = mockRequest({ ip: '127.0.0.1', user: { id: 'user2' } });
    const res = mockResponse();

    // Each user should have their own limit
    rateLimit(req1, res, mockNext);
    rateLimit(req1, res, mockNext);
    rateLimit(req2, res, mockNext);
    rateLimit(req2, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(4);
    expect(res.status).not.toHaveBeenCalled();

    // Third request from user1 should be blocked
    rateLimit(req1, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(429);
  });

  it('should handle anonymous users', () => {
    const rateLimit = createRateLimit({ windowMs: 60000, max: 2 });
    const req = mockRequest({ user: undefined });
    const res = mockResponse();

    rateLimit(req, res, mockNext);
    rateLimit(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(2);

    // Third request should be blocked
    rateLimit(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(429);
  });

  it('should use default values when no options provided', () => {
    const rateLimit = createRateLimit();
    const req = mockRequest();
    const res = mockResponse();

    // Should allow up to 10 requests (default max)
    for (let i = 0; i < 10; i++) {
      rateLimit(req, res, mockNext);
    }

    expect(mockNext).toHaveBeenCalledTimes(10);

    // 11th request should be blocked
    rateLimit(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Too many requests. Maximum 10 requests allowed per 5 minutes.',
      code: 'RATE_LIMITED',
      requestId: 'test-request-id'
    });
  });
});