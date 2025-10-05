# Implementation Plan

- [x] 1. Create workflow service foundation





  - Create `server/services/workflow.ts` with WorkflowService class
  - Implement stage validation logic
  - Add stage progression state machine
  - _Requirements: 6.1, 6.2, 6.3_
-

- [x] 2. Implement Stage 2 (Lazy-Entrepreneur Filter)




- [x] 2.1 Create Stage 2 AI prompt generator


  - Write prompt that analyzes effort vs. reward
  - Include automation potential assessment
  - Request structured JSON with effort/reward scores
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2.2 Define Stage 2 data schema


  - Create TypeScript interface for Stage2Content
  - Add Zod validation schema
  - Include effort score, reward score, recommendation
  - _Requirements: 1.3, 1.4_


- [x] 2.3 Implement Stage 2 generation endpoint

  - Add POST /api/business-analyses/:id/stages/2
  - Validate analysis exists and has required data
  - Call AI provider with Stage 2 prompt
  - Save stage data to analysis record
  - _Requirements: 1.1, 1.5, 8.1_


- [x] 3. Implement Stage 3 (MVP Launch Planning)





- [x] 3.1 Create Stage 3 AI prompt generator

  - Write prompt for MVP feature identification
  - Request tech stack recommendations
  - Include timeline estimation
  - _Requirements: 2.1, 2.2, 2.3, 2.4_


- [x] 3.2 Define Stage 3 data schema

  - Create TypeScript interface for Stage3Content
  - Add validation for core features and tech stack
  - _Requirements: 2.5_


- [x] 3.3 Implement Stage 3 generation endpoint

  - Add POST /api/business-analyses/:id/stages/3
  - Ensure Stage 2 is completed first
  - Generate and save MVP plan
  - _Requirements: 2.1, 2.5, 6.1_

- [x] 4. Implement Stage 4 (Demand Testing Strategy)





- [x] 4.1 Create Stage 4 AI prompt generator


  - Write prompt for testing strategy recommendations
  - Request specific testing methods
  - Include budget and timeline estimates
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4.2 Define Stage 4 data schema


  - Create TypeScript interface for Stage4Content
  - Add validation for testing methods and metrics
  - _Requirements: 3.5_

- [x] 4.3 Implement Stage 4 generation endpoint


  - Add POST /api/business-analyses/:id/stages/4
  - Ensure Stage 3 is completed first
  - Generate and save testing strategy
  - _Requirements: 3.1, 3.5, 6.1_

- [ ] 5. Implement Stage 5 (Scaling & Growth)

- [ ] 5.1 Create Stage 5 AI prompt generator
  - Write prompt for growth strategy planning
  - Request growth channels and tactics
  - Include resource scaling recommendations
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 5.2 Define Stage 5 data schema
  - Create TypeScript interface for Stage5Content
  - Add validation for growth channels and milestones
  - _Requirements: 4.5_

- [ ] 5.3 Implement Stage 5 generation endpoint
  - Add POST /api/business-analyses/:id/stages/5
  - Ensure Stage 4 is completed first
  - Generate and save scaling plan
  - _Requirements: 4.1, 4.5, 6.1_

- [ ] 6. Implement Stage 6 (AI Automation Mapping)
- [ ] 6.1 Create Stage 6 AI prompt generator
  - Write prompt for automation opportunity identification
  - Request specific AI tools and services
  - Include ROI estimation
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 6.2 Define Stage 6 data schema
  - Create TypeScript interface for Stage6Content
  - Add validation for automation opportunities
  - _Requirements: 5.5_

- [ ] 6.3 Implement Stage 6 generation endpoint
  - Add POST /api/business-analyses/:id/stages/6
  - Ensure Stage 5 is completed first
  - Generate and save automation map
  - Mark analysis as fully complete
  - _Requirements: 5.1, 5.5, 6.1, 6.5_

- [ ] 7. Update storage layer for stage data
- [ ] 7.1 Add stages field to AnalysisRecord interface
  - Add stages object to store all stage data
  - Add currentStage and completedStages tracking
  - Update CreateAnalysisInput if needed
  - _Requirements: 7.1, 7.2_

- [ ] 7.2 Implement updateAnalysisStageData method
  - Add method to save stage data to analysis
  - Update currentStage and completedStages
  - Preserve existing stage data
  - _Requirements: 7.1, 7.3, 7.4_

- [ ] 7.3 Implement getAnalysisStages method
  - Add method to retrieve all stages for an analysis
  - Return stage data with status
  - _Requirements: 7.2, 7.5_

- [ ] 8. Create unified stage generation endpoint
- [ ] 8.1 Add POST /api/business-analyses/:id/stages/:stageNumber
  - Accept stageNumber parameter (2-6)
  - Route to appropriate stage generator
  - Validate stage progression
  - Handle regeneration flag
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 8.2 Add GET /api/business-analyses/:id/stages
  - Return all stage data for an analysis
  - Include completion status
  - _Requirements: 8.2_

- [ ] 8.3 Add comprehensive error handling
  - Handle invalid stage numbers
  - Handle missing analysis
  - Handle AI provider failures
  - Return user-friendly error messages
  - _Requirements: 8.3, 8.4, 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 9. Update frontend WorkflowTabs component
- [ ] 9.1 Add stage generation buttons
  - Add "Generate" button for each stage
  - Show loading state during generation
  - Display success/error messages
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ] 9.2 Display stage content
  - Create stage-specific display components
  - Format stage data for readability
  - Show all stage fields properly
  - _Requirements: 10.5_

- [ ] 9.3 Update progress tracking
  - Show completed stages
  - Highlight current stage
  - Disable future stages until unlocked
  - _Requirements: 6.2, 6.3_

- [ ] 9.4 Add regeneration capability
  - Allow users to regenerate completed stages
  - Confirm before regenerating
  - _Requirements: 6.4_

- [ ] 10. Add validation and quality checks
- [ ] 10.1 Validate AI responses
  - Check response structure matches schema
  - Validate required fields are present
  - Ensure content is business-specific
  - _Requirements: 10.1, 10.2_

- [ ] 10.2 Add content quality checks
  - Verify recommendations are actionable
  - Check for placeholder text
  - Ensure estimates are realistic
  - _Requirements: 10.2, 10.3, 10.4_

- [ ] 11. Testing and refinement
- [ ] 11.1 Test stage generation with real analyses
  - Test each stage with different businesses
  - Verify content quality
  - Check for errors
  - _Requirements: All_

- [ ] 11.2 Refine AI prompts based on results
  - Improve prompt clarity
  - Add more specific instructions
  - Adjust schema if needed
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 11.3 Add error recovery
  - Implement retry logic for transient failures
  - Save partial results if possible
  - Provide clear next steps on errors
  - _Requirements: 9.1, 9.2, 9.3, 9.4_
