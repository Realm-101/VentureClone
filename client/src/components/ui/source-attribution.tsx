import * as React from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Source } from "@shared/schema";

interface SourceAttributionProps {
  sources?: Source[];
  className?: string;
}

/**
 * SourceAttribution Component
 * Displays source URLs and excerpts for claims
 * Handles missing source data gracefully
 */
export function SourceAttribution({ sources, className }: SourceAttributionProps) {
  // Don't render anything if no sources are provided
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <h5 className="text-xs font-medium text-muted-foreground">Sources</h5>
      <div className="space-y-1">
        {sources.map((source, index) => (
          <div key={index} className="text-xs">
            <div className="flex items-center gap-1 mb-1">
              <button
                onClick={() => window.open(source.url, '_blank', 'noopener,noreferrer')}
                className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <span className="underline">{new URL(source.url).hostname}</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
            <p className="text-muted-foreground italic pl-1 border-l-2 border-muted">
              "{source.excerpt}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}