# Implementation Plan

- [x] 1. Create core infrastructure components





  - Implement request ID middleware for request tracking
  - Create fetch timeout utility for AI provider calls
  - Fix storage mutation issue in MemStorage.listAnalyses()
  - _Requirements: 1.3, 4.1, 4.2, 4.3, 5.4_

- [x] 2. Implement request ID middleware





  - Create `server/middleware/requestId.ts` with UUID generation
  - Add request ID to Express Request interface extension
  - Set X-Request-ID response header for client debugging
  - Wire middleware into main server setup before existing middleware
  - _Requirements: 5.4_

- [x] 3. Create fetch timeout utility





  - Implement `server/lib/fetchWithTimeout.ts` with AbortController
  - Add configurable timeout parameter with 8-second default
  - Handle timeout cleanup and error conversion
  - Make compatible with existing fetch usage patterns
  - _Requirements: 1.1, 1.2_

- [x] 4. Fix storage data mutation





  - Modify `MemStorage.listAnalyses()` to return sorted copy instead of mutating original
  - Add unit test to verify non-mutating behavior
  - Ensure concurrent read operations don't interfere
  - _Requirements: 4.1, 4.2, 4.3_

- [-] 5. Implement centralized error handling


  - Create `server/middleware/errorHandler.ts` with consistent JSON error format
  - Map HTTP status codes to standardized error codes
  - Include request ID in all error responses
  - Wire error handler as final middleware in server setup
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 6. Create rate limiting middleware
  - Implement `server/middleware/rateLimit.ts` with sliding window algorithm
  - Use in-memory Map for tracking requests per IP+user combination
  - Add configurable window size and request limits
  - Implement automatic cleanup of expired entries
  - Return 429 status with RATE_LIMITED error code when exceeded
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 7. Apply hardening to analyze endpoint
  - Update analyze route to use rate limiting middleware
  - Replace fetch calls with fetchWithTimeout utility
  - Update error responses to include request IDs and standardized codes
  - Handle AI provider timeouts with 502 status and appropriate error codes
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_

- [ ] 8. Create health check endpoint
  - Implement `server/routes/healthz.ts` with status information
  - Detect storage mode (memory vs database) from storage instance
  - Check AI provider configuration by testing for API keys
  - Return JSON response with ok status, storage mode, and provider flags
  - Wire health check route into main API router
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 9. Add CI pipeline configuration
  - Create `.github/workflows/ci.yml` with Node.js setup
  - Configure CI to run on pushes to main and rescue-min branches
  - Configure CI to run on pull requests to main branch
  - Add TypeScript type checking step without file emission
  - Add test execution step with vitest
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 10. Update package.json scripts
  - Add `typecheck` script for TypeScript compilation without emission
  - Add `test` script for running vitest test suite
  - Add `ci:local` script for running both typecheck and tests locally
  - Update existing scripts if needed for consistency
  - _Requirements: 6.3, 6.4_

- [ ] 11. Update environment configuration
  - Add rate limiting environment variables to `.env.example`
  - Document optional RATE_LIMIT_WINDOW_MS and RATE_LIMIT_MAX variables
  - Ensure backward compatibility with existing environment setup
  - _Requirements: 2.3, 2.4_

- [ ] 12. Write comprehensive tests
  - Create unit tests for rate limiting middleware behavior
  - Create unit tests for fetch timeout utility with mock scenarios
  - Create unit tests for error handler middleware response formatting
  - Create integration tests for rate limiting on analyze endpoint
  - Create integration tests for timeout handling with slow AI provider mocks
  - Add tests for health check endpoint response format
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 3.3, 4.1_