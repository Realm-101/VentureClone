# Task 8 Component Hierarchy and Data Flow

## Component Architecture

```
TechnologyStack (Parent - Task 9)
│
├── ClonabilityScoreCard
│   ├── Props: { score: ClonabilityScore }
│   ├── Displays: Overall score, rating, breakdown, recommendation
│   └── Features: Tooltips, progress bars, confidence indicator
│
├── RecommendationsSection
│   ├── Props: { recommendations: Recommendation[] }
│   ├── Displays: Grouped recommendations by type
│   └── Features: Expandable cards, impact badges, actionable indicators
│
├── EstimatesCard
│   ├── Props: { estimates: TimeAndCostEstimates }
│   ├── Displays: Time, one-time cost, monthly cost
│   └── Features: Progress bars, averages, first year total
│
├── ComplexityBreakdown
│   ├── Props: { breakdown: EnhancedComplexityResult }
│   ├── Displays: Overall score, component breakdown, factors
│   └── Features: Expandable sections, related technologies
│
├── BuildVsBuySection
│   ├── Props: { recommendations: BuildVsBuyRecommendation[] }
│   ├── Displays: SaaS alternatives, pros/cons, savings
│   └── Features: External links, recommendation badges
│
└── SkillRequirementsSection
    ├── Props: { skills: SkillRequirement[] }
    ├── Displays: Grouped skills, proficiency, learning resources
    └── Features: Expandable skills, resource links, priority indicators
```

## Data Flow

```
Backend Services (Task 1-7)
    ↓
TechnologyInsightsService.generateInsights()
    ↓
Returns: {
    alternatives: Map<string, TechnologyAlternative[]>
    buildVsBuy: BuildVsBuyRecommendation[]
    skills: SkillRequirement[]
    estimates: TimeAndCostEstimates
    recommendations: Recommendation[]
}
    ↓
ClonabilityScoreService.calculateClonability()
    ↓
Returns: ClonabilityScore
    ↓
EnhancedComplexityCalculator.calculate()
    ↓
Returns: EnhancedComplexityResult
    ↓
Stored in Database (businessAnalyses table)
    ↓
Retrieved by Frontend
    ↓
Passed to TechnologyStack Component
    ↓
Distributed to Individual Components
```

## Component Interaction Flow

### 1. Initial Render
```
User views analysis → TechnologyStack receives data → Renders all 6 components
```

### 2. User Interactions
```
Click recommendation → Expands to show details
Click skill → Shows related technologies and learning resources
Click complexity section → Shows related technologies
Hover tooltip → Shows additional context
Click external link → Opens SaaS provider website
```

### 3. Responsive Behavior
```
Desktop: 2-column grid layouts, side-by-side comparisons
Tablet: Adjusted grid, maintained readability
Mobile: Single column, stacked layout, touch-friendly
```

## Component Sizing

### ClonabilityScoreCard
- Height: ~500px (fixed)
- Width: Full container
- Prominence: Highest (shown first)

### RecommendationsSection
- Height: Variable (based on recommendations count)
- Width: Full container
- Prominence: High (shown second)

### EstimatesCard
- Height: ~600px (fixed)
- Width: Full container
- Prominence: High (shown third)

### ComplexityBreakdown
- Height: Variable (expandable sections)
- Width: Full container
- Prominence: Medium

### BuildVsBuySection
- Height: Variable (based on recommendations)
- Width: Full container
- Prominence: Medium

### SkillRequirementsSection
- Height: Variable (expandable skills)
- Width: Full container
- Prominence: Medium

## State Management

### Local State (per component)
- `expandedIndex` - Tracks which item is expanded
- `expandedSection` - Tracks which section is open
- `expandedSkill` - Tracks which skill is expanded

### No Global State Required
- All components are stateless except for UI interactions
- Data flows down from parent via props
- No cross-component communication needed

## Performance Considerations

### Optimization Strategies
1. **Lazy Rendering:** Expandable sections only render when opened
2. **Memoization:** Could add React.memo for expensive renders
3. **Virtual Scrolling:** Not needed (reasonable item counts)
4. **Code Splitting:** Components can be lazy-loaded if needed

### Bundle Size
- Each component: ~8-12KB (minified)
- Total: ~60KB for all 6 components
- Dependencies: shadcn/ui components (already in bundle)

## Accessibility Features

### Keyboard Navigation
- Tab through interactive elements
- Enter/Space to expand/collapse
- Escape to close expanded sections

### Screen Readers
- Proper heading hierarchy (h3 → h4 → h5 → h6)
- ARIA labels on interactive elements
- Descriptive button text
- Alt text for icons (via lucide-react)

### Color Contrast
- All text meets WCAG AA standards
- Color is not the only indicator (icons + text)
- High contrast mode compatible

## Testing Strategy (for future Task 9.1)

### Unit Tests
- Component renders with valid props
- Handles missing/undefined data
- Expand/collapse functionality
- Color coding based on values
- Tooltip content

### Integration Tests
- Data flow from parent to children
- User interactions (click, hover)
- Responsive behavior
- External link navigation

### Visual Regression Tests
- Screenshot comparisons
- Different data scenarios
- Mobile/tablet/desktop views

## Usage Example

```tsx
import { ClonabilityScoreCard } from '@/components/clonability-score-card';
import { RecommendationsSection } from '@/components/recommendations-section';
import { EstimatesCard } from '@/components/estimates-card';
import { ComplexityBreakdown } from '@/components/complexity-breakdown';
import { BuildVsBuySection } from '@/components/build-vs-buy-section';
import { SkillRequirementsSection } from '@/components/skill-requirements-section';

function TechnologyStack({ insights, clonabilityScore, enhancedComplexity }) {
  return (
    <div className="space-y-6">
      {clonabilityScore && (
        <ClonabilityScoreCard score={clonabilityScore} />
      )}
      
      {insights?.recommendations && (
        <RecommendationsSection recommendations={insights.recommendations} />
      )}
      
      {insights?.estimates && (
        <EstimatesCard estimates={insights.estimates} />
      )}
      
      {enhancedComplexity && (
        <ComplexityBreakdown breakdown={enhancedComplexity} />
      )}
      
      {insights?.buildVsBuy && (
        <BuildVsBuySection recommendations={insights.buildVsBuy} />
      )}
      
      {insights?.skills && (
        <SkillRequirementsSection skills={insights.skills} />
      )}
    </div>
  );
}
```

## Design Tokens Used

### Colors
- `vc-dark` - Dark background
- `vc-card` - Card background
- `vc-border` - Border color
- `vc-text` - Primary text
- `vc-text-muted` - Secondary text
- `vc-primary` - Primary accent
- `vc-accent` - Secondary accent

### Spacing
- `space-y-6` - Vertical spacing between components
- `p-6` - Card padding
- `gap-3` - Element spacing

### Typography
- `text-lg` - Large headings
- `text-sm` - Body text
- `text-xs` - Small text
- `font-semibold` - Headings
- `font-medium` - Emphasis

## Future Enhancements

### Potential Improvements
1. **Animation:** Smooth transitions for expand/collapse
2. **Charts:** Visual charts for complexity breakdown
3. **Comparison:** Side-by-side comparison mode
4. **Export:** Export insights as PDF/image
5. **Sharing:** Share specific recommendations
6. **Filtering:** Filter recommendations by type/impact
7. **Sorting:** Sort skills by priority/proficiency
8. **Search:** Search within recommendations/skills
