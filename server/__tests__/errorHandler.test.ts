import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler, AppError } from '../middleware/errorHandler';
import { afterEach } from 'node:test';

interface RequestWithId extends Request {
  requestId: string;
}

// Mock Express Response
const mockResponse = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (requestId = 'test-request-id') => ({
  requestId
}) as RequestWithId;

const mockNext = vi.fn() as NextFunction;

describe('Error Handler Middleware', () => {
  let consoleSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('AppError handling', () => {
    it('should handle AppError with custom status and code', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new AppError('Custom error message', 400, 'CUSTOM_ERROR');

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Custom error message',
        code: 'CUSTOM_ERROR',
        requestId: 'test-request-id'
      });
    });

    it('should use default error code when not provided in AppError', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new AppError('Bad request error', 400);

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Bad request error',
        code: 'BAD_REQUEST',
        requestId: 'test-request-id'
      });
    });

    it('should handle AppError with default 500 status', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new AppError('Internal error');

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal error',
        code: 'INTERNAL',
        requestId: 'test-request-id'
      });
    });
  });

  describe('Standard error code mapping', () => {
    const testCases = [
      { status: 400, expectedCode: 'BAD_REQUEST' },
      { status: 401, expectedCode: 'UNAUTHORIZED' },
      { status: 403, expectedCode: 'FORBIDDEN' },
      { status: 404, expectedCode: 'NOT_FOUND' },
      { status: 429, expectedCode: 'RATE_LIMITED' },
      { status: 500, expectedCode: 'INTERNAL' },
      { status: 502, expectedCode: 'AI_PROVIDER_DOWN' },
      { status: 504, expectedCode: 'GATEWAY_TIMEOUT' },
      { status: 999, expectedCode: 'UNKNOWN' }
    ];

    testCases.forEach(({ status, expectedCode }) => {
      it(`should map status ${status} to code ${expectedCode}`, () => {
        const req = mockRequest();
        const res = mockResponse();
        const error = new AppError('Test error', status);

        errorHandler(error, req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(status);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Test error',
          code: expectedCode,
          requestId: 'test-request-id'
        });
      });
    });
  });

  describe('Special error type handling', () => {
    it('should handle ValidationError', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error('Validation failed');
      error.name = 'ValidationError';

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        requestId: 'test-request-id'
      });
    });

    it('should handle timeout errors by message content', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error('Request timeout after 8000ms');

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(504);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Request timeout',
        code: 'GATEWAY_TIMEOUT',
        requestId: 'test-request-id'
      });
    });

    it('should handle TIMEOUT in uppercase', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error('GATEWAY TIMEOUT occurred');

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(504);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Request timeout',
        code: 'GATEWAY_TIMEOUT',
        requestId: 'test-request-id'
      });
    });

    it('should handle rate limit errors by message content', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error('Too many requests - rate limit exceeded');

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Rate limit exceeded',
        code: 'RATE_LIMITED',
        requestId: 'test-request-id'
      });
    });

    it('should handle RATE_LIMITED in uppercase', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error('RATE_LIMITED by provider');

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Rate limit exceeded',
        code: 'RATE_LIMITED',
        requestId: 'test-request-id'
      });
    });
  });

  describe('Generic error handling', () => {
    it('should handle generic errors with 500 status', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error('Some unexpected error');

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        code: 'INTERNAL',
        requestId: 'test-request-id'
      });
      expect(consoleSpy).toHaveBeenCalledWith('Unhandled error:', error);
    });

    it('should not expose internal error details in generic errors', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error('Database connection string: user:pass@host');

      errorHandler(error, req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error', // Generic message, not the actual error
        code: 'INTERNAL',
        requestId: 'test-request-id'
      });
    });
  });

  describe('Request ID handling', () => {
    it('should use request ID from request object', () => {
      const req = mockRequest('custom-request-id');
      const res = mockResponse();
      const error = new Error('Test error');

      errorHandler(error, req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        code: 'INTERNAL',
        requestId: 'custom-request-id'
      });
    });

    it('should use "unknown" when request ID is missing', () => {
      const req = {} as RequestWithId; // No requestId property
      const res = mockResponse();
      const error = new Error('Test error');

      errorHandler(error, req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        code: 'INTERNAL',
        requestId: 'unknown'
      });
    });

    it('should handle empty request ID', () => {
      const req = mockRequest('');
      const res = mockResponse();
      const error = new Error('Test error');

      errorHandler(error, req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        code: 'INTERNAL',
        requestId: 'unknown' // Empty string is falsy, so defaults to 'unknown'
      });
    });
  });

  describe('Response format consistency', () => {
    it('should always return JSON with error, code, and requestId fields', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new AppError('Test message', 418, 'TEAPOT');

      errorHandler(error, req, res, mockNext);

      const responseCall = res.json.mock.calls[0][0];
      expect(responseCall).toHaveProperty('error');
      expect(responseCall).toHaveProperty('code');
      expect(responseCall).toHaveProperty('requestId');
      expect(Object.keys(responseCall)).toEqual(['error', 'code', 'requestId']);
    });

    it('should ensure all fields are strings', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new AppError('Test message', 400);

      errorHandler(error, req, res, mockNext);

      const responseCall = res.json.mock.calls[0][0];
      expect(typeof responseCall.error).toBe('string');
      expect(typeof responseCall.code).toBe('string');
      expect(typeof responseCall.requestId).toBe('string');
    });
  });
});