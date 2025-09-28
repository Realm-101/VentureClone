# Implementation Plan

- [x] 1. Create storage abstraction layer and implementations





  - Create IStorage interface defining the contract for all storage implementations
  - Implement MemStorage class with Map-based in-memory storage for immediate deployment
  - Create DbStorage stub class maintaining same interface for future database integration
  - Add storage factory logic to select implementation based on STORAGE environment variable
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 2. Implement user session management middleware






  - Create user middleware to handle cookie-based user identification
  - Generate persistent user IDs for new visitors with 1-year expiration
  - Parse existing user ID cookies and attach to request object
  - Set httpOnly cookies with appropriate security settings
  - _Requirements: 2.3, 2.5, 2.6_
-

- [x] 3. Create minimal API routes for business analysis








  - Implement GET /api/business-analyses endpoint to list user's analyses in reverse chronological order
  - Create POST /api/business-analyses/analyze endpoint for URL analysis with OpenAI integration
  - Add proper error handling with appropriate HTTP status codes
  - Integrate storage layer with API routes using dependency injection pattern
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 3.1, 3.2, 3.3, 3.4_

- [x] 4. Integrate multi-provider AI API for business analysis


  - Implement Google Gemini as primary AI provider with direct API calls using fetch
  - Add OpenAI as fallback provider when Gemini fails or is unavailable
  - Create business analysis prompt template for concise 100-150 word summaries
  - Add comprehensive error handling for both AI providers with graceful fallback
  - Validate AI provider API keys and return appropriate errors when both are missing
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 5. Update server configuration and middleware setup





  - Modify server/index.ts to integrate user middleware and storage selection
  - Wire up new API routes with existing Express application
  - Update environment variable handling for STORAGE and OPENAI_API_KEY
  - Ensure proper middleware order for user identification and error handling
  - _Requirements: 2.3, 2.5, 2.6, 6.1, 6.2_

- [x] 6. Create minimal client-side API integration





  - Implement API client functions for fetching analyses and submitting URLs
  - Add proper TypeScript types for API requests and responses
  - Handle network errors and API failures with user-friendly error messages
  - Configure API base URL using VITE_API_BASE environment variable
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 3.1, 3.2, 3.3, 3.4_

- [x] 7. Build minimal Dashboard component





  - Create streamlined Dashboard component replacing existing complex UI
  - Implement URL input form with validation and loading states
  - Add analysis list display with chronological ordering and proper metadata
  - Include error display component for API failures and validation errors
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 8. Implement feature flag system for experimental features





  - Add VITE_ENABLE_EXTRAS environment variable checking in client components
  - Wrap experimental UI components with feature flag conditionals
  - Ensure experimental features are excluded from bundle when disabled
  - Update existing components to respect feature flag settings
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 9. Optimize bundle size and remove unused dependencies





  - Remove unused dependencies like embla-carousel-react, framer-motion, cmdk, vaul, recharts
  - Update HTML template to use system fonts instead of web fonts
  - Audit and remove unused Radix UI components and other heavy libraries
  - Verify tree shaking is working properly for remaining dependencies
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 10. Update application routing and main entry point





  - Simplify App.tsx to render Dashboard component directly when feature flags are disabled
  - Remove complex routing and navigation for minimal version
  - Update main.tsx to use streamlined application structure
  - Ensure proper error boundaries and loading states
  - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2_

- [x] 11. Create environment configuration files





  - Create .env.example with all required environment variables and documentation
  - Update package.json scripts for development and production builds
  - Add proper TypeScript configuration for new storage layer
  - Document environment variable usage and storage switching
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 5.1, 5.2, 5.3_

- [x] 12. Write comprehensive tests for storage implementations





  - Create unit tests for IStorage interface compliance in both implementations
  - Test MemStorage CRUD operations and data persistence within session
  - Verify DbStorage stub methods throw appropriate errors
  - Add integration tests for storage factory and environment-based selection
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 13. Write API endpoint tests






  - Create integration tests for GET /api/business-analyses with various user scenarios
  - Test POST /api/business-analyses/analyze with valid and invalid URLs
  - Verify proper error handling for missing API keys and OpenAI failures
  - Test user middleware functionality and cookie handling
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.5, 2.6_

- [x] 14. Write client component tests





  - Create unit tests for Dashboard component with various states
  - Test API client functions with mock responses and error scenarios
  - Verify feature flag conditional rendering works correctly
  - Add accessibility tests for form inputs and analysis list
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3, 3.4, 5.1, 5.2, 5.4_

- [x] 15. Create end-to-end integration tests




  - Write complete user flow test: paste URL → analyze → save → display in list
  - Test error scenarios like network failures and invalid API responses
  - Verify storage switching works correctly between memory and database modes
  - Test feature flag behavior in different environment configurations
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 3.1, 3.2, 3.3, 5.1, 5.2, 6.1, 6.2_