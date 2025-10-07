---
inclusion: fileMatch
fileMatchPattern: '**/workflow*.{ts,tsx}|**/stage*.{ts,tsx}'
---

# Workflow System Guidelines

## 6-Stage Workflow Structure

The application implements a sequential 6-stage workflow for business analysis:

1. **Discovery & Selection** - Initial business analysis and clonability scoring
2. **Lazy-Entrepreneur Filter** - Effort vs. reward analysis
3. **MVP Launch Planning** - Core features and tech stack planning
4. **Demand Testing Strategy** - Market validation approach
5. **Scaling & Growth** - Growth channels and resource scaling
6. **AI Automation Mapping** - Automation opportunities

## Stage Progression Rules

- **Sequential Access**: Users must complete Stage N before accessing Stage N+1
- **Stage 1 Auto-Complete**: Stage 1 is automatically marked complete after initial analysis
- **Regeneration**: Any completed stage can be regenerated without affecting other stages
- **Navigation**: Users can view any completed stage without triggering regeneration

## Stage Status States

```typescript
type StageStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
```

- **pending**: Stage not yet started
- **in_progress**: Stage generation in progress
- **completed**: Stage successfully generated
- **failed**: Stage generation failed (can retry)

## Stage Data Structure

Each stage stores:
- `stageNumber`: 1-6
- `stageName`: Human-readable name
- `status`: Current status
- `content`: Stage-specific data (varies by stage)
- `generatedAt`: ISO timestamp of generation
- `completedAt`: ISO timestamp of completion (if completed)

## Navigation Best Practices

### After Stage Generation
- **DO**: Stay on current stage to show results
- **DO**: Display "Continue to Next Stage" button
- **DON'T**: Auto-navigate to next stage
- **DON'T**: Show errors when viewing completed stages

### Progress Tracking
- Update progress tracker immediately when stage status changes
- Show visual indicators for completed/current/pending stages
- Persist stage status to backend

## Export Functionality

### Per-Stage Export
- Every stage should have export capability
- Support formats: HTML, JSON, CSV, PDF
- Use consistent ExportDropdown component

### Complete Plan Export
- Available on Stage 6 after completion
- Combines all 6 stages into single document
- Professional formatting with cover page and TOC

## Scorecard Calculations

### Clonability Scorecard (Stage 1)
```typescript
const weights = {
  technicalSimplicity: 0.20,    // 20%
  marketOpportunity: 0.25,      // 25%
  competitiveLandscape: 0.15,   // 15%
  resourceRequirements: 0.20,   // 20%
  timeToMarket: 0.20,           // 20%
};

// Overall score = weighted sum of individual scores
overallScore = sum(score * weight) for each criterion
```

### Score Display Guidelines
- Use "Simplicity" not "Complexity" for clarity
- Higher scores = better/easier (green)
- Lower scores = worse/harder (red/yellow)
- Always show tooltips explaining what scores mean

## Error Handling

### Stage Generation Errors
- Retry with exponential backoff (3 attempts)
- Show user-friendly error messages
- Provide "Retry" button on failure
- Log detailed errors server-side

### Validation Errors
- Validate stage progression before generation
- Check for required previous stages
- Provide clear error messages about what's needed

## Performance Considerations

- Generate stages server-side (AI calls)
- Show loading indicators during generation
- Cache completed stage data
- Lazy-load export libraries (jsPDF, etc.)

## Testing Guidelines

When testing workflow components:
- Test sequential progression
- Test back navigation to completed stages
- Test regeneration without affecting other stages
- Test error recovery and retry
- Test progress tracker updates
- Test export functionality for each stage
