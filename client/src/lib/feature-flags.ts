/**
 * Feature flag utilities for controlling experimental features
 */

/**
 * Check if experimental features are enabled
 * @returns true if VITE_ENABLE_EXTRAS is set to "1", false otherwise
 */
export const isExperimentalEnabled = (): boolean => {
  return import.meta.env.VITE_ENABLE_EXTRAS === "1";
};

/**
 * Check if a specific experimental feature is enabled
 * @param feature - The feature name to check
 * @returns true if the feature is enabled, false otherwise
 */
export const isFeatureEnabled = (feature: string): boolean => {
  // For now, all experimental features are controlled by the same flag
  // In the future, we could have individual feature flags
  return isExperimentalEnabled();
};

/**
 * Conditional component wrapper for experimental features
 * This is a utility function, not a React component
 * Use ExperimentalWrapper component instead for JSX
 */