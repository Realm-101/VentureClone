import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  confidence?: number;
  className?: string;
}

/**
 * ConfidenceBadge Component
 * Displays a "Speculative" badge when confidence is below 0.6
 * Handles missing confidence data gracefully by not rendering anything
 */
export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  // Don't render anything if confidence is not provided or is >= 0.6
  if (confidence === undefined || confidence >= 0.6) {
    return null;
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-orange-700 border-orange-300 bg-orange-50 dark:text-orange-400 dark:border-orange-600 dark:bg-orange-950/20",
        className
      )}
    >
      Speculative
    </Badge>
  );
}