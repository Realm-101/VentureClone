import { useUser } from "@stackframe/react";
import { MinimalDashboard } from "@/components/minimal-dashboard";

export default function HomePage() {
  // This will redirect to /handler/sign-in if user is not logged in
  const user = useUser({ or: "redirect" });

  if (!user) {
    // Show loading while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <MinimalDashboard />;
}
