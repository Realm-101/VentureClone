# Design Document

## Overview

The StructuredReport component is a React component that renders structured business analysis data in an organized, interactive format. It provides a clean, collapsible interface for displaying the 5 main sections of analysis data (Overview, Market, Technical, Data, Synthesis) while maintaining backward compatibility with existing summary-only displays. The component includes export functionality for both markdown and JSON formats.

## Architecture

### Component Structure

The StructuredReport component follows a modular design with the following hierarchy:

```
StructuredReport (main component)
├── Section (reusable collapsible section)
├── Export Actions (Copy Markdown + Download JSON buttons)
└── Utility Functions (copyMarkdown, downloadJson, slugify)
```

### Integration Points

- **Dashboard Integration**: The component integrates into the existing `MinimalDashboard` component within the `AnalysisListItem` component
- **Type System**: Extends the existing `AnalysisRecord` interface to include optional structured data
- **Styling**: Uses existing Tailwind CSS classes and maintains consistency with shadcn/ui design patterns
- **Data Flow**: Consumes structured data from the `StructuredAnalysis` type already defined in the shared schema

## Components and Interfaces

### StructuredReport Component

**Props Interface:**
```typescript
interface StructuredReportProps {
  data: StructuredAnalysis;
  url: string;
}
```

**Key Features:**
- Renders 5 distinct sections with structured data
- Handles missing or undefined data gracefully
- Provides export functionality
- Maintains consistent styling with existing components

### Section Component

**Props Interface:**
```typescript
interface SectionProps {
  title: string;
  children: React.ReactNode;
}
```

**Behavior:**
- Collapsible functionality with toggle state
- Default expanded state for all sections
- Clean header with click-to-toggle interaction
- Consistent border and padding styling

### Data Sections

1. **Overview & Business**
   - Value proposition
   - Target audience
   - Monetization strategy

2. **Market & Competitors**
   - Competitor list with clickable URLs
   - SWOT analysis in 2x2 grid layout
   - Graceful handling of empty competitor lists

3. **Technical & Website**
   - Technology stack display
   - UI color information
   - Key pages listing

4. **Data & Analytics**
   - Traffic estimates with source attribution
   - Key metrics with values and sources
   - Conditional rendering based on data availability

5. **Synthesis & Key Takeaways**
   - Executive summary
   - Key insights in bullet format
   - Next actions recommendations

## Data Models

### Extended AnalysisRecord Interface

```typescript
interface AnalysisRecord {
  id: string;
  userId: string;
  url: string;
  summary: string;
  model: string;
  createdAt: string;
  structured?: StructuredAnalysis; // New optional field
}
```

### StructuredAnalysis Type

The component consumes the existing `StructuredAnalysis` type from `@shared/schema`, which includes:

- `overview`: Business fundamentals (value prop, audience, monetization)
- `market`: Competitive landscape and SWOT analysis
- `technical`: Technology stack and UI details
- `data`: Analytics and key metrics
- `synthesis`: Summary insights and action items

## Error Handling

### Graceful Degradation

- **Missing Structured Data**: Falls back to plain summary display
- **Partial Data**: Renders available sections, hides missing ones
- **Invalid Data**: Component returns null without throwing errors
- **Empty Arrays**: Shows appropriate "No data" messages

### Null Safety

- All array iterations include proper null/undefined checks
- Optional chaining used throughout for nested object access
- Default empty arrays provided for missing list data
- Conditional rendering prevents errors from missing properties

## Testing Strategy

### Unit Tests

1. **Component Rendering**
   - Test rendering with complete structured data
   - Test rendering with partial data
   - Test fallback behavior with no structured data
   - Test null/undefined data handling

2. **Section Functionality**
   - Test collapsible section toggle behavior
   - Test default expanded state
   - Test section content rendering

3. **Export Functions**
   - Test markdown generation with various data scenarios
   - Test JSON download functionality
   - Test filename generation and slugification
   - Test clipboard API integration

### Integration Tests

1. **Dashboard Integration**
   - Test component integration within AnalysisListItem
   - Test conditional rendering logic
   - Test styling consistency

2. **Type Safety**
   - Test TypeScript compilation with extended interfaces
   - Test proper type inference for structured data

### Manual Testing

1. **User Experience**
   - Test collapsible sections interaction
   - Test export button functionality
   - Test responsive design on different screen sizes
   - Test accessibility with keyboard navigation

2. **Data Scenarios**
   - Test with real structured analysis data
   - Test with missing optional fields
   - Test with empty competitor lists
   - Test with various URL formats for filename generation

## Implementation Approach

### Phase 1: Core Component
1. Create StructuredReport component with basic section rendering
2. Implement Section component with collapsible functionality
3. Add proper TypeScript interfaces and null safety

### Phase 2: Export Functionality
1. Implement markdown generation utility
2. Add JSON download functionality
3. Create filename slugification utility

### Phase 3: Integration
1. Extend AnalysisRecord interface in client types
2. Integrate component into MinimalDashboard
3. Add conditional rendering logic

### Phase 4: Testing & Polish
1. Add comprehensive unit tests
2. Test integration scenarios
3. Verify styling consistency and responsiveness

## Dependencies

### Existing Dependencies
- React 18 (already in use)
- Tailwind CSS (for styling)
- Lucide React (for icons, if needed)
- TypeScript (for type safety)

### No New Dependencies
The component is designed to work with existing dependencies only, avoiding the need for additional packages like Radix UI Accordion or other collapsible libraries.

## Performance Considerations

- **Lazy Rendering**: Sections render content only when expanded (future enhancement)
- **Memoization**: Component can be wrapped with React.memo for performance
- **Bundle Size**: No additional dependencies keep bundle size minimal
- **DOM Updates**: Efficient toggle state management with minimal re-renders