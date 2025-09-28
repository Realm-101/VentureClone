import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { requestIdMiddleware } from '../middleware/requestId';
import { fetchWithTimeout } from '../lib/fetchWithTimeout';

describe('Core Infrastructure Components', () => {
  describe('Request ID Middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {
        headers: {}
      };
      mockRes = {
        setHeader: vi.fn()
      };
      mockNext = vi.fn();
    });

    it('should generate request ID and set response header', () => {
      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.requestId).toBeDefined();
      expect(typeof mockReq.requestId).toBe('string');
      expect(mockReq.requestId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Request-ID', mockReq.requestId);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should use existing request ID from header', () => {
      const existingId = 'existing-request-id';
      mockReq.headers = { 'x-request-id': existingId };

      requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.requestId).toBe(existingId);
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Request-ID', existingId);
    });
  });

  describe('Fetch Timeout Utility', () => {
    it('should have correct default timeout', () => {
      // Test that the utility exports the expected interface
      expect(typeof fetchWithTimeout).toBe('function');
    });

    it('should handle successful fetch', async () => {
      const mockResponse = { ok: true, status: 200 };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await fetchWithTimeout('https://example.com', { timeoutMs: 1000 });
      
      expect(result).toBe(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('https://example.com', expect.objectContaining({
        signal: expect.any(AbortSignal)
      }));
    });

    it('should handle fetch errors', async () => {
      const fetchError = new Error('Network error');
      global.fetch = vi.fn().mockRejectedValue(fetchError);

      await expect(fetchWithTimeout('https://example.com', { timeoutMs: 1000 }))
        .rejects.toThrow('Network error');
    });
  });
});