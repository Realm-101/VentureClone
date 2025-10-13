import React, { Suspense, Component, ErrorInfo, ReactNode } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { isExperimentalEnabled } from "@/lib/feature-flags";
import { MinimalDashboard } from "@/components/minimal-dashboard";
import NotFound from "@/pages/not-found";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Squares } from "@/components/ui/squares-background";

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

// Spiral animation demo - always available
const SpiralDemoPage = React.lazy(() => import("@/pages/spiral-demo-page"));
const LoaderDemo = React.lazy(() => import("@/components/LoaderDemo").then(module => ({ default: module.LoaderDemo })));

// Auth handler for Stack Auth
const AuthHandler = React.lazy(() => import("@/pages/handler"));

// Splash and protected pages
const SplashPage = React.lazy(() => import("@/pages/splash"));
const HomePage = React.lazy(() => import("@/pages/home"));

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application Error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="mt-2">
                <div className="space-y-3">
                  <p className="font-medium">Something went wrong</p>
                  <p className="text-sm">
                    The application encountered an unexpected error. Please try reloading the page.
                  </p>
                  <Button 
                    onClick={this.handleReload}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reload Page
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Loading Component
 * Displays loading state with consistent styling
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Router Component
 * Handles routing logic based on feature flags
 */
function Router() {
  // If experimental features are disabled, render Dashboard directly without routing
  if (!isExperimentalEnabled()) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          <Route path="/handler/:rest*" component={AuthHandler} />
          <Route path="/home" component={HomePage} />
          <Route path="/spiral" component={SpiralDemoPage} />
          <Route path="/loader-demo" component={LoaderDemo} />
          <Route path="/" component={SplashPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    );
  }

  // Full feature set when experimental features are enabled
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/handler/:rest*" component={AuthHandler} />
        <Route path="/home" component={HomePage} />
        <Route path="/dashboard" component={Dashboard!} />
        <Route path="/analytics" component={Analytics!} />
        <Route path="/spiral" component={SpiralDemoPage} />
        <Route path="/loader-demo" component={LoaderDemo} />
        <Route path="/" component={SplashPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

/**
 * Main App Component
 * Provides global context and error boundaries
 */
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className={isExperimentalEnabled() ? "dark min-h-screen relative" : "min-h-screen relative"} style={{ background: '#060606' }}>
          {/* Animated checkered background */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <Squares 
              direction="diagonal"
              speed={0.5}
              squareSize={40}
              borderColor="#333"
              hoverFillColor="#222"
            />
          </div>
          
          {/* Content layer */}
          <div className="relative z-10 min-h-screen">
            <Toaster />
            <Router />
            {isExperimentalEnabled() && AIAssistant && (
              <Suspense fallback={null}>
                <AIAssistant />
              </Suspense>
            )}
          </div>
        </div>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
