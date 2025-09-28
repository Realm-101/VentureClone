# Feature Flag System

This document explains how to use the feature flag system to control experimental features in the VentureClone AI application.

## Overview

The feature flag system allows you to:
- Enable/disable experimental features via environment variables
- Exclude heavy dependencies from the bundle when features are disabled
- Provide fallback UI when experimental features are not available
- Lazy load experimental components to improve performance

## Environment Variables

### VITE_ENABLE_EXTRAS

Controls whether experimental features are enabled:

- `VITE_ENABLE_EXTRAS=0` (default): Minimal dashboard only
- `VITE_ENABLE_EXTRAS=1`: Enable all experimental features

## Usage

### Basic Feature Flag Checking

```typescript
import { isExperimentalEnabled, isFeatureEnabled } from '@/lib/feature-flags';

// Check if experimental features are enabled
if (isExperimentalEnabled()) {
  // Show experimental UI
}

// Check specific feature (currently all use same flag)
if (isFeatureEnabled('analytics')) {
  // Show analytics features
}
```

### Component Wrapping

Use the `ExperimentalWrapper` component to conditionally render experimental features:

```tsx
import { ExperimentalWrapper } from '@/components/experimental-wrapper';

function MyComponent() {
  return (
    <ExperimentalWrapper 
      fallback={<div>Feature not available</div>}
      loadingFallback={<div>Loading...</div>}
    >
      <HeavyExperimentalComponent />
    </ExperimentalWrapper>
  );
}
```

### Lazy Loading Heavy Components

For components that use heavy dependencies (recharts, framer-motion, etc.), create wrapper components:

```tsx
// components/experimental/my-heavy-component-wrapper.tsx
import React from "react";
import { ExperimentalWrapper } from "@/components/experimental-wrapper";

const MyHeavyComponent = React.lazy(() => 
  import("@/components/my-heavy-component")
);

export function MyHeavyComponentWrapper(props) {
  const fallback = <div>Feature disabled</div>;
  const loadingFallback = <div>Loading...</div>;

  return (
    <ExperimentalWrapper fallback={fallback} loadingFallback={loadingFallback}>
      <MyHeavyComponent {...props} />
    </ExperimentalWrapper>
  );
}
```

## Experimental Features

The following features are controlled by the feature flag system:

### When VITE_ENABLE_EXTRAS=0 (Minimal Mode)
- Shows only the minimal dashboard
- Basic URL analysis functionality
- Simple analysis list
- No heavy UI components
- Smaller bundle size

### When VITE_ENABLE_EXTRAS=1 (Full Mode)
- Full dashboard with advanced features
- Analytics page with charts (recharts)
- AI Assistant with animations (framer-motion)
- Batch analysis functionality
- Business comparison tools
- All experimental UI components

## Bundle Impact

When experimental features are disabled:
- Heavy dependencies are excluded from the bundle
- Components using recharts, framer-motion, embla-carousel, etc. are not loaded
- Significantly smaller bundle size for faster loading
- Better performance on slower devices

## Testing

Feature flags are tested to ensure:
- Correct behavior when enabled/disabled
- Proper fallback rendering
- Component lazy loading works correctly

Run tests with:
```bash
npm test client/src/lib/__tests__/feature-flags.test.ts
npm test client/src/components/__tests__/experimental-wrapper.test.tsx
```

## Adding New Experimental Features

1. Create your component normally
2. Create a wrapper component in `client/src/components/experimental/`
3. Use lazy loading for heavy dependencies
4. Provide appropriate fallback UI
5. Update this documentation

Example:
```tsx
// components/experimental/new-feature-wrapper.tsx
import React from "react";
import { ExperimentalWrapper } from "@/components/experimental-wrapper";

const NewFeature = React.lazy(() => import("@/components/new-feature"));

export function NewFeatureWrapper(props) {
  return (
    <ExperimentalWrapper fallback={<div>Feature not available</div>}>
      <NewFeature {...props} />
    </ExperimentalWrapper>
  );
}
```

## Best Practices

1. **Always provide fallbacks**: Users should understand why a feature isn't available
2. **Use lazy loading**: Heavy components should be lazy loaded to avoid bundle bloat
3. **Test both modes**: Ensure your application works with features enabled and disabled
4. **Keep fallbacks simple**: Don't load heavy dependencies in fallback components
5. **Document new features**: Update this file when adding new experimental features