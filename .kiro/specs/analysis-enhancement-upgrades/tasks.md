# Implementation Plan

- [x] 1. Enhance schema with confidence scoring and source attribution





  - Update shared/schema.ts to add zSource schema and enhance structuredAnalysisSchema with confidence and sources fields
  - Add TypeScript interfaces for enhanced analysis data structures
  - Ensure backward compatibility with existing analysis records
  - _Requirements: 1.1, 1.6, 4.1_

- [x] 2. Implement first-party data extraction service





  - Create server/lib/fetchFirstParty.ts with HTML parsing using cheerio
  - Implement timeout handling (10 seconds) and error recovery
  - Extract title, description, H1 tags, and body text snippets from target URLs
  - Add comprehensive error handling for network failures and parsing errors
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Create enhanced AI prompts for evidence-based analysis





  - Update AI provider prompts in server/services/ai-providers.ts to eliminate hedging language
  - Implement system prompts that require evidence for claims and confidence scoring
  - Add first-party context integration to AI analysis prompts
  - Ensure prompts enforce "unknown" responses when evidence is lacking
  - _Requirements: 1.2, 1.4, 1.5, 2.5_

- [x] 4. Integrate first-party data extraction into analysis flow





  - Modify server/routes.ts analyze endpoint to call fetchFirstParty before AI analysis
  - Update analyzeUrlWithAI function to include first-party context in AI prompts
  - Implement graceful fallback when first-party extraction fails
  - Store first-party data alongside analysis results
  - _Requirements: 2.1, 2.4, 2.6, 4.3_

- [-] 5. Implement confidence scoring and source validation



  - Add confidence score validation (0-1 range) in AI response processing
  - Implement source URL and excerpt validation in schema parsing
  - Create logic to automatically add target site as first-party source
  - Add error handling for malformed confidence scores and invalid sources
  - _Requirements: 1.1, 1.3, 1.6, 4.2_

- [ ] 6. Create business improvement generation service
  - Implement server/services/business-improvement.ts with improvement generation logic
  - Create AI prompts for generating 3 business improvement angles
  - Implement 7-day plan generation with daily task limits (max 3 per day)
  - Add comprehensive error handling and timeout management (30 seconds)
  - _Requirements: 3.2, 3.3, 3.4, 5.3_

- [ ] 7. Add business improvement API endpoint
  - Create POST /api/business-analyses/:id/improve endpoint in server/routes.ts
  - Implement analysis lookup and validation logic
  - Integrate business improvement service with proper error handling
  - Add request validation and response formatting
  - _Requirements: 3.1, 3.2, 5.4_

- [ ] 8. Update storage layer for enhanced analysis data
  - Modify server/minimal-storage.ts interfaces to support enhanced analysis records
  - Update AnalysisRecord interface to include firstPartyData and improvements fields
  - Ensure backward compatibility with existing stored analysis data
  - Add methods for storing and retrieving improvement data
  - _Requirements: 4.1, 4.2, 5.5_

- [ ] 9. Create UI components for confidence display
  - Implement confidence badge component that shows "Speculative" when confidence < 0.6
  - Add source attribution display components for showing source URLs and excerpts
  - Integrate confidence badges into existing structured report UI
  - Ensure components handle missing confidence data gracefully
  - _Requirements: 1.2, 1.3, 4.4_

- [ ] 10. Implement business improvement UI components
  - Create improvement panel component for displaying 3 business twists
  - Implement 7-day plan display component with daily task organization
  - Add "Copy Plan" button functionality for clipboard export
  - Integrate improvement components with existing analysis dashboard
  - _Requirements: 3.1, 3.5, 4.4_

- [ ] 11. Add comprehensive error handling and validation
  - Implement timeout handling for all new external requests (first-party extraction, improvement generation)
  - Add validation for all new schema fields and API inputs
  - Create user-friendly error messages for common failure scenarios
  - Ensure graceful degradation when enhanced features fail
  - _Requirements: 4.3, 5.1, 5.2, 5.4_

- [ ] 12. Write unit tests for new functionality
  - Create tests for first-party data extraction with various HTML structures
  - Write tests for enhanced schema validation and confidence scoring
  - Implement tests for business improvement generation logic
  - Add tests for error handling scenarios and timeout behavior
  - _Requirements: 1.1, 2.1, 3.2, 5.1_

- [ ] 13. Write integration tests for enhanced analysis flow
  - Test complete analysis flow with first-party data extraction
  - Test improvement generation endpoint with various analysis types
  - Verify backward compatibility with existing analysis records
  - Test error scenarios and fallback behavior
  - _Requirements: 2.4, 3.1, 4.1, 4.2_

- [ ] 14. Performance optimization and final integration
  - Optimize first-party data extraction for speed and reliability
  - Ensure concurrent request handling doesn't impact system performance
  - Verify all components integrate seamlessly with existing dashboard
  - Conduct final testing of complete enhanced analysis workflow
  - _Requirements: 5.1, 5.2, 5.3, 5.5_