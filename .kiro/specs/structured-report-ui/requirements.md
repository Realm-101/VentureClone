# Requirements Document

## Introduction

This feature introduces a comprehensive StructuredReport component that renders structured business analysis data in an organized, interactive format. The component provides collapsible sections for different analysis categories, along with export functionality for markdown and JSON formats. This enhancement improves the user experience when viewing detailed business analysis results by organizing information into digestible sections while maintaining backward compatibility with existing summary-only displays.

## Requirements

### Requirement 1

**User Story:** As a user analyzing businesses, I want to view structured analysis data in organized, collapsible sections, so that I can easily navigate through different aspects of the analysis without being overwhelmed by information.

#### Acceptance Criteria

1. WHEN structured analysis data is available THEN the system SHALL display a StructuredReport component with 5 distinct sections
2. WHEN a user clicks on a section header THEN the system SHALL toggle the visibility of that section's content
3. WHEN the component loads THEN all sections SHALL be expanded by default
4. IF no structured data is available THEN the system SHALL fall back to displaying the plain summary text
5. WHEN displaying competitors THEN the system SHALL render clickable links for competitor URLs

### Requirement 2

**User Story:** As a user reviewing analysis results, I want to export the structured data as markdown, so that I can easily share or document the findings in external tools.

#### Acceptance Criteria

1. WHEN viewing a structured report THEN the system SHALL display a "Copy Markdown" button
2. WHEN a user clicks "Copy Markdown" THEN the system SHALL format the structured data as markdown and copy it to the clipboard
3. WHEN formatting markdown THEN the system SHALL include all 5 sections with proper heading hierarchy
4. WHEN formatting competitor data THEN the system SHALL include URLs as markdown links where available
5. WHEN formatting SWOT analysis THEN the system SHALL organize strengths, weaknesses, opportunities, and threats as separate bullet lists

### Requirement 3

**User Story:** As a user conducting business analysis, I want to download the raw structured data as JSON, so that I can perform further analysis or integrate the data with other tools.

#### Acceptance Criteria

1. WHEN viewing a structured report THEN the system SHALL display a "Download JSON" button
2. WHEN a user clicks "Download JSON" THEN the system SHALL generate a JSON file containing the complete structured analysis data
3. WHEN generating the JSON file THEN the system SHALL use a filename format of "analysis-{slugified-url}.json"
4. WHEN creating the filename THEN the system SHALL convert the URL to a safe filename by replacing non-alphanumeric characters with hyphens
5. WHEN downloading THEN the browser SHALL automatically save the file to the user's default download location

### Requirement 4

**User Story:** As a user viewing analysis results, I want the structured report to integrate seamlessly with the existing dashboard, so that I can access enhanced formatting without disrupting my current workflow.

#### Acceptance Criteria

1. WHEN an analysis has structured data THEN the system SHALL render the StructuredReport component instead of plain summary text
2. WHEN an analysis lacks structured data THEN the system SHALL continue displaying the original summary format
3. WHEN integrating the component THEN the system SHALL maintain existing styling and layout consistency
4. WHEN displaying the component THEN the system SHALL use the same spacing and visual hierarchy as other dashboard elements
5. WHEN the component is rendered THEN it SHALL not require any additional dependencies beyond existing Tailwind CSS classes

### Requirement 5

**User Story:** As a developer maintaining the codebase, I want the StructuredReport component to be type-safe and well-structured, so that it's maintainable and extensible for future enhancements.

#### Acceptance Criteria

1. WHEN implementing the component THEN the system SHALL use TypeScript with proper type definitions
2. WHEN handling structured data THEN the system SHALL gracefully handle missing or undefined properties
3. WHEN rendering lists THEN the system SHALL safely iterate over arrays with proper null checks
4. WHEN the component receives invalid data THEN it SHALL return null without throwing errors
5. WHEN extending the Analysis interface THEN the system SHALL include an optional structured field for type safety