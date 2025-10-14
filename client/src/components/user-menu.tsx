import { useUser } from "@stackframe/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut } from "lucide-react";
import { Link } from "wouter";

export function UserMenu() {
  const user = useUser();

  if (!user) {
    return (
      <Link href="/handler/sign-in">
        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </Link>
    );
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-2">
      <Link href="/profile">
        <Button variant="ghost" size="sm" className="gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={user.profileImageUrl || undefined} />
            <AvatarFallback className="text-xs">
              {getInitials(user.displayName)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">{user.displayName || "Profile"}</span>
        </Button>
      </Link>
    </div>
  );
}
