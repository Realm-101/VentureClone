# Design Document

## Overview

This design implements the complete 6-stage workflow system for VentureClone AI. The system will generate AI-powered, business-specific content for each workflow stage, manage stage progression, and persist all data properly.

**Key Design Principles:**
1. **Incremental Generation** - Stages are generated on-demand, not all at once
2. **Stateful Progression** - Each stage builds on previous stage data
3. **Flexible AI Prompts** - Stage-specific prompts that reference business analysis
4. **Robust Error Handling** - Graceful degradation and clear error messages
5. **Data Persistence** - All stage data saved to analysis record

## Architecture

### High-Level Flow

```
User Request → API Endpoint → Stage Service → AI Provider → Validation → Storage → Response
```

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ WorkflowTabs │  │ StageContent │  │ ProgressBar  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│  POST /api/business-analyses/:id/stages/:stageNumber        │
│  GET  /api/business-analyses/:id/stages                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Workflow Service                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  generateStageContent(analysisId, stageNumber)       │  │
│  │  validateStageProgression(analysisId, stageNumber)   │  │
│  │  getStagePrompt(stageNumber, analysisData)           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   AI Provider Service                        │
│  generateStructuredContent(prompt, schema)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Storage Layer                           │
│  updateAnalysisStageData(analysisId, stageNumber, data)     │
│  getAnalysisStages(analysisId)                               │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Workflow Service (`server/services/workflow.ts`)

**Purpose**: Orchestrates stage generation and progression logic

```typescript
interface WorkflowService {
  // Generate content for a specific stage
  generateStageContent(
    analysisId: string,
    stageNumber: number,
    userId: string
  ): Promise<StageContent>;
  
  // Validate if user can progress to this stage
  validateStageProgression(
    analysisId: string,
    stageNumber: number,
    userId: string
  ): Promise<boolean>;
  
  // Get all stages for an analysis
  getStages(analysisId: string, userId: string): Promise<StageData[]>;
}
```

### 2. Stage Prompt Generator

**Purpose**: Creates stage-specific AI prompts based on analysis data

```typescript
interface StagePromptGenerator {
  getStagePrompt(
    stageNumber: number,
    analysis: AnalysisRecord
  ): { prompt: string; systemPrompt: string; schema: any };
}
```

**Stage-Specific Prompts:**

- **Stage 2 (Lazy-Entrepreneur Filter)**: Analyzes effort vs. reward, automation potential
- **Stage 3 (MVP Launch)**: Identifies core features, tech stack, timeline
- **Stage 4 (Demand Testing)**: Recommends testing strategies, metrics, budget
- **Stage 5 (Scaling)**: Plans growth channels, resource scaling, milestones
- **Stage 6 (AI Automation)**: Maps automation opportunities, tools, ROI

### 3. Stage Data Schema

```typescript
interface StageData {
  stageNumber: number;
  stageName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  content: StageContent;
  generatedAt: string;
  completedAt?: string;
}

// Stage 2: Lazy-Entrepreneur Filter
interface Stage2Content {
  effortScore: number; // 1-10, lower is better
  rewardScore: number; // 1-10, higher is better
  recommendation: 'go' | 'no-go' | 'maybe';
  reasoning: string;
  automationPotential: {
    score: number; // 0-1
    opportunities: string[];
  };
  resourceRequirements: {
    time: string;
    money: string;
    skills: string[];
  };
  nextSteps: string[];
}

// Stage 3: MVP Launch Planning
interface Stage3Content {
  coreFeatures: string[];
  niceToHaves: string[];
  techStack: {
    frontend: string[];
    backend: string[];
    infrastructure: string[];
  };
  timeline: {
    phase: string;
    duration: string;
    deliverables: string[];
  }[];
  estimatedCost: string;
}

// Stage 4: Demand Testing Strategy
interface Stage4Content {
  testingMethods: {
    method: string;
    description: string;
    cost: string;
    timeline: string;
  }[];
  successMetrics: {
    metric: string;
    target: string;
    measurement: string;
  }[];
  budget: {
    total: string;
    breakdown: { item: string; cost: string }[];
  };
  timeline: string;
}

// Stage 5: Scaling & Growth
interface Stage5Content {
  growthChannels: {
    channel: string;
    strategy: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  milestones: {
    milestone: string;
    timeline: string;
    metrics: string[];
  }[];
  resourceScaling: {
    phase: string;
    team: string[];
    infrastructure: string;
  }[];
}

// Stage 6: AI Automation Mapping
interface Stage6Content {
  automationOpportunities: {
    process: string;
    tool: string;
    roi: string;
    priority: number;
  }[];
  implementationPlan: {
    phase: string;
    automations: string[];
    timeline: string;
  }[];
  estimatedSavings: string;
}
```

### 4. Storage Updates

**Add to `AnalysisRecord`:**

```typescript
interface AnalysisRecord {
  // ... existing fields ...
  stages?: {
    [key: number]: StageData;
  };
  currentStage?: number;
  completedStages?: number[];
}
```

## Data Models

### Stage Progression State Machine

```
Stage 1 (Analysis) → Stage 2 (Filter) → Stage 3 (MVP) → 
Stage 4 (Testing) → Stage 5 (Scaling) → Stage 6 (Automation)

Rules:
- Must complete Stage N before accessing Stage N+1
- Can regenerate any completed stage
- Stage 1 is auto-completed after analysis
```

### Storage Schema

```typescript
// In minimal-storage.ts
interface AnalysisRecord {
  id: string;
  userId: string;
  url: string;
  summary: string;
  model: string;
  createdAt: string;
  structured?: StructuredAnalysis;
  
  // Workflow fields
  stages?: {
    1?: StageData; // Analysis (auto-completed)
    2?: StageData; // Lazy-Entrepreneur Filter
    3?: StageData; // MVP Launch
    4?: StageData; // Demand Testing
    5?: StageData; // Scaling
    6?: StageData; // AI Automation
  };
  currentStage: number; // 1-6
  completedStages: number[]; // [1, 2, 3]
  
  // Legacy fields
  overallScore?: number;
  scoreDetails?: any;
  aiInsights?: any;
  businessModel?: string;
  revenueStream?: string;
  targetMarket?: string;
}
```

## Error Handling

### Error Types

1. **Validation Errors** (400)
   - Invalid stage number
   - Missing required data
   - Stage progression violation

2. **Not Found Errors** (404)
   - Analysis doesn't exist
   - User doesn't have access

3. **AI Provider Errors** (502)
   - API timeout
   - Invalid response
   - Rate limiting

4. **Server Errors** (500)
   - Storage failure
   - Unexpected errors

### Error Response Format

```typescript
{
  error: string;
  code: string;
  requestId: string;
  details?: string;
  retryable?: boolean;
}
```

## Testing Strategy

### Unit Tests

1. **Stage Prompt Generation**
   - Test each stage prompt with sample data
   - Verify prompt includes business-specific details
   - Validate schema structure

2. **Stage Progression Logic**
   - Test sequential progression
   - Test skip-ahead prevention
   - Test regeneration

3. **Data Persistence**
   - Test stage data storage
   - Test retrieval
   - Test updates

### Integration Tests

1. **End-to-End Stage Generation**
   - Create analysis
   - Generate each stage sequentially
   - Verify data persistence
   - Verify UI updates

2. **Error Scenarios**
   - AI provider failures
   - Invalid inputs
   - Storage failures

### Manual Testing Checklist

- [ ] Generate Stage 2 for existing analysis
- [ ] Verify Stage 2 content is business-specific
- [ ] Try to skip to Stage 4 (should fail)
- [ ] Complete stages 2-6 sequentially
- [ ] Regenerate Stage 3
- [ ] Verify all data persists after refresh
- [ ] Test with different AI providers

## API Endpoints

### POST /api/business-analyses/:id/stages/:stageNumber

**Purpose**: Generate content for a specific workflow stage

**Request:**
```typescript
{
  regenerate?: boolean; // Force regeneration if already exists
}
```

**Response:**
```typescript
{
  stageNumber: number;
  stageName: string;
  content: StageContent;
  generatedAt: string;
  nextStage?: number;
}
```

**Errors:**
- 400: Invalid stage number or progression violation
- 404: Analysis not found
- 429: Rate limit exceeded
- 502: AI provider error

### GET /api/business-analyses/:id/stages

**Purpose**: Get all stage data for an analysis

**Response:**
```typescript
{
  analysisId: string;
  currentStage: number;
  completedStages: number[];
  stages: {
    [key: number]: StageData;
  };
}
```

## Implementation Notes

### AI Prompt Design

Each stage prompt should:
1. Reference the business analysis data
2. Include specific instructions for that stage
3. Request structured JSON output
4. Provide examples of good output
5. Emphasize actionable recommendations

### Performance Considerations

1. **Caching**: Cache stage prompts (they don't change)
2. **Timeouts**: 30-second timeout for AI generation
3. **Concurrent Requests**: Limit to 1 stage generation per analysis at a time
4. **Rate Limiting**: Apply existing rate limits

### Security Considerations

1. **Authorization**: Verify user owns the analysis
2. **Input Validation**: Validate stage numbers (1-6)
3. **Rate Limiting**: Prevent abuse
4. **Error Messages**: Don't leak sensitive information

## Migration Strategy

### Phase 1: Backend Implementation
1. Create workflow service
2. Add stage generation endpoints
3. Update storage schema
4. Add tests

### Phase 2: Frontend Integration
1. Update WorkflowTabs component
2. Add stage content display
3. Add progress tracking
4. Handle errors gracefully

### Phase 3: Testing & Refinement
1. Test with real analyses
2. Refine AI prompts
3. Improve error messages
4. Optimize performance

## Success Metrics

1. **Functionality**: All 6 stages generate successfully
2. **Quality**: Stage content is specific and actionable
3. **Performance**: Stage generation completes in < 30 seconds
4. **Reliability**: < 5% error rate
5. **User Experience**: Clear progress indication and error messages
