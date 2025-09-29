import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRateLimit, cleanupRateLimit, getRateLimitStats } from './rateLimit';
import type { Request, Response, NextFunction } from 'express';

describe('Rate Limiting Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let statusSpy: any;
  let jsonSpy: any;

  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
    
    statusSpy = vi.fn().mockReturnThis();
    jsonSpy = vi.fn().mockReturnThis();
    
    mockReq = {
      ip: '127.0.0.1',
      requestId: 'test-request-id',
      user: undefined
    };
    
    mockRes = {
      status: statusSpy,
      json: jsonSpy,
      send: vi.fn().mockReturnThis(),
      statusCode: 200
    };
    
    mockNext = vi.fn();
    
    // Clean up any existing rate limit data
    cleanupRateLimit();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanupRateLimit();
  });

  it('should allow requests under the limit', () => {
    const rateLimit = createRateLimit({ max: 5, windowMs: 60000 });
    
    // Make 3 requests
    for (let i = 0; i < 3; i++) {
      rateLimit(mockReq as Request, mockRes as Response, mockNext);
    }
    
    expect(mockNext).toHaveBeenCalledTimes(3);
    expect(statusSpy).not.toHaveBeenCalled();
  });

  it('should block requests over the limit', () => {
    const rateLimit = createRateLimit({ max: 2, windowMs: 60000 });
    
    // Make requests up to limit
    rateLimit(mockReq as Request, mockRes as Response, mockNext);
    rateLimit(mockReq as Request, mockRes as Response, mockNext);
    
    // This should be blocked
    rateLimit(mockReq as Request, mockRes as Response, mockNext);
    
    expect(mockNext).toHaveBeenCalledTimes(2);
    expect(statusSpy).toHaveBeenCalledWith(429);
    expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('Too many requests'),
      code: 'RATE_LIMITED',
      requestId: 'test-request-id',
      retryAfter: expect.any(Number)
    }));
  });

  it('should reset after window expires', () => {
    const windowMs = 60000;
    const rateLimit = createRateLimit({ max: 2, windowMs });
    
    // Use up the limit
    rateLimit(mockReq as Request, mockRes as Response, mockNext);
    rateLimit(mockReq as Request, mockRes as Response, mockNext);
    
    // Fast-forward past the window
    vi.advanceTimersByTime(windowMs + 1000);
    
    // Should allow requests again
    rateLimit(mockReq as Request, mockRes as Response, mockNext);
    
    expect(mockNext).toHaveBeenCalledTimes(3);
  });

  it('should use custom key generator', () => {
    const customKeyGen = vi.fn().mockReturnValue('custom-key');
    const rateLimit = createRateLimit({ 
      max: 1, 
      windowMs: 60000,
      keyGenerator: customKeyGen
    });
    
    rateLimit(mockReq as Request, mockRes as Response, mockNext);
    
    expect(customKeyGen).toHaveBeenCalledWith(mockReq);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should provide rate limit stats', () => {
    const rateLimit = createRateLimit({ max: 5, windowMs: 60000 });
    
    // Make some requests
    rateLimit(mockReq as Request, mockRes as Response, mockNext);
    rateLimit(mockReq as Request, mockRes as Response, mockNext);
    
    const stats = getRateLimitStats();
    expect(stats.activeKeys).toBeGreaterThan(0);
    expect(stats.totalRequests).toBeGreaterThan(0);
  });

  it('should handle different IPs separately', () => {
    const rateLimit = createRateLimit({ max: 1, windowMs: 60000 });
    
    // First IP
    mockReq.ip = '127.0.0.1';
    rateLimit(mockReq as Request, mockRes as Response, mockNext);
    
    // Second IP
    mockReq.ip = '192.168.1.1';
    rateLimit(mockReq as Request, mockRes as Response, mockNext);
    
    expect(mockNext).toHaveBeenCalledTimes(2);
    expect(statusSpy).not.toHaveBeenCalled();
  });

  it('should use default 20 requests per 5 minutes', () => {
    const rateLimit = createRateLimit(); // Use defaults
    
    // Make 20 requests (should all pass)
    for (let i = 0; i < 20; i++) {
      rateLimit(mockReq as Request, mockRes as Response, mockNext);
    }
    
    // 21st request should be blocked
    rateLimit(mockReq as Request, mockRes as Response, mockNext);
    
    expect(mockNext).toHaveBeenCalledTimes(20);
    expect(statusSpy).toHaveBeenCalledWith(429);
  });
});