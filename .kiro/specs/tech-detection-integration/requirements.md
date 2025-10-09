# Requirements Document

## Introduction

VentureClone currently relies on AI providers (OpenAI, Gemini, Grok) to infer technology stacks from website content analysis. This approach produces subjective results with varying accuracy since the AI is essentially "guessing" based on visible content rather than performing actual technical detection.

This feature integrates Wappalyzer technology detection directly into VentureClone's analysis workflow to provide accurate, evidence-based technology stack identification. By combining Wappalyzer's fingerprinting capabilities with AI's business insight generation, we'll deliver more reliable clonability assessments and better-informed recommendations to users.

The integration will enhance the Stage 1 (Discovery & Analysis) workflow by running parallel detection - Wappalyzer for technical accuracy and AI for business context - then merging results to create a comprehensive analysis that leverages the strengths of both approaches.

## Requirements

### Requirement 1: Wappalyzer Integration

**User Story:** As a VentureClone user, I want accurate technology stack detection based on actual technical fingerprinting, so that I can make informed decisions about cloning complexity.

#### Acceptance Criteria

1. WHEN a user submits a URL for analysis THEN the system SHALL fetch and analyze the website using Wappalyzer technology detection
2. WHEN Wappalyzer analyzes a website THEN it SHALL detect technologies including frameworks, libraries, CMS platforms, analytics tools, hosting providers, and payment processors
3. WHEN technologies are detected THEN the system SHALL capture technology name, category, confidence score, version (if available), and detection timestamp
4. WHEN Wappalyzer detection fails THEN the system SHALL log the error and continue with AI-only analysis without blocking the user workflow
5. WHEN detection completes THEN the system SHALL store both raw Wappalyzer results and AI-inferred tech stack for comparison and validation

### Requirement 2: Parallel Analysis Execution

**User Story:** As a VentureClone user, I want fast analysis results, so that I don't have to wait longer for more accurate technology detection.

#### Acceptance Criteria

1. WHEN Stage 1 analysis begins THEN the system SHALL execute Wappalyzer detection and AI analysis in parallel using Promise.all
2. WHEN both analyses complete THEN the system SHALL merge results within 100ms
3. WHEN one analysis fails THEN the system SHALL continue with the successful analysis result
4. WHEN both analyses fail THEN the system SHALL return a clear error message to the user
5. WHEN analysis completes THEN the total execution time SHALL NOT increase by more than 10% compared to AI-only analysis

### Requirement 3: Enhanced Data Storage

**User Story:** As a developer, I want to store both AI-detected and Wappalyzer-detected technology information, so that we can compare accuracy and improve our analysis over time.

#### Acceptance Criteria

1. WHEN analysis completes THEN the system SHALL store Wappalyzer results in the businessAnalyses table under a new technical.actualDetected field
2. WHEN storing detection results THEN the system SHALL preserve the existing technical.techStack field for backward compatibility
3. WHEN Wappalyzer detects technologies THEN the system SHALL store the complete technology object including categories, confidence, version, website URL, and icon
4. WHEN storing results THEN the system SHALL include a detectedAt timestamp for audit purposes
5. WHEN querying historical analyses THEN the system SHALL return both AI-detected and Wappalyzer-detected tech stacks

### Requirement 4: AI Prompt Enhancement

**User Story:** As a VentureClone user, I want AI recommendations based on actual technology stacks, so that I receive more accurate and actionable guidance.

#### Acceptance Criteria

1. WHEN Wappalyzer successfully detects technologies THEN the system SHALL include the actual tech stack in AI prompts for subsequent stages
2. WHEN generating Stage 3 (MVP Planning) recommendations THEN the AI SHALL use detected technologies to suggest compatible frameworks and tools
3. WHEN generating Stage 6 (AI Automation) recommendations THEN the AI SHALL consider the actual tech stack for integration suggestions
4. WHEN Wappalyzer detection fails THEN the system SHALL fall back to using AI-inferred tech stack in prompts
5. WHEN creating prompts THEN the system SHALL clearly distinguish between "detected technologies" and "inferred technologies"

### Requirement 5: Technical Complexity Scoring

**User Story:** As a VentureClone user, I want accurate technical complexity scores based on real technology detection, so that I can better assess cloning difficulty.

#### Acceptance Criteria

1. WHEN technologies are detected THEN the system SHALL calculate a complexity score from 1-10 based on detected tech stack
2. WHEN calculating complexity THEN the system SHALL consider factors including custom code indicators, framework complexity level, and infrastructure complexity level
3. WHEN a no-code platform is detected (Webflow, Wix, Squarespace) THEN the complexity score SHALL be 1-3
4. WHEN modern frameworks are detected (React, Vue, Next.js) THEN the complexity score SHALL be 4-6
5. WHEN complex infrastructure is detected (Kubernetes, microservices, custom backends) THEN the complexity score SHALL be 7-10
6. WHEN complexity is calculated THEN the system SHALL store the score and contributing factors for transparency

### Requirement 6: UI Enhancement

**User Story:** As a VentureClone user, I want to see detailed technology information in the analysis results, so that I understand what technologies power the business I'm analyzing.

#### Acceptance Criteria

1. WHEN viewing Stage 1 analysis results THEN the UI SHALL display detected technologies grouped by category
2. WHEN displaying technologies THEN the UI SHALL show technology name, version (if available), and confidence level
3. WHEN technologies are detected THEN the UI SHALL display a visual complexity indicator (1-10 scale with color coding)
4. WHEN both AI and Wappalyzer detect tech stacks THEN the UI SHALL show both with clear labels ("AI Inferred" vs "Detected")
5. WHEN hovering over a technology THEN the UI SHALL display additional details including category and official website link

### Requirement 7: Error Handling and Fallback

**User Story:** As a VentureClone user, I want reliable analysis results even when technology detection fails, so that I can always complete my business evaluation.

#### Acceptance Criteria

1. WHEN Wappalyzer fails to fetch a URL THEN the system SHALL log the error with request ID and continue with AI-only analysis
2. WHEN Wappalyzer times out (>15 seconds) THEN the system SHALL cancel the request and fall back to AI analysis
3. WHEN network errors occur THEN the system SHALL retry once before falling back
4. WHEN falling back to AI-only analysis THEN the system SHALL set a flag indicating detection was not performed
5. WHEN errors occur THEN the system SHALL NOT expose technical error details to end users

### Requirement 8: Performance Monitoring

**User Story:** As a developer, I want to monitor technology detection performance, so that I can identify and resolve issues quickly.

#### Acceptance Criteria

1. WHEN Wappalyzer detection runs THEN the system SHALL log execution time, success/failure status, and number of technologies detected
2. WHEN detection completes THEN the system SHALL include metrics in the structured log output
3. WHEN detection fails THEN the system SHALL log error type, URL, and request ID for debugging
4. WHEN analyzing performance THEN developers SHALL be able to query logs to calculate average detection time and success rate
5. WHEN detection takes longer than 10 seconds THEN the system SHALL log a warning for performance investigation
