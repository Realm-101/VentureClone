import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestIdMiddleware } from './requestId';
import type { Request, Response, NextFunction } from 'express';

describe('Request ID Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let setHeaderSpy: any;
  let onSpy: any;

  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
    
    setHeaderSpy = vi.fn();
    onSpy = vi.fn();
    
    mockReq = {
      headers: {}
    };
    
    mockRes = {
      setHeader: setHeaderSpy,
      on: onSpy
    };
    
    mockNext = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should generate a new request ID when none provided', () => {
    requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);
    
    expect(mockReq.requestId).toBeDefined();
    expect(mockReq.requestId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(mockReq.startTime).toBeDefined();
    expect(setHeaderSpy).toHaveBeenCalledWith('X-Request-ID', mockReq.requestId);
    expect(setHeaderSpy).toHaveBeenCalledWith('X-Request-Start', expect.any(String));
    expect(mockNext).toHaveBeenCalled();
  });

  it('should use existing valid request ID from x-request-id header', () => {
    const existingId = '12345678-1234-4567-8901-123456789012';
    mockReq.headers = { 'x-request-id': existingId };
    
    requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);
    
    expect(mockReq.requestId).toBe(existingId);
    expect(setHeaderSpy).toHaveBeenCalledWith('X-Request-ID', existingId);
  });

  it('should use existing valid request ID from request-id header', () => {
    const existingId = '12345678-1234-4567-8901-123456789012';
    mockReq.headers = { 'request-id': existingId };
    
    requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);
    
    expect(mockReq.requestId).toBe(existingId);
    expect(setHeaderSpy).toHaveBeenCalledWith('X-Request-ID', existingId);
  });

  it('should generate new ID for invalid format', () => {
    mockReq.headers = { 'x-request-id': 'invalid-format' };
    
    requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);
    
    expect(mockReq.requestId).not.toBe('invalid-format');
    expect(mockReq.requestId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('should set up response timing handler', () => {
    requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);
    
    expect(onSpy).toHaveBeenCalledWith('finish', expect.any(Function));
  });

  it('should calculate response time on finish', () => {
    const startTime = Date.now();
    vi.setSystemTime(startTime);
    
    requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);
    
    // Simulate time passing
    vi.advanceTimersByTime(500);
    
    // Get the finish handler and call it
    const finishHandler = onSpy.mock.calls.find(call => call[0] === 'finish')[1];
    finishHandler();
    
    expect(setHeaderSpy).toHaveBeenCalledWith('X-Response-Time', '500ms');
  });

  it('should prefer x-request-id over request-id header', () => {
    const xRequestId = '12345678-1234-4567-8901-123456789012';
    const requestId = '87654321-4321-4567-8901-210987654321';
    
    mockReq.headers = { 
      'x-request-id': xRequestId,
      'request-id': requestId
    };
    
    requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);
    
    expect(mockReq.requestId).toBe(xRequestId);
  });

  it('should set start time as current timestamp', () => {
    const fixedTime = 1234567890000;
    vi.setSystemTime(fixedTime);
    
    requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);
    
    expect(mockReq.startTime).toBe(fixedTime);
    expect(setHeaderSpy).toHaveBeenCalledWith('X-Request-Start', fixedTime.toString());
  });
});