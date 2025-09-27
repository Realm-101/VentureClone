# Requirements Document

## Introduction

This feature implements a minimal viable version of VentureClone focused on delivering one core golden path: users can paste a URL, run AI analysis using OpenAI, save the results, and view a list of their analyses. The implementation prioritizes speed to market, reduces bloat, makes persistence switchable (memory now, database later), and keeps experimental features behind feature flags.

## Requirements

### Requirement 1

**User Story:** As a user, I want to paste a URL and get an AI-powered business analysis, so that I can quickly understand a company's value proposition, target audience, and monetization strategy.

#### Acceptance Criteria

1. WHEN a user enters a URL in the input field THEN the system SHALL accept any valid URL format
2. WHEN a user clicks the "Analyze" button THEN the system SHALL send the URL to OpenAI for analysis
3. WHEN the analysis is in progress THEN the system SHALL display a loading state with "Analyzing..." text
4. WHEN the OpenAI analysis completes THEN the system SHALL display a concise business teardown (100-150 words) covering value proposition, audience, and monetization
5. IF the OpenAI API key is missing THEN the system SHALL return an error message "OPENAI_API_KEY missing"
6. IF the OpenAI API call fails THEN the system SHALL return an appropriate error message with status code

### Requirement 2

**User Story:** As a user, I want my analyses to be automatically saved and persisted, so that I can review them later without losing my work.

#### Acceptance Criteria

1. WHEN an analysis completes successfully THEN the system SHALL automatically save the analysis record
2. WHEN saving an analysis THEN the system SHALL store the URL, summary, model used, creation timestamp, and user ID
3. WHEN the storage mode is set to "mem" THEN the system SHALL use in-memory storage
4. WHEN the storage mode is set to "db" THEN the system SHALL use database storage (when implemented)
5. WHEN a user visits the application THEN the system SHALL assign them a persistent user ID via cookie
6. IF a user doesn't have a user ID cookie THEN the system SHALL create one that expires in 1 year

### Requirement 3

**User Story:** As a user, I want to view a chronological list of all my previous analyses, so that I can easily reference and compare different business insights.

#### Acceptance Criteria

1. WHEN a user loads the dashboard THEN the system SHALL display all their saved analyses in reverse chronological order (newest first)
2. WHEN displaying each analysis THEN the system SHALL show the creation date, model used, clickable URL, and full summary text
3. WHEN a user clicks on a URL in the list THEN the system SHALL open the original website in a new tab
4. WHEN the analysis list is empty THEN the system SHALL display an empty state appropriately
5. WHEN there are multiple analyses THEN the system SHALL display them in a clean, readable list format

### Requirement 4

**User Story:** As a developer, I want the application to have minimal dependencies and fast load times, so that users have a smooth experience and the codebase is maintainable.

#### Acceptance Criteria

1. WHEN the application loads THEN the system SHALL use a minimal font stack (system fonts or single family like Inter)
2. WHEN building the application THEN the system SHALL exclude unused dependencies like embla-carousel-react, framer-motion, cmdk, vaul, recharts
3. WHEN the application starts THEN the system SHALL have fast Time To Interactive (TTI)
4. WHEN reviewing dependencies THEN the system SHALL only include libraries that are actively used
5. IF experimental features are disabled THEN the system SHALL not load heavy UI components

### Requirement 5

**User Story:** As a developer, I want experimental features to be behind feature flags, so that I can maintain a clean core experience while preserving the ability to test new functionality.

#### Acceptance Criteria

1. WHEN VITE_ENABLE_EXTRAS is set to "0" or unset THEN the system SHALL hide experimental/heavy UI components
2. WHEN VITE_ENABLE_EXTRAS is set to "1" THEN the system SHALL show experimental features
3. WHEN building for production THEN the system SHALL default to experimental features being disabled
4. WHEN adding new experimental features THEN the system SHALL check the feature flag before rendering
5. IF the feature flag is disabled THEN the system SHALL not load the associated JavaScript bundles

### Requirement 6

**User Story:** As a developer, I want the storage layer to be abstracted and switchable, so that I can start with in-memory storage and later migrate to a database without changing application logic.

#### Acceptance Criteria

1. WHEN the system starts THEN the system SHALL select storage implementation based on STORAGE environment variable
2. WHEN STORAGE is set to "mem" THEN the system SHALL use MemStorage implementation
3. WHEN STORAGE is set to "db" THEN the system SHALL use DbStorage implementation
4. WHEN switching storage implementations THEN the system SHALL maintain the same IStorage interface
5. WHEN using MemStorage THEN the system SHALL store data in memory with Map-based storage
6. WHEN implementing DbStorage THEN the system SHALL provide placeholder methods that can be wired to Drizzle later