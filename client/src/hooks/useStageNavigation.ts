import { useState, useEffect, useMemo } from 'react';

export type StageStatus = 'pending' | 'in_progress' | 'completed';

export interface StageStatusInfo {
  stageNumber: number;
  stageName: string;
  status: StageStatus;
  completedAt?: string;
}

interface UseStageNavigationProps {
  currentStage: number;
  stages: Record<number, any>;
  completedStages?: number[];
}

const STAGE_NAMES: Record<number, string> = {
  1: 'Discovery & Selection',
  2: 'Lazy-Entrepreneur Filter',
  3: 'MVP Launch Planning',
  4: 'Demand Testing Strategy',
  5: 'Scaling & Growth',
  6: 'AI Automation Mapping',
};

/**
 * Custom hook for managing stage navigation and status tracking
 * Requirements: 5.1, 5.2, 5.4
 */
export function useStageNavigation({
  currentStage,
  stages,
  completedStages = [],
}: UseStageNavigationProps) {
  const [activeStage, setActiveStage] = useState(currentStage);

  // Update active stage when current stage changes
  useEffect(() => {
    setActiveStage(currentStage);
  }, [currentStage]);

  /**
   * Calculate stage status based on completion and current stage
   * Requirements: 5.1, 5.2
   */
  const getStageStatus = (stageNumber: number): StageStatus => {
    // Check if stage is explicitly completed
    if (completedStages.includes(stageNumber)) {
      return 'completed';
    }

    // Check if stage has completed data
    const stageData = stages[stageNumber];
    if (stageData?.status === 'completed') {
      return 'completed';
    }

    // Stage 1 is always completed after initial analysis
    if (stageNumber === 1) {
      return 'completed';
    }

    // Current active stage is in progress
    if (stageNumber === activeStage) {
      return 'in_progress';
    }

    // Stages before current are completed
    if (stageNumber < activeStage) {
      return 'completed';
    }

    // Future stages are pending
    return 'pending';
  };

  /**
   * Get all stage status information
   * Requirements: 5.1, 5.2
   */
  const stageStatuses = useMemo<StageStatusInfo[]>(() => {
    return [1, 2, 3, 4, 5, 6].map((stageNumber) => {
      const stageData = stages[stageNumber];
      return {
        stageNumber,
        stageName: STAGE_NAMES[stageNumber] || `Stage ${stageNumber}`,
        status: getStageStatus(stageNumber),
        completedAt: stageData?.completedAt || stageData?.generatedAt,
      };
    });
  }, [stages, completedStages, activeStage]);

  /**
   * Navigate to a specific stage
   * Requirements: 5.4
   */
  const navigateToStage = (stageNumber: number) => {
    if (stageNumber >= 1 && stageNumber <= 6) {
      setActiveStage(stageNumber);
    }
  };

  /**
   * Mark a stage as completed
   * Requirements: 5.2
   */
  const markStageCompleted = (stageNumber: number) => {
    // This will be reflected in the next render through getStageStatus
    // The actual completion is tracked in the backend via stages data
  };

  /**
   * Check if a stage can be accessed
   */
  const canAccessStage = (stageNumber: number): boolean => {
    if (stageNumber === 1) return true;
    
    // Can access if previous stage is completed
    const previousStageStatus = getStageStatus(stageNumber - 1);
    return previousStageStatus === 'completed';
  };

  /**
   * Check if a stage is completed
   */
  const isStageCompleted = (stageNumber: number): boolean => {
    return getStageStatus(stageNumber) === 'completed';
  };

  return {
    activeStage,
    stageStatuses,
    navigateToStage,
    markStageCompleted,
    getStageStatus,
    canAccessStage,
    isStageCompleted,
  };
}
