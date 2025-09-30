# Requirements Document

## Introduction

This feature implements three critical upgrades to the VentureClone AI analysis system to improve accuracy, reliability, and actionability. The upgrades include: (1) eliminating hedging language and adding confidence scoring with source attribution, (2) implementing first-party data extraction from target websites to provide concrete evidence, and (3) creating an "improve this clone" endpoint that generates actionable business improvement strategies. These enhancements will transform the analysis from speculative assessments to evidence-based insights with clear next steps.

## Requirements

### Requirement 1

**User Story:** As a user analyzing businesses, I want confident, evidence-based analysis without hedging language, so that I can make informed decisions based on concrete data rather than speculation.

#### Acceptance Criteria

1. WHEN the system makes technical stack claims THEN it SHALL include a confidence score between 0 and 1
2. WHEN confidence is below 0.6 THEN the system SHALL display a "Speculative" badge in the UI
3. WHEN making concrete claims about metrics THEN the system SHALL include source URLs and excerpts
4. WHEN data is not directly observable THEN the system SHALL display "unknown" instead of guessing
5. WHEN no evidence exists for a claim THEN the system SHALL not include that claim in the analysis
6. WHEN sources are provided THEN each SHALL include a URL and a 10-300 character excerpt from the source

### Requirement 2

**User Story:** As a user analyzing businesses, I want analysis based on actual website content, so that the insights reflect what the business actually offers rather than AI assumptions.

#### Acceptance Criteria

1. WHEN analyzing a URL THEN the system SHALL fetch the homepage content directly
2. WHEN fetching content THEN the system SHALL extract title, description, H1 tag, and body text snippet
3. WHEN content extraction succeeds THEN the system SHALL use this as context for AI analysis
4. WHEN the target site is unreachable THEN the system SHALL indicate "SITE CONTEXT unavailable" and continue analysis
5. WHEN providing analysis THEN the system SHALL anchor insights to the actual site content
6. WHEN extracting data THEN the system SHALL include the target site as a first-party source for any claims made

### Requirement 3

**User Story:** As an entrepreneur, I want actionable improvement suggestions for analyzed businesses, so that I can build a better version rather than just copying the original.

#### Acceptance Criteria

1. WHEN viewing a completed analysis THEN the system SHALL display an "Improve this" button
2. WHEN clicking "Improve this" THEN the system SHALL generate three distinct business improvement angles
3. WHEN generating improvements THEN the system SHALL create a 7-day shipping plan with daily tasks
4. WHEN creating the shipping plan THEN each day SHALL have maximum 3 bullet points
5. WHEN displaying the plan THEN the system SHALL include a "Copy Plan" button for clipboard export
6. WHEN generating improvements THEN the system SHALL focus on lean scope, quick validation, and measurable KPIs

### Requirement 4

**User Story:** As a developer, I want the enhanced analysis system to maintain backward compatibility, so that existing functionality continues to work while new features are added.

#### Acceptance Criteria

1. WHEN implementing confidence scoring THEN existing analysis records SHALL continue to display without errors
2. WHEN adding source attribution THEN the system SHALL handle analyses without sources gracefully
3. WHEN first-party fetching fails THEN the system SHALL fall back to AI-only analysis
4. WHEN the improve endpoint is unavailable THEN existing analysis viewing SHALL remain functional
5. WHEN schema changes are made THEN the system SHALL handle both old and new data formats

### Requirement 5

**User Story:** As a system administrator, I want the enhanced analysis features to be performant and reliable, so that the user experience remains smooth despite additional processing.

#### Acceptance Criteria

1. WHEN fetching first-party content THEN the system SHALL timeout after 10 seconds maximum
2. WHEN multiple analysis requests are made THEN first-party fetching SHALL not block other operations
3. WHEN generating improvements THEN the system SHALL complete within 30 seconds
4. WHEN first-party fetching fails THEN the system SHALL log the error but continue processing
5. WHEN storing enhanced analysis data THEN the system SHALL maintain existing performance characteristics