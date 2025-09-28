import React, { Suspense } from "react";
import { isExperimentalEnabled } from "@/lib/feature-flags";

interface ExperimentalWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

/**
 * Wrapper component for experimental features
 * Only renders children if experimental features are enabled
 */
export const ExperimentalWrapper: React.FC<ExperimentalWrapperProps> = ({
  children,
  fallback = null,
  loadingFallback = null,
}) => {
  if (!isExperimentalEnabled()) {
    return <>{fallback}</>;
  }

  return (
    <Suspense fallback={loadingFallback}>
      {children}
    </Suspense>
  );
};

/**
 * Higher-order component for wrapping experimental components
 */
export const withExperimentalFeature = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  return (props: P) => (
    <ExperimentalWrapper fallback={fallback}>
      <Component {...props} />
    </ExperimentalWrapper>
  );
};