# Implementation Plan

- [x] 1. Fix storage correctness and enhance error handling





  - Fix in-place mutation bug in MemStorage.listAnalyses() method
  - Enhance the unified error handler middleware to ensure consistent JSON responses
  - Update error response format to include request ID and error codes
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [-] 2. Enhance request timeout and rate limiting system



  - Update fetchWithTimeout utility to handle AbortController cleanup properly
  - Enhance rate limiting middleware with configurable options and cleanup
  - Add request ID middleware improvements for better traceability
  - Update AI provider calls to use enhanced timeout handling
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3. Expand health check endpoint functionality
  - Enhance health check response to include environment and build information
  - Add AI provider status detection to health endpoint
  - Update health response interface with additional fields
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4. Implement structured analysis output system
  - Create structured analysis schema and types in shared directory
  - Update AnalysisRecord interface to include optional structured field
  - Modify AI provider prompts to request JSON-formatted responses
  - Implement JSON parsing with graceful fallback to plain text
  - Update storage interface to handle structured analysis data
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 5. Update middleware ordering and integration
  - Ensure proper middleware order in server/index.ts
  - Apply rate limiting to specific endpoints that need protection
  - Verify error handler is positioned as final middleware
  - Test middleware integration with existing authentication flow
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6. Write comprehensive tests for new functionality
  - Create unit tests for enhanced error handling middleware
  - Write tests for rate limiting logic and cleanup
  - Add tests for fetchWithTimeout utility edge cases
  - Create tests for structured analysis parsing and fallback
  - Write integration tests for health check endpoint
  - Add tests for storage operations without mutation
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 4.3_