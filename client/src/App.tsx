import React, { Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isExperimentalEnabled } from "@/lib/feature-flags";
import { MinimalDashboard } from "@/components/minimal-dashboard";
import NotFound from "@/pages/not-found";

// Lazy load experimental components to exclude them from bundle when disabled
const Dashboard = isExperimentalEnabled() 
  ? React.lazy(() => import("@/pages/dashboard"))
  : null;

const Analytics = isExperimentalEnabled() 
  ? React.lazy(() => import("@/pages/analytics").then(module => ({ default: module.Analytics })))
  : null;

const AIAssistant = isExperimentalEnabled() 
  ? React.lazy(() => import("@/components/ai-assistant").then(module => ({ default: module.AIAssistant })))
  : null;

function Router() {
  // If experimental features are disabled, show only minimal dashboard
  if (!isExperimentalEnabled()) {
    return (
      <Switch>
        <Route path="/" component={MinimalDashboard} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Full feature set when experimental features are enabled
  return (
    <Suspense fallback={<div className="min-h-screen bg-vc-dark flex items-center justify-center">
      <div className="text-vc-text">Loading...</div>
    </div>}>
      <Switch>
        <Route path="/" component={Dashboard!} />
        <Route path="/analytics" component={Analytics!} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className={isExperimentalEnabled() ? "dark min-h-screen bg-vc-dark" : "min-h-screen"}>
          <Toaster />
          <Router />
          {isExperimentalEnabled() && AIAssistant && (
            <Suspense fallback={null}>
              <AIAssistant />
            </Suspense>
          )}
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
