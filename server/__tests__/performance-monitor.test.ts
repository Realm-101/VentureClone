import { describe, it, expect, beforeEach } from 'vitest';
import { PerformanceMonitor } from '../services/performance-monitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = PerformanceMonitor.getInstance();
    monitor.reset(); // Clear metrics before each test
  });

  describe('Recording Detections', () => {
    it('should record successful detection', () => {
      monitor.recordDetection(5000, true, 10, false);

      const stats = monitor.getStats();
      expect(stats.totalDetections).toBe(1);
      expect(stats.successfulDetections).toBe(1);
      expect(stats.failedDetections).toBe(0);
      expect(stats.successRate).toBe(100);
      expect(stats.averageDetectionTime).toBe(5000);
    });

    it('should record failed detection', () => {
      monitor.recordDetection(3000, false, 0, false);

      const stats = monitor.getStats();
      expect(stats.totalDetections).toBe(1);
      expect(stats.successfulDetections).toBe(0);
      expect(stats.failedDetections).toBe(1);
      expect(stats.successRate).toBe(0);
    });

    it('should record fallback scenario', () => {
      monitor.recordDetection(8000, false, 0, true);

      const stats = monitor.getStats();
      expect(stats.fallbackCount).toBe(1);
      expect(stats.fallbackRate).toBe(100);
    });

    it('should track slow detections (>10 seconds)', () => {
      monitor.recordDetection(12000, true, 5, false);

      const stats = monitor.getStats();
      expect(stats.slowDetections).toBe(1);
    });

    it('should not count fast detections as slow', () => {
      monitor.recordDetection(8000, true, 5, false);

      const stats = monitor.getStats();
      expect(stats.slowDetections).toBe(0);
    });
  });

  describe('Statistics Calculation', () => {
    it('should calculate correct success rate', () => {
      monitor.recordDetection(5000, true, 10, false);
      monitor.recordDetection(6000, true, 8, false);
      monitor.recordDetection(4000, false, 0, false);

      const stats = monitor.getStats();
      expect(stats.totalDetections).toBe(3);
      expect(stats.successfulDetections).toBe(2);
      expect(stats.failedDetections).toBe(1);
      expect(stats.successRate).toBe(66.67);
    });

    it('should calculate correct fallback rate', () => {
      monitor.recordDetection(5000, true, 10, false);
      monitor.recordDetection(6000, false, 0, true);
      monitor.recordDetection(4000, false, 0, true);

      const stats = monitor.getStats();
      expect(stats.totalDetections).toBe(3);
      expect(stats.fallbackCount).toBe(2);
      expect(stats.fallbackRate).toBe(66.67);
    });

    it('should calculate correct average detection time', () => {
      monitor.recordDetection(5000, true, 10, false);
      monitor.recordDetection(7000, true, 8, false);
      monitor.recordDetection(3000, true, 5, false);

      const stats = monitor.getStats();
      expect(stats.averageDetectionTime).toBe(5000); // (5000 + 7000 + 3000) / 3
    });

    it('should handle empty metrics', () => {
      const stats = monitor.getStats();
      
      expect(stats.totalDetections).toBe(0);
      expect(stats.successfulDetections).toBe(0);
      expect(stats.failedDetections).toBe(0);
      expect(stats.fallbackCount).toBe(0);
      expect(stats.successRate).toBe(0);
      expect(stats.fallbackRate).toBe(0);
      expect(stats.averageDetectionTime).toBe(0);
      expect(stats.slowDetections).toBe(0);
    });
  });

  describe('Recent Metrics', () => {
    it('should return recent metrics', () => {
      monitor.recordDetection(5000, true, 10, false);
      monitor.recordDetection(6000, true, 8, false);
      monitor.recordDetection(4000, false, 0, false);

      const recent = monitor.getRecentMetrics(2);
      expect(recent).toHaveLength(2);
      expect(recent[0].duration).toBe(6000);
      expect(recent[1].duration).toBe(4000);
    });

    it('should return all metrics if count exceeds total', () => {
      monitor.recordDetection(5000, true, 10, false);
      monitor.recordDetection(6000, true, 8, false);

      const recent = monitor.getRecentMetrics(10);
      expect(recent).toHaveLength(2);
    });
  });

  describe('Memory Management', () => {
    it('should limit stored metrics to prevent memory issues', () => {
      // Record more than maxMetrics (1000)
      for (let i = 0; i < 1100; i++) {
        monitor.recordDetection(5000, true, 10, false);
      }

      const stats = monitor.getStats();
      // Should only keep last 1000 metrics
      expect(stats.totalDetections).toBe(1000);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PerformanceMonitor.getInstance();
      const instance2 = PerformanceMonitor.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should share state across instances', () => {
      const instance1 = PerformanceMonitor.getInstance();
      instance1.recordDetection(5000, true, 10, false);

      const instance2 = PerformanceMonitor.getInstance();
      const stats = instance2.getStats();

      expect(stats.totalDetections).toBe(1);
    });
  });

  describe('Reset Functionality', () => {
    it('should clear all metrics on reset', () => {
      monitor.recordDetection(5000, true, 10, false);
      monitor.recordDetection(6000, true, 8, false);

      monitor.reset();

      const stats = monitor.getStats();
      expect(stats.totalDetections).toBe(0);
    });
  });
});
