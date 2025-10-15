import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";

export function UserMenu() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  // Show sign in button if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Link href="/auth">
        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </Link>
    );
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center gap-2">
      <Link href="/profile">
        <Button variant="ghost" size="sm" className="gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs bg-orange-500 text-white">
              {getInitials(user.email)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm">{user.email}</span>
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => logout()}
        title="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
