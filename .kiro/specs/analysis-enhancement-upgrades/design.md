# Design Document

## Overview

This design implements three critical upgrades to the VentureClone AI analysis system: confidence scoring with source attribution, first-party data extraction, and actionable improvement suggestions. The design maintains backward compatibility while enhancing the accuracy and actionability of business analysis results.

## Architecture

### Enhanced Schema Design

The system will extend the existing `structuredAnalysisSchema` to include confidence scoring and source attribution:

```typescript
// Enhanced schema with confidence and sources
export const zSource = z.object({
  url: z.string().url(),
  excerpt: z.string().min(10).max(300)
});

export const enhancedStructuredAnalysisSchema = z.object({
  // Existing sections remain unchanged
  overview: z.object({
    valueProposition: z.string(),
    targetAudience: z.string(),
    monetization: z.string(),
  }),
  market: z.object({
    competitors: z.array(z.object({
      name: z.string(),
      url: z.string().optional(),
      notes: z.string().optional(),
    })),
    swot: z.object({
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      opportunities: z.array(z.string()),
      threats: z.array(z.string()),
    }),
  }),
  // Enhanced technical section with confidence
  technical: z.object({
    techStack: z.array(z.string()).optional(),
    confidence: z.number().min(0).max(1).optional(),
    uiColors: z.array(z.string()).optional(),
    keyPages: z.array(z.string()).optional(),
  }).optional(),
  // Enhanced data section with source attribution
  data: z.object({
    trafficEstimates: z.object({
      value: z.string(),
      source: z.string().url().optional(),
    }).optional(),
    keyMetrics: z.array(z.object({
      name: z.string(),
      value: z.string(),
      source: z.string().url().optional(),
      asOf: z.string().optional()
    })).optional(),
  }).optional(),
  synthesis: z.object({
    summary: z.string(),
    keyInsights: z.array(z.string()),
    nextActions: z.array(z.string()),
  }),
  // New sources section
  sources: z.array(zSource).default([])
});
```

### First-Party Data Extraction

A new service will extract content directly from target websites:

```typescript
// server/lib/fetchFirstParty.ts
export interface FirstPartyData {
  title: string;
  description: string;
  h1: string;
  textSnippet: string;
  url: string;
}

export async function fetchFirstParty(url: string): Promise<FirstPartyData | null> {
  // Implementation using cheerio for HTML parsing
  // Timeout after 10 seconds
  // Extract OG tags, title, H1, and body text snippet
}
```

### Business Improvement Service

A new service will generate actionable improvement suggestions:

```typescript
// server/services/business-improvement.ts
export interface BusinessImprovement {
  twists: string[];
  sevenDayPlan: {
    day: number;
    tasks: string[];
  }[];
}

export async function generateBusinessImprovement(
  analysis: StructuredAnalysis,
  goal?: string
): Promise<BusinessImprovement> {
  // Use AI to generate 3 improvement angles and 7-day plan
}
```

## Components and Interfaces

### Enhanced AI Provider Integration

The existing `AIProviderService` will be enhanced with new prompt templates:

1. **Evidence-Based Analysis Prompt**: Eliminates hedging language and requires source attribution
2. **First-Party Context Integration**: Incorporates extracted website content into analysis
3. **Improvement Generation Prompt**: Creates actionable business improvement strategies

### New API Endpoints

1. **Enhanced Analysis Endpoint**: `/api/business-analyses/analyze`
   - Integrates first-party data extraction
   - Uses enhanced prompts for confidence scoring
   - Stores source attribution data

2. **Business Improvement Endpoint**: `/api/business-analyses/:id/improve`
   - Generates improvement suggestions based on existing analysis
   - Returns structured improvement data with 7-day plan

### UI Components

1. **Confidence Badge Component**: Displays "Speculative" badge when technical confidence < 0.6
2. **Source Attribution Display**: Shows source URLs and excerpts for claims
3. **Improvement Panel Component**: Renders improvement suggestions and 7-day plan
4. **Copy Plan Button**: Allows users to copy the 7-day plan to clipboard

## Data Models

### Enhanced Analysis Record

```typescript
export interface EnhancedAnalysisRecord extends AnalysisRecord {
  structured?: EnhancedStructuredAnalysis;
  firstPartyData?: FirstPartyData;
  improvements?: BusinessImprovement;
}
```

### Source Attribution Model

```typescript
export interface Source {
  url: string;
  excerpt: string;
}
```

### Business Improvement Model

```typescript
export interface BusinessImprovement {
  twists: string[];
  sevenDayPlan: {
    day: number;
    tasks: string[];
  }[];
  generatedAt: string;
}
```

## Error Handling

### First-Party Data Extraction Errors

- **Timeout Handling**: 10-second timeout with graceful fallback
- **Network Errors**: Continue analysis with "SITE CONTEXT unavailable" message
- **Parsing Errors**: Log error and proceed with AI-only analysis

### AI Provider Enhancements

- **Confidence Validation**: Ensure confidence scores are between 0-1
- **Source Validation**: Validate source URLs and excerpt lengths
- **Fallback Handling**: Graceful degradation when structured analysis fails

### Improvement Generation Errors

- **Analysis Not Found**: Return 404 with clear error message
- **AI Generation Failure**: Return 500 with retry suggestion
- **Timeout Handling**: 30-second timeout for improvement generation

## Testing Strategy

### Unit Tests

1. **First-Party Data Extraction**
   - Test HTML parsing with various website structures
   - Test timeout handling and error scenarios
   - Test data extraction accuracy

2. **Enhanced Schema Validation**
   - Test confidence score validation
   - Test source attribution validation
   - Test backward compatibility with existing data

3. **Business Improvement Generation**
   - Test improvement suggestion quality
   - Test 7-day plan structure
   - Test error handling scenarios

### Integration Tests

1. **End-to-End Analysis Flow**
   - Test complete analysis with first-party data
   - Test fallback scenarios when first-party data fails
   - Test source attribution in final output

2. **API Endpoint Testing**
   - Test enhanced analysis endpoint with various URLs
   - Test improvement endpoint with different analysis types
   - Test error responses and status codes

### Performance Tests

1. **First-Party Data Extraction Performance**
   - Test extraction speed with various website sizes
   - Test timeout behavior under slow network conditions
   - Test concurrent extraction requests

2. **AI Provider Performance**
   - Test enhanced prompt performance
   - Test structured output generation speed
   - Test improvement generation performance

## Implementation Phases

### Phase 1: Schema and First-Party Data Extraction
- Implement enhanced schema with confidence and sources
- Create first-party data extraction service
- Update AI prompts to eliminate hedging language

### Phase 2: Enhanced Analysis Integration
- Integrate first-party data into analysis flow
- Implement confidence scoring and source attribution
- Add UI components for confidence badges and source display

### Phase 3: Business Improvement Feature
- Implement business improvement service
- Create improvement generation endpoint
- Add UI components for improvement suggestions and 7-day plans

### Phase 4: Testing and Optimization
- Comprehensive testing of all new features
- Performance optimization
- Error handling refinement

## Security Considerations

### First-Party Data Extraction
- Implement rate limiting for external requests
- Validate and sanitize extracted content
- Respect robots.txt and website policies

### Source Attribution
- Validate source URLs to prevent XSS
- Sanitize excerpts to prevent injection attacks
- Implement content length limits

### Business Improvement Data
- Validate improvement suggestions for appropriate content
- Implement user-specific access controls
- Sanitize plan data before storage

## Backward Compatibility

### Existing Analysis Records
- All existing analysis records will continue to work
- New fields are optional and won't break existing functionality
- UI gracefully handles missing enhanced data

### API Compatibility
- Existing API endpoints maintain same response structure
- New fields are added as optional properties
- Client applications can ignore new fields if not needed

### Database Migration
- Enhanced schema fields are optional
- Existing data remains unchanged
- New installations get full enhanced schema