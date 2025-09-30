import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError, ErrorType } from '../middleware/errorHandler';

describe('Enhanced Error Handling', () => {
  describe('AppError class', () => {
    it('should create basic AppError with default values', () => {
      const error = new AppError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL');
      expect(error.retryable).toBe(false);
      expect(error.name).toBe('AppError');
    });

    it('should create AppError with custom values', () => {
      const error = new AppError(
        'Custom error',
        422,
        'VALIDATION_ERROR',
        'User friendly message',
        ErrorType.VALIDATION,
        { field: 'test' },
        true
      );
      
      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.userMessage).toBe('User friendly message');
      expect(error.errorType).toBe(ErrorType.VALIDATION);
      expect(error.details).toEqual({ field: 'test' });
      expect(error.retryable).toBe(true);
    });

    describe('static factory methods', () => {
      it('should create timeout error', () => {
        const error = AppError.timeout('Request timed out', 'Please try again', { url: 'test.com' });
        
        expect(error.statusCode).toBe(504);
        expect(error.code).toBe('GATEWAY_TIMEOUT');
        expect(error.errorType).toBe(ErrorType.TIMEOUT);
        expect(error.userMessage).toBe('Please try again');
        expect(error.retryable).toBe(true);
        expect(error.details).toEqual({ url: 'test.com' });
      });

      it('should create validation error', () => {
        const error = AppError.validation('Invalid input', 'Check your data', { field: 'url' });
        
        expect(error.statusCode).toBe(422);
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.errorType).toBe(ErrorType.VALIDATION);
        expect(error.userMessage).toBe('Check your data');
        expect(error.retryable).toBe(false);
      });

      it('should create AI provider error', () => {
        const error = AppError.aiProvider('AI service down', 'Service unavailable', { provider: 'gemini' });
        
        expect(error.statusCode).toBe(502);
        expect(error.code).toBe('AI_PROVIDER_DOWN');
        expect(error.errorType).toBe(ErrorType.AI_PROVIDER);
        expect(error.retryable).toBe(true);
      });

      it('should create first-party extraction error', () => {
        const error = AppError.firstPartyExtraction('Extraction failed', 'Cannot fetch content');
        
        expect(error.statusCode).toBe(503);
        expect(error.code).toBe('SERVICE_UNAVAILABLE');
        expect(error.errorType).toBe(ErrorType.FIRST_PARTY_EXTRACTION);
        expect(error.retryable).toBe(true);
      });

      it('should create improvement generation error', () => {
        const error = AppError.improvementGeneration('Generation failed', 'Cannot generate improvements');
        
        expect(error.statusCode).toBe(503);
        expect(error.code).toBe('SERVICE_UNAVAILABLE');
        expect(error.errorType).toBe(ErrorType.IMPROVEMENT_GENERATION);
        expect(error.retryable).toBe(true);
      });

      it('should create confidence validation error', () => {
        const error = AppError.confidenceValidation('Invalid confidence', 'Confidence data invalid');
        
        expect(error.statusCode).toBe(422);
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.errorType).toBe(ErrorType.CONFIDENCE_VALIDATION);
        expect(error.retryable).toBe(false);
      });

      it('should create source validation error', () => {
        const error = AppError.sourceValidation('Invalid source', 'Source data invalid');
        
        expect(error.statusCode).toBe(422);
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.errorType).toBe(ErrorType.SOURCE_VALIDATION);
        expect(error.retryable).toBe(false);
      });
    });
  });

  describe('Error categorization', () => {
    it('should categorize timeout errors correctly', () => {
      const timeoutError = new Error('Request timeout after 10000ms');
      const appError = AppError.timeout(timeoutError.message);
      
      expect(appError.errorType).toBe(ErrorType.TIMEOUT);
      expect(appError.retryable).toBe(true);
    });

    it('should categorize validation errors correctly', () => {
      const validationError = new Error('URL is required');
      const appError = AppError.validation(validationError.message);
      
      expect(appError.errorType).toBe(ErrorType.VALIDATION);
      expect(appError.retryable).toBe(false);
    });

    it('should categorize AI provider errors correctly', () => {
      const aiError = new Error('Gemini API key missing');
      const appError = AppError.aiProvider(aiError.message);
      
      expect(appError.errorType).toBe(ErrorType.AI_PROVIDER);
      expect(appError.retryable).toBe(true);
    });
  });

  describe('User-friendly messages', () => {
    it('should provide user-friendly timeout messages', () => {
      const error = AppError.timeout('First-party extraction timeout');
      expect(error.userMessage).toBe('Request timed out. Please try again.');
    });

    it('should provide user-friendly validation messages', () => {
      const error = AppError.validation('Invalid URL format');
      expect(error.userMessage).toBe('Invalid input data. Please check your request and try again.');
    });

    it('should provide user-friendly AI provider messages', () => {
      const error = AppError.aiProvider('API key invalid');
      expect(error.userMessage).toBe('AI service is temporarily unavailable. Please try again.');
    });

    it('should provide user-friendly first-party extraction messages', () => {
      const error = AppError.firstPartyExtraction('Cannot fetch website');
      expect(error.userMessage).toBe('Unable to extract content from the target website. Analysis will continue with available data.');
    });

    it('should provide user-friendly improvement generation messages', () => {
      const error = AppError.improvementGeneration('Generation timeout');
      expect(error.userMessage).toBe('Unable to generate business improvements. Please try again.');
    });
  });
});