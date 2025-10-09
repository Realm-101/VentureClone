# Design Document

## Overview

This design integrates Wappalyzer technology detection into VentureClone's Stage 1 analysis workflow. The integration uses a hybrid approach where Wappalyzer provides accurate technical fingerprinting while AI providers continue to deliver business insights. Results from both sources are merged to create comprehensive analysis data that leverages the strengths of each approach.

The design prioritizes simplicity by implementing Wappalyzer as a native TypeScript service rather than a separate microservice, reducing deployment complexity while maintaining performance through parallel execution.

## Architecture

### High-Level Architecture


```
┌─────────────────────────────────────────────────┐
│           VentureClone Frontend                 │
│         (React + TypeScript + Vite)             │
└────────────────┬────────────────────────────────┘
                 │ POST /api/analyze
                 ▼
┌─────────────────────────────────────────────────┐
│        VentureClone Backend (Express)           │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │   Stage 1: Discovery & Analysis          │  │
│  │   (server/services/workflow.ts)          │  │
│  │                                           │  │
│  │   ┌─────────────┐    ┌────────────────┐ │  │
│  │   │ Wappalyzer  │    │  AI Providers  │ │  │
│  │   │  Service    │    │  Service       │ │  │
│  │   │ (NEW)       │    │  (Existing)    │ │  │
│  │   └──────┬──────┘    └────────┬───────┘ │  │
│  │          │                    │          │  │
│  │          │  Promise.all()     │          │  │
│  │          └────────┬───────────┘          │  │
│  │                   ▼                      │  │
│  │          ┌────────────────┐              │  │
│  │          │ Result Merger  │              │  │
│  │          │   (NEW)        │              │  │
│  │          └────────┬───────┘              │  │
│  └───────────────────┼──────────────────────┘  │
│                      ▼                          │
│            ┌──────────────────┐                 │
│            │ PostgreSQL DB    │                 │
│            │ (Drizzle ORM)    │                 │
│            └──────────────────┘                 │
└─────────────────────────────────────────────────┘
```

### Component Interaction Flow

1. **User submits URL** → Frontend sends POST to /api/analyze
2. **Stage 1 begins** → Workflow service initiates parallel execution
3. **Parallel execution**:
   - Wappalyzer service fetches and analyzes URL
   - AI provider service generates business analysis
4. **Result merging** → Combine tech detection + AI insights
5. **Data storage** → Save merged results to PostgreSQL
6. **Response** → Return comprehensive analysis to frontend


## Components and Interfaces

### 1. Technology Detection Service (NEW)

**File**: `server/services/tech-detection.ts`

**Purpose**: Wrapper service for Wappalyzer library providing technology detection capabilities.

**Interface**:
```typescript
interface DetectedTechnology {
  name: string;
  categories: string[];
  confidence: number;
  version?: string;
  website?: string;
  icon?: string;
}

interface TechDetectionResult {
  technologies: DetectedTechnology[];
  contentType: string;
  detectedAt: string;
  success: boolean;
  error?: string;
}

class TechDetectionService {
  async detectTechnologies(url: string): Promise<TechDetectionResult | null>
  private handleDetectionError(error: Error, url: string): void
}
```

**Dependencies**:
- `simple-wappalyzer` (npm package)
- Node.js fetch API
- Logger service

**Error Handling**:
- Network errors → Return null, log error
- Timeout (>15s) → Return null, log warning
- Invalid URL → Return null, log validation error
- Wappalyzer errors → Return null, log technical error

### 2. Result Merger (NEW)

**File**: `server/services/workflow.ts` (enhanced)

**Purpose**: Combines Wappalyzer detection results with AI analysis.

**Interface**:
```typescript
interface MergedAnalysisResult {
  // Existing AI fields
  overview: { ... };
  market: { ... };
  synthesis: { ... };
  
  // Enhanced technical section
  technical: {
    // AI-inferred (existing)
    techStack: string[];
    confidence: number;
    
    // Wappalyzer-detected (new)
    actualDetected?: {
      technologies: DetectedTechnology[];
      contentType: string;
      detectedAt: string;
    };
    
    // Merged/enriched
    detectedTechStack: string[];
    complexityScore: number;
    complexityFactors: {
      customCode: boolean;
      frameworkComplexity: 'low' | 'medium' | 'high';
      infrastructureComplexity: 'low' | 'medium' | 'high';
    };
  };
}

function mergeAnalysisResults(
  aiResult: any,
  techResult: TechDetectionResult | null
): MergedAnalysisResult
```

### 3. Complexity Calculator (NEW)

**File**: `server/services/complexity-calculator.ts`

**Purpose**: Calculates technical complexity score based on detected technologies.

**Algorithm**:
```typescript
function calculateComplexity(technologies: DetectedTechnology[]): {
  score: number; // 1-10
  factors: ComplexityFactors;
} {
  let score = 5; // Base score
  
  // No-code platforms: -3 points
  if (hasNoCodePlatform(technologies)) score -= 3;
  
  // Modern frameworks: +1 point
  if (hasModernFramework(technologies)) score += 1;
  
  // Complex backend: +2 points
  if (hasComplexBackend(technologies)) score += 2;
  
  // Microservices/containers: +2 points
  if (hasMicroservices(technologies)) score += 2;
  
  // Custom infrastructure: +1 point
  if (hasCustomInfra(technologies)) score += 1;
  
  return { score: Math.max(1, Math.min(10, score)), factors };
}
```

**Technology Categories**:
- **No-code** (1-3): Webflow, Wix, Squarespace, Shopify
- **Low complexity** (3-5): WordPress, simple static sites
- **Medium complexity** (5-7): React, Vue, Next.js, standard backends
- **High complexity** (7-10): Kubernetes, microservices, custom systems


## Data Models

### Database Schema Changes

**Table**: `businessAnalyses`

**New Fields** (added to existing JSONB columns):

```typescript
// In technical JSONB field
technical: {
  // Existing fields (preserved)
  techStack?: string[];
  confidence?: number;
  uiColors?: string[];
  keyPages?: string[];
  
  // NEW: Wappalyzer detection results
  actualDetected?: {
    technologies: Array<{
      name: string;
      categories: string[];
      confidence: number;
      version?: string;
      website?: string;
      icon?: string;
    }>;
    contentType: string;
    detectedAt: string; // ISO timestamp
  };
  
  // NEW: Complexity analysis
  complexityScore?: number; // 1-10
  complexityFactors?: {
    customCode: boolean;
    frameworkComplexity: 'low' | 'medium' | 'high';
    infrastructureComplexity: 'low' | 'medium' | 'high';
  };
  
  // NEW: Merged tech stack
  detectedTechStack?: string[]; // Combined AI + Wappalyzer
}
```

**Migration Strategy**:
- No schema migration required (using JSONB)
- Backward compatible with existing data
- New fields are optional
- Existing analyses continue to work

### Zod Schema Updates

**File**: `shared/schema.ts`

```typescript
// Enhanced technical schema
export const enhancedTechnicalSchema = z.object({
  // Existing fields
  techStack: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).optional(),
  uiColors: z.array(z.string()).optional(),
  keyPages: z.array(z.string()).optional(),
  
  // New fields
  actualDetected: z.object({
    technologies: z.array(z.object({
      name: z.string(),
      categories: z.array(z.string()),
      confidence: z.number(),
      version: z.string().optional(),
      website: z.string().optional(),
      icon: z.string().optional(),
    })),
    contentType: z.string(),
    detectedAt: z.string(),
  }).optional(),
  
  complexityScore: z.number().min(1).max(10).optional(),
  complexityFactors: z.object({
    customCode: z.boolean(),
    frameworkComplexity: z.enum(['low', 'medium', 'high']),
    infrastructureComplexity: z.enum(['low', 'medium', 'high']),
  }).optional(),
  
  detectedTechStack: z.array(z.string()).optional(),
});
```


## Error Handling

### Error Scenarios and Responses

| Scenario | Detection | Handling | User Impact |
|----------|-----------|----------|-------------|
| Network timeout | Wappalyzer request >15s | Log warning, return null | AI-only analysis |
| Invalid URL | URL validation fails | Log error, return null | AI-only analysis |
| Wappalyzer error | Library throws exception | Log error, return null | AI-only analysis |
| AI timeout | AI request >15s | Existing timeout handling | Show timeout error |
| Both fail | Both services error | Log critical error | Show error message |
| Partial success | One service succeeds | Use successful result | Partial analysis |

### Fallback Strategy

```typescript
async function analyzeWithFallback(url: string) {
  const [techResult, aiResult] = await Promise.allSettled([
    detectTechnologies(url),
    generateAIAnalysis(url)
  ]);
  
  // Both succeeded
  if (techResult.status === 'fulfilled' && aiResult.status === 'fulfilled') {
    return mergeResults(aiResult.value, techResult.value);
  }
  
  // Only AI succeeded
  if (aiResult.status === 'fulfilled') {
    logger.warn('Tech detection failed, using AI-only analysis');
    return aiResult.value;
  }
  
  // Only tech detection succeeded (rare)
  if (techResult.status === 'fulfilled') {
    logger.warn('AI analysis failed, using tech detection only');
    return createMinimalAnalysis(techResult.value);
  }
  
  // Both failed
  throw new Error('Analysis failed: both services unavailable');
}
```

### Logging Strategy

**Log Levels**:
- **INFO**: Successful detection, execution times
- **WARN**: Fallback to AI-only, slow detection (>10s)
- **ERROR**: Network errors, validation failures
- **CRITICAL**: Both services failed

**Log Fields**:
```typescript
{
  requestId: string;
  url: string;
  service: 'tech-detection' | 'ai-analysis';
  duration: number; // milliseconds
  success: boolean;
  technologiesDetected?: number;
  error?: string;
  timestamp: string;
}
```


## Testing Strategy

### Unit Tests

**Tech Detection Service**:
- ✓ Successful detection with valid URL
- ✓ Timeout handling (>15s)
- ✓ Network error handling
- ✓ Invalid URL handling
- ✓ Empty response handling

**Complexity Calculator**:
- ✓ No-code platform detection (score 1-3)
- ✓ Modern framework detection (score 4-6)
- ✓ Complex infrastructure detection (score 7-10)
- ✓ Edge cases (no technologies, unknown technologies)

**Result Merger**:
- ✓ Merge with both results present
- ✓ Merge with only AI result
- ✓ Merge with only tech result
- ✓ Handle missing fields gracefully

### Integration Tests

**End-to-End Workflow**:
- ✓ Complete Stage 1 analysis with tech detection
- ✓ Fallback to AI-only when detection fails
- ✓ Data persistence in database
- ✓ Subsequent stage access to tech data

**Performance Tests**:
- ✓ Parallel execution completes within expected time
- ✓ No significant slowdown vs AI-only
- ✓ Memory usage remains acceptable

### Test Data

**Mock URLs**:
- Simple static site (low complexity)
- React/Next.js app (medium complexity)
- Complex SaaS platform (high complexity)
- No-code platform (Webflow/Shopify)
- Invalid/unreachable URL


## Testing Strategy

### Unit Tests

**Tech Detection Service**:
- Test successful detection with mock Wappalyzer responses
- Test timeout handling (>15s)
- Test network error handling
- Test invalid URL handling
- Test empty/null responses

**Complexity Calculator**:
- Test no-code platform detection (score 1-3)
- Test modern framework detection (score 4-6)
- Test complex infrastructure detection (score 7-10)
- Test edge cases (no technologies, unknown technologies)

**Result Merger**:
- Test merging with both results present
- Test merging with only AI results
- Test merging with only tech detection results
- Test field preservation and enrichment

### Integration Tests

**Stage 1 Workflow**:
- Test parallel execution of both services
- Test fallback when tech detection fails
- Test fallback when AI fails
- Test complete failure scenario
- Test data persistence to database

**End-to-End**:
- Test full analysis flow from URL submission to result display
- Test with various website types (WordPress, React, Shopify, etc.)
- Test performance (total time should not increase >10%)

### Test Data

**Mock URLs**:
- Simple static site (low complexity)
- WordPress site (medium complexity)
- React SPA (medium-high complexity)
- Complex enterprise site (high complexity)


## Performance Considerations

### Execution Time

**Target**: Total Stage 1 analysis time should not increase by more than 10%

**Current baseline**: ~8-12 seconds (AI analysis only)
**Target with tech detection**: ~8-13 seconds

**Optimization strategies**:
- Parallel execution (Promise.all)
- Wappalyzer timeout: 15 seconds
- Connection pooling for HTTP requests
- Minimal data processing overhead

### Memory Usage

**Wappalyzer overhead**: ~20-30MB additional memory
**Mitigation**:
- Reuse Wappalyzer instance across requests
- Clear large response bodies after processing
- Use streaming for large HTML responses

### Caching Strategy (Future Enhancement)

**Cache tech detection results**:
- Key: URL hash
- TTL: 24 hours
- Storage: Redis or in-memory cache
- Invalidation: Manual or time-based

## Security Considerations

### Input Validation

- Validate URL format before processing
- Sanitize URLs to prevent SSRF attacks
- Limit URL length (max 2048 characters)
- Block internal/private IP ranges
- Enforce HTTPS for production

### Rate Limiting

- Existing rate limiting applies
- No additional rate limits needed for tech detection
- Monitor for abuse patterns

### Data Privacy

- Do not store sensitive data from analyzed sites
- Log only necessary information (URL, tech stack)
- Comply with GDPR for EU users
- Allow users to delete their analysis history


## UI/UX Design

### Stage 1 Results Display

**Technology Stack Section** (Enhanced):

```
┌─────────────────────────────────────────────────┐
│ 🔧 Technology Stack                             │
├─────────────────────────────────────────────────┤
│                                                  │
│ Complexity Score: ████████░░ 8/10 (High)        │
│                                                  │
│ Detected Technologies (12):                     │
│                                                  │
│ 📦 Frontend Frameworks                          │
│   • React 18.2.0 (100% confidence)              │
│   • Next.js 13.4.1 (95% confidence)             │
│                                                  │
│ ⚙️ Backend & Infrastructure                     │
│   • Node.js (90% confidence)                    │
│   • Vercel (100% confidence)                    │
│                                                  │
│ 📊 Analytics & Marketing                        │
│   • Google Analytics (100% confidence)          │
│   • Segment (85% confidence)                    │
│                                                  │
│ [View All Technologies →]                       │
│                                                  │
│ AI Inferred: React, TypeScript, PostgreSQL      │
│ ℹ️ Detected technologies are based on actual    │
│    technical fingerprinting                     │
└─────────────────────────────────────────────────┘
```

**Complexity Indicator**:
- 1-3: Green (Easy to clone)
- 4-6: Yellow (Moderate effort)
- 7-10: Red (Complex, requires expertise)

### Technology Detail Modal

When user clicks on a technology:
```
┌─────────────────────────────────────────────────┐
│ React                                      [×]  │
├─────────────────────────────────────────────────┤
│ Version: 18.2.0                                 │
│ Category: JavaScript Frameworks                 │
│ Confidence: 100%                                │
│ Website: https://react.dev                      │
│                                                  │
│ Cloning Considerations:                         │
│ • Requires JavaScript/TypeScript knowledge      │
│ • Large ecosystem with many resources           │
│ • Can be replaced with Vue or Svelte            │
│                                                  │
│ [Learn More →]                                  │
└─────────────────────────────────────────────────┘
```


## Deployment Strategy

### Phase 1: Core Integration (Week 1)

1. Install simple-wappalyzer package
2. Create tech-detection service
3. Integrate into Stage 1 workflow
4. Update database schema (JSONB fields)
5. Deploy to staging environment
6. Run integration tests

### Phase 2: Enhancement (Week 2)

1. Implement complexity calculator
2. Update AI prompts with detected tech
3. Enhance UI components
4. Add comprehensive logging
5. Deploy to production with feature flag

### Phase 3: Optimization (Week 3)

1. Monitor performance metrics
2. Implement caching if needed
3. Fine-tune complexity algorithm
4. Gather user feedback
5. Iterate on UI/UX

### Rollback Plan

**If issues occur**:
1. Disable tech detection via feature flag
2. Fall back to AI-only analysis
3. Investigate and fix issues
4. Re-enable after validation

**Feature Flag**:
```typescript
const ENABLE_TECH_DETECTION = process.env.ENABLE_TECH_DETECTION === 'true';

if (ENABLE_TECH_DETECTION) {
  techResult = await detectTechnologies(url);
}
```

## Monitoring and Metrics

### Key Metrics

1. **Success Rate**: % of successful tech detections
2. **Execution Time**: Average time for tech detection
3. **Fallback Rate**: % of analyses using AI-only fallback
4. **Accuracy**: User feedback on tech stack accuracy
5. **Complexity Distribution**: Distribution of complexity scores

### Alerts

- Tech detection success rate <80%
- Average execution time >10 seconds
- Fallback rate >20%
- Error rate >5%

### Dashboards

**Tech Detection Dashboard**:
- Success/failure rates over time
- Average execution time
- Most detected technologies
- Complexity score distribution
- Error breakdown by type


## Dependencies

### New NPM Packages

```json
{
  "dependencies": {
    "simple-wappalyzer": "^1.1.81"
  }
}
```

**Alternative options** (if simple-wappalyzer has issues):
- `@ryntab/wappalyzer-node`: More actively maintained
- `wappalyzer-wrapper`: Enterprise-focused wrapper

### Existing Dependencies (No Changes)

- Express.js
- Drizzle ORM
- PostgreSQL
- OpenAI/Gemini/Grok SDKs
- React + Vite

## Future Enhancements

### Phase 4: Advanced Features (Future)

1. **Technology Comparison**:
   - Compare tech stacks across multiple analyses
   - Find businesses using similar technologies
   - Trend analysis (popular tech stacks)

2. **Cloning Guides**:
   - Generate tech-specific cloning instructions
   - Recommend alternative technologies
   - Estimate development time by tech stack

3. **Performance Analysis**:
   - Integrate Lighthouse scores
   - Analyze page load times
   - Identify performance bottlenecks

4. **Security Scanning**:
   - Detect outdated/vulnerable technologies
   - Identify security best practices
   - Flag potential security risks

5. **Cost Estimation**:
   - Estimate hosting costs by tech stack
   - Calculate development costs
   - Compare infrastructure options

## Conclusion

This design provides a robust, maintainable solution for integrating Wappalyzer technology detection into VentureClone. The hybrid approach leverages the strengths of both technical fingerprinting and AI analysis while maintaining backward compatibility and providing graceful fallback mechanisms.

Key benefits:
- ✅ Accurate technology detection
- ✅ Improved clonability scoring
- ✅ Better AI recommendations
- ✅ Minimal performance impact
- ✅ Graceful error handling
- ✅ Future-proof architecture

The design is ready for implementation following the task breakdown in tasks.md.
