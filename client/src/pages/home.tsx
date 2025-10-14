import { MinimalDashboard } from "@/components/minimal-dashboard";
import { isExperimentalEnabled } from "@/lib/feature-flags";
import { lazy, Suspense } from "react";
// TODO: Re-enable when Stack Auth v2 fixes circular dependency issues
// import { useUser } from "@stackframe/react";

const Dashboard = lazy(() => import("@/pages/dashboard"));

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

export default function HomePage() {
  // TODO: Re-enable when Stack Auth v2 fixes circular dependency issues
  // const user = useUser({ or: "redirect" });
  
  // If experimental features are enabled, show full dashboard
  // Otherwise show minimal dashboard
  if (isExperimentalEnabled()) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Dashboard />
      </Suspense>
    );
  }
  
  return <MinimalDashboard />;
}
