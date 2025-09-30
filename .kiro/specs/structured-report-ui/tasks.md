# Implementation Plan

- [x] 1. Create StructuredReport component with core functionality





  - Create new file `client/src/components/StructuredReport.tsx`
  - Implement main StructuredReport component with TypeScript interfaces
  - Add proper null safety and graceful handling of missing data
  - _Requirements: 1.1, 1.4, 5.3, 5.4_

- [x] 2. Implement collapsible Section component





  - Create reusable Section component within StructuredReport.tsx
  - Add toggle state management with useState hook
  - Implement click-to-toggle functionality with proper event handling
  - Set default expanded state for all sections
  - _Requirements: 1.2, 1.3_

- [x] 3. Implement the 5 data sections with structured rendering





  - Code Overview & Business section with value proposition, audience, and monetization
  - Implement Market & Competitors section with clickable competitor URLs
  - Create Technical & Website section for tech stack and UI details
  - Build Data & Analytics section with traffic estimates and key metrics
  - Develop Synthesis & Key Takeaways section with insights and next actions
  - _Requirements: 1.1, 1.5_

- [x] 4. Add SWOT analysis grid layout in Market section





  - Implement 2x2 grid layout for strengths, weaknesses, opportunities, threats
  - Add proper responsive design with md:grid-cols-2
  - Include proper null checks for missing SWOT data
  - _Requirements: 1.1, 2.5_

- [x] 5. Implement Copy Markdown export functionality





  - Create copyMarkdown utility function with proper markdown formatting
  - Add markdown generation for all 5 sections with proper heading hierarchy
  - Implement competitor URLs as markdown links where available
  - Add SWOT analysis formatting as separate bullet lists
  - Integrate with browser clipboard API
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 6. Implement Download JSON export functionality





  - Create downloadJson utility function for file generation
  - Implement filename slugification with URL-to-safe-filename conversion
  - Add blob creation and automatic download trigger
  - Use filename format "analysis-{slugified-url}.json"
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 7. Create slugify utility function





  - Implement URL-to-filename conversion logic
  - Replace non-alphanumeric characters with hyphens
  - Remove leading and trailing hyphens
  - Convert to lowercase for consistency
  - _Requirements: 3.4_

- [x] 8. Add export action buttons with proper styling





  - Create Copy Markdown and Download JSON buttons
  - Apply consistent Tailwind CSS styling matching existing components
  - Add proper button spacing and layout
  - Implement click handlers for both export functions
  - _Requirements: 2.1, 3.1, 4.4_

- [x] 9. Extend client-side AnalysisRecord interface





  - Update `client/src/types/minimal-api.ts` to include optional structured field
  - Add proper TypeScript typing for structured data
  - Ensure backward compatibility with existing code
  - _Requirements: 5.5_

- [x] 10. Integrate StructuredReport into MinimalDashboard





  - Import StructuredReport component in minimal-dashboard.tsx
  - Add conditional rendering logic in AnalysisListItem component
  - Implement fallback to plain summary when structured data is absent
  - Maintain existing styling and layout consistency
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 11. Write comprehensive unit tests for StructuredReport component






  - Create test file `client/src/components/__tests__/StructuredReport.test.tsx`
  - Test component rendering with complete structured data
  - Test rendering with partial/missing data scenarios
  - Test null/undefined data handling and graceful degradation
  - Test section collapsible functionality
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [-] 12. Write unit tests for export functionality



  - Test markdown generation with various data scenarios
  - Test JSON download functionality and blob creation
  - Test filename slugification with different URL formats
  - Mock clipboard API for copy functionality testing
  - Test export buttons click handlers
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 3.2, 3.3, 3.4, 3.5_