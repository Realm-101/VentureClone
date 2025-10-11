# Implementation Plan

- [x] 1. Fix critical null safety issue in technology-stack component





  - Add optional chaining to tech.categories.forEach() on line 105
  - Add null check for detectedTech?.technologies before reduce operation
  - Provide fallback empty object for groupedTechnologies
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 1.1 Add test for technology without categories



  - Create test case with technology object missing categories property
  - Verify component renders without crashing
  - Verify technology is handled gracefully (skipped or default category)
  - _Requirements: 1.1, 1.3_

- [x] 2. Resolve component-test text mismatches





  - Update estimates-card.tsx heading from "Resource Estimates" to "Time & Cost Estimates"
  - Update complexity-breakdown.tsx heading from "Complexity Analysis" to "Complexity Breakdown"
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2.1 Verify text mismatch tests pass


  - Run estimates-card.test.tsx and verify all tests pass
  - Run complexity-breakdown.test.tsx and verify all tests pass
  - Run technology-stack.test.tsx integration tests
  - _Requirements: 2.5, 5.2_
-

- [x] 3. Fix skill requirements test query issues




  - Update skill-requirements-section.test.tsx to use getAllByText for "Intermediate" proficiency
  - Update test to use getAllByText for "Critical" priority badges
  - Add length assertions for array results
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3.1 Verify skill requirements tests pass



  - Run skill-requirements-section.test.tsx
  - Verify all proficiency level tests pass
  - Verify all priority badge tests pass
  - _Requirements: 3.4, 5.3_

- [x] 4. Add defensive null checking to estimates-card component





  - Add optional chaining for estimates.developmentTime access
  - Add optional chaining for estimates.oneTimeCost access
  - Add optional chaining for estimates.monthlyCost access
  - Add null check before rendering component content
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 5. Add defensive null checking to complexity-breakdown component





  - Add optional chaining for breakdown.breakdown access
  - Add optional chaining for breakdown.factors access
  - Add null checks before iterating over technologies arrays
  - Provide fallback for missing explanation text
  - _Requirements: 4.1, 4.2, 4.3, 4.4_
-

- [x] 6. Add defensive null checking to skill-requirements-section component




  - Add null check for skills array before mapping
  - Add optional chaining for skill.learningResources access
  - Add optional chaining for skill.relatedTechnologies access
  - Provide empty state when skills array is empty or undefined
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

-

- [x] 7. Add defensive null checking to build-vs-buy-section component



  - Add null check for buildVsBuy array before mapping
  - Add optional chaining for saasAlternative nested properties
  - Add optional chaining for estimatedSavings access
  - Provide empty state when buildVsBuy array is empty or undefined
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 8. Add defensive null checking to recommendations-section component




  - Add null check for recommendations array before mapping
  - Add optional chaining for recommendation properties
  - Provide empty state when recommendations array is empty or undefined
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

-

- [x] 9. Add defensive null checking to clonability-score-card component



  - Add optional chaining for clonabilityScore.components access
  - Add optional chaining for clonabilityScore.recommendation access
  - Add null check before rendering score details
  - Provide fallback values for missing score data
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 10. Add null safety tests for all components






  - Add test cases for undefined props in estimates-card.test.tsx
  - Add test cases for undefined props in complexity-breakdown.test.tsx
  - Add test cases for undefined props in skill-requirements-section.test.tsx
  - Add test cases for undefined props in build-vs-buy-section.test.tsx
  - Add test cases for undefined props in recommendations-section.test.tsx
  - Add test cases for undefined props in clonability-score-card.test.tsx
  - _Requirements: 4.4, 5.1_

- [x] 11. Add partial data tests for all components






  - Test estimates-card with only developmentTime
  - Test complexity-breakdown with missing factors
  - Test skill-requirements-section with skills missing learningResources
  - Test build-vs-buy-section with recommendations missing saasAlternative
  - Test recommendations-section with minimal recommendation data
  - Test clonability-score-card with missing components
  - _Requirements: 4.4, 5.1_

- [x] 12. Run full test suite and verify improvements






  - Execute npm test to run all tests
  - Verify test pass rate is 95% or higher
  - Document any remaining failures
  - Verify no regressions in previously passing tests
  - _Requirements: 5.4_
