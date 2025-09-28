import { describe, it, expect } from 'vitest';
import { isExperimentalEnabled, isFeatureEnabled } from '../feature-flags';

describe('Feature Flags', () => {
  describe('isExperimentalEnabled', () => {
    it('should be a function', () => {
      expect(typeof isExperimentalEnabled).toBe('function');
    });

    it('should return a boolean', () => {
      const result = isExperimentalEnabled();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('isFeatureEnabled', () => {
    it('should be a function', () => {
      expect(typeof isFeatureEnabled).toBe('function');
    });

    it('should return a boolean', () => {
      const result = isFeatureEnabled('test-feature');
      expect(typeof result).toBe('boolean');
    });

    it('should return same value as isExperimentalEnabled for any feature', () => {
      const experimentalEnabled = isExperimentalEnabled();
      expect(isFeatureEnabled('analytics')).toBe(experimentalEnabled);
      expect(isFeatureEnabled('batch-analysis')).toBe(experimentalEnabled);
      expect(isFeatureEnabled('ai-assistant')).toBe(experimentalEnabled);
    });
  });
});