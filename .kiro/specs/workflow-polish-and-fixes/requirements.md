# Requirements Document: Workflow Polish and Bug Fixes

## Introduction

This specification addresses bugs, UX issues, and enhancements identified during comprehensive testing of the 6-stage workflow system. The issues range from critical bugs that prevent users from seeing generated content to polish items that improve the overall user experience.

**Testing Date:** October 6, 2025  
**Scope:** Bug fixes and enhancements for Stages 1-6 of the workflow system  
**Priority:** Critical bugs first, then high-priority UX improvements, followed by enhancements

---

## Requirements

### Requirement 1: Fix Critical Content Visibility Issues

**User Story:** As a user generating stage content, I want to see the results immediately after generation, so that I can review and understand what was created before proceeding.

#### Acceptance Criteria

1. WHEN a user completes stage generation THEN the system SHALL display the generated content on the current stage
2. WHEN stage generation completes THEN the system SHALL NOT automatically navigate to the next stage
3. WHEN a user views generated stage content THEN the system SHALL provide a clear "Continue to Next Stage" button
4. WHEN a user clicks "Continue to Next Stage" THEN the system SHALL navigate to the next stage

**Priority:** Critical  
**Related Issues:** #11 (Auto-navigation hides content)

---

### Requirement 2: Provide Comprehensive Export Functionality

**User Story:** As a user who has completed the workflow, I want to export a complete business plan with all stages, so that I have a professional deliverable to share or reference.

#### Acceptance Criteria

1. WHEN a user completes Stage 6 THEN the system SHALL display an "Export Complete Business Plan" button
2. WHEN a user clicks "Export Complete Business Plan" THEN the system SHALL generate a comprehensive document containing all 6 stages
3. WHEN exporting the complete plan THEN the system SHALL offer PDF, HTML, and JSON formats
4. WHEN generating the complete export THEN the system SHALL include:
   - Cover page with business name and analysis date
   - Table of contents with links to each stage
   - All stage content formatted professionally
   - Clonability scorecard from Stage 1
   - All scores, recommendations, and plans from Stages 2-6
5. WHEN the export is generated THEN the system SHALL download the file with a descriptive filename (e.g., "business-plan-coolors-co-2025-10-06.pdf")

**Priority:** Critical  
**Related Issues:** #15 (Anti-climactic ending, no comprehensive export)

---

### Requirement 3: Fix Clonability Scorecard Calculations

**User Story:** As a user viewing the clonability scorecard, I want accurate scores and clear labels, so that I can trust the analysis and make informed decisions.

#### Acceptance Criteria

1. WHEN the system calculates the overall clonability score THEN it SHALL correctly sum the weighted scores
2. WHEN displaying the overall score THEN the system SHALL show the mathematically correct value
3. WHEN displaying "Technical Complexity" THEN the system SHALL use clear labeling that indicates whether high scores mean complex or simple
4. WHEN a score is displayed with a color indicator THEN the color SHALL match the semantic meaning (green = good/simple, red = bad/complex)
5. WHEN calculating weighted scores THEN the system SHALL use the formula: (Score / 10) × Weight × 10

**Priority:** Critical  
**Related Issues:** #3.2 (Incorrect math), #3.1 (Unclear scoring direction)

---

### Requirement 4: Display Business Improvement Results

**User Story:** As a user who generates business improvement suggestions, I want to see the results on screen, so that I can review and act on the recommendations.

#### Acceptance Criteria

1. WHEN a user clicks "Generate Business Improvements" THEN the system SHALL display a loading indicator
2. WHEN business improvements are generated THEN the system SHALL display the results in a dedicated section on Stage 1
3. WHEN displaying improvement results THEN the system SHALL show:
   - Improvement opportunities with descriptions
   - Prioritized action items
   - Expected impact for each improvement
   - Implementation difficulty ratings
4. WHEN improvements are displayed THEN the system SHALL provide export options for the improvement plan
5. WHEN generation fails THEN the system SHALL display a clear error message with retry option

**Priority:** Critical  
**Related Issues:** #5 (Hidden improvement results)

---

### Requirement 5: Update Progress Tracker in Real-Time

**User Story:** As a user progressing through the workflow, I want the progress tracker to accurately reflect my current stage and completion status, so that I know where I am in the process.

#### Acceptance Criteria

1. WHEN a user completes a stage THEN the progress tracker SHALL mark that stage as "Completed"
2. WHEN a user navigates to a stage THEN the progress tracker SHALL highlight that stage as "In Progress"
3. WHEN a user views the progress tracker THEN it SHALL show:
   - Completed stages with checkmark icon and "Completed" status
   - Current stage with highlight and "In Progress" status
   - Future stages with "Pending" status
4. WHEN stage status changes THEN the progress tracker SHALL update immediately without page refresh
5. WHEN all stages are completed THEN the progress tracker SHALL show all stages as "Completed"

**Priority:** High  
**Related Issues:** #10 (Progress tracker stuck on Stage 1)

---

### Requirement 6: Add Export to All Stages

**User Story:** As a user working on any stage, I want to export that stage's content, so that I can share or save individual sections of my analysis.

#### Acceptance Criteria

1. WHEN a user views any stage (1-6) THEN the system SHALL display an "Export" button
2. WHEN a user clicks "Export" THEN the system SHALL show a dropdown with format options: HTML, JSON, CSV, PDF
3. WHEN a user selects a format THEN the system SHALL generate and download the stage content in that format
4. WHEN exporting to HTML THEN the system SHALL include formatted content with styling
5. WHEN exporting to JSON THEN the system SHALL include the complete structured data for that stage
6. WHEN exporting to CSV THEN the system SHALL flatten the data into a tabular format
7. WHEN exporting to PDF THEN the system SHALL generate a professional-looking document with the stage content

**Priority:** High  
**Related Issues:** #14 (Export missing from stages 2-6)

---

### Requirement 7: Improve Stage Navigation UX

**User Story:** As a user navigating between stages, I want clear, consistent navigation controls, so that I can easily move forward and backward through the workflow.

#### Acceptance Criteria

1. WHEN a user views a completed stage THEN the system SHALL display a "Continue to Next Stage" button at the bottom
2. WHEN a user clicks "Continue to Next Stage" THEN the system SHALL navigate to the next stage
3. WHEN a user is on the last stage (Stage 6) THEN the "Continue" button SHALL be replaced with "Export Complete Plan"
4. WHEN a user clicks on a completed stage tab THEN the system SHALL navigate to that stage without showing errors
5. WHEN a user views any stage THEN the navigation button SHALL be consistently placed at the bottom of the content
6. WHEN a user navigates to a completed stage THEN the system SHALL NOT attempt to regenerate content

**Priority:** High  
**Related Issues:** #13 (Poor button placement), #6 (False error on completed stages), #9 (Missing next stage button)

---

### Requirement 8: Fix CSV Export Functionality

**User Story:** As a user exporting analysis data, I want CSV export to work reliably, so that I can import the data into spreadsheet tools.

#### Acceptance Criteria

1. WHEN a user selects "Export as CSV" from Stage 1 THEN the system SHALL generate a valid CSV file
2. WHEN generating CSV THEN the system SHALL properly escape special characters (commas, quotes, newlines)
3. WHEN generating CSV THEN the system SHALL include headers for all columns
4. WHEN generating CSV THEN the system SHALL flatten nested data structures appropriately
5. WHEN CSV generation fails THEN the system SHALL display a clear error message

**Priority:** Medium  
**Related Issues:** #4.2 (CSV export broken)

---

### Requirement 9: Improve URL Input Validation

**User Story:** As a user entering a business URL, I want the system to accept URLs with or without the protocol prefix, so that I don't have to remember to type "https://".

#### Acceptance Criteria

1. WHEN a user enters a URL without "http://" or "https://" THEN the system SHALL automatically prepend "https://"
2. WHEN a user enters a URL with "http://" THEN the system SHALL accept it as-is
3. WHEN a user enters a URL with "https://" THEN the system SHALL accept it as-is
4. WHEN a user enters an invalid URL THEN the system SHALL display a clear validation error
5. WHEN validating URLs THEN the system SHALL check for valid domain format

**Priority:** Medium  
**Related Issues:** #1 (Requires https:// prefix)

---

### Requirement 10: Document Score Calculation Logic

**User Story:** As a user viewing scores across stages, I want to understand how they relate to each other, so that I can trust the analysis and understand the methodology.

#### Acceptance Criteria

1. WHEN displaying the clonability scorecard THEN the system SHALL include a tooltip or info icon explaining the calculation
2. WHEN a user clicks the info icon THEN the system SHALL display:
   - How the overall score is calculated from weighted criteria
   - What each criterion measures
   - How Stage 1 scores relate to Stage 2 effort/reward scores
3. WHEN displaying Stage 2 scores THEN the system SHALL show how effort and reward scores inform the recommendation
4. WHEN scores are calculated THEN the system SHALL use consistent methodology across all stages

**Priority:** Medium  
**Related Issues:** #8 (Score calculation transparency)

---

### Requirement 11: Fix Export Dropdown Behavior

**User Story:** As a user accessing export options, I want the dropdown to open and close properly, so that I can select my desired format without confusion.

#### Acceptance Criteria

1. WHEN a user clicks the "Export" button THEN the dropdown SHALL expand to show format options
2. WHEN the dropdown is open and user clicks "Export" again THEN the dropdown SHALL collapse
3. WHEN the dropdown is open and user clicks outside THEN the dropdown SHALL collapse
4. WHEN a user selects a format THEN the dropdown SHALL collapse after initiating the export
5. WHEN the page loads THEN the export dropdown SHALL be collapsed by default

**Priority:** Low  
**Related Issues:** #4.1 (Dropdown always expanded)

---

### Requirement 12: Fix AI Provider Display

**User Story:** As a user selecting an AI provider, I want the UI to accurately reflect my selection, so that I know which model is being used.

#### Acceptance Criteria

1. WHEN a user selects an AI provider THEN the UI SHALL display the correct provider name
2. WHEN a user selects "Gemini Flash 2.5" THEN the UI SHALL show "Gemini Flash 2.5" not "Grok"
3. WHEN the active provider changes THEN all UI references SHALL update to reflect the new provider
4. WHEN displaying the provider name THEN the system SHALL use the actual provider being used for API calls

**Priority:** Low  
**Related Issues:** #2 (AI provider display bug)

---

### Requirement 13: Remove Non-Functional UI Elements

**User Story:** As a user navigating the interface, I want all visible buttons to be functional, so that I don't experience confusion or frustration.

#### Acceptance Criteria

1. WHEN a user views Stage 2 THEN the system SHALL NOT display a non-functional "GO" button
2. WHEN removing the "GO" button THEN the system SHALL ensure no layout issues are introduced
3. WHEN a button is displayed THEN it SHALL have a clear purpose and function

**Priority:** Low  
**Related Issues:** #7 (Non-functional GO button)

---

## Enhancement Requests (Future Consideration)

### Enhancement 1: Add PDF Export Option
**Description:** Add PDF as an export format option for individual stages  
**Priority:** Low  
**Related Issues:** #4.3

### Enhancement 2: More Detailed Cost Breakdown
**Description:** Provide granular cost breakdown in Stage 3 (development, infrastructure, tools, marketing, contingency)  
**Priority:** Low  
**Related Issues:** #12

---

## Testing Notes Reference

All requirements are based on comprehensive user testing conducted on October 6, 2025, covering all 6 stages of the workflow system. Detailed testing notes and issue descriptions are available in the project documentation.
