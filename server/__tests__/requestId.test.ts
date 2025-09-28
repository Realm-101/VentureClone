import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { requestIdMiddleware } from '../middleware/requestId';

describe('Request ID Middleware', () => {
  it('should generate a new request ID when none is provided', () => {
    const req = {
      headers: {}
    } as Request;
    
    const res = {
      setHeader: vi.fn()
    } as unknown as Response;
    
    const next = vi.fn() as NextFunction;

    requestIdMiddleware(req, res, next);

    expect(req.requestId).toBeDefined();
    expect(typeof req.requestId).toBe('string');
    expect(req.requestId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', req.requestId);
    expect(next).toHaveBeenCalled();
  });

  it('should use existing request ID from header', () => {
    const existingId = 'existing-request-id';
    const req = {
      headers: {
        'x-request-id': existingId
      }
    } as Request;
    
    const res = {
      setHeader: vi.fn()
    } as unknown as Response;
    
    const next = vi.fn() as NextFunction;

    requestIdMiddleware(req, res, next);

    expect(req.requestId).toBe(existingId);
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', existingId);
    expect(next).toHaveBeenCalled();
  });

  it('should generate new ID when header is empty string', () => {
    const req = {
      headers: {
        'x-request-id': ''
      }
    } as Request;
    
    const res = {
      setHeader: vi.fn()
    } as unknown as Response;
    
    const next = vi.fn() as NextFunction;

    requestIdMiddleware(req, res, next);

    // Should generate new UUID when header is empty
    expect(req.requestId).toBeDefined();
    expect(typeof req.requestId).toBe('string');
    expect(req.requestId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', req.requestId);
    expect(next).toHaveBeenCalled();
  });
});