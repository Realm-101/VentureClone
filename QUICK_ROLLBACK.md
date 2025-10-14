# Quick Rollback - Disable Authentication

If the build is still failing on Render, here's a 30-second fix to disable authentication and get your app deployed:

## Option 1: Comment Out Auth (Fastest - 30 seconds)

### Step 1: Disable in App.tsx

```bash
# I can do this for you - just say "disable auth"
```

Or manually:
1. Open `client/src/App.tsx`
2. Comment out these lines:

```typescript
// import { StackProvider, StackTheme } from "@stackframe/react";
// import { stackClientApp } from "@/../../stack/client";
```

3. Wrap App with plain QueryClientProvider (remove StackProvider)

### Step 2: Disable in home.tsx

1. Open `client/src/pages/home.tsx`
2. Comment out:

```typescript
// import { useUser } from "@stackframe/react";
// const user = useUser({ or: "redirect" });
```

### Step 3: Disable in user-menu.tsx

1. Open `client/src/components/user-menu.tsx`
2. Replace with simple button:

```typescript
export function UserMenu() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" disabled>
        Sign In (Coming Soon)
      </Button>
    </div>
  );
}
```

### Step 4: Push and Deploy

```bash
git add .
git commit -m "Temporarily disable auth for deployment"
git push
```

## Option 2: Use Feature Flag (Better - 2 minutes)

Add to Render environment variables:
```
VITE_ENABLE_AUTH=false
```

Then wrap auth code:
```typescript
const authEnabled = import.meta.env.VITE_ENABLE_AUTH !== 'false';
```

## Option 3: Downgrade Stack Auth (Permanent Fix - 5 minutes)

```bash
npm uninstall @stackframe/react
npm install @stackframe/stack@1.x
```

Update imports:
- Change `@stackframe/react` → `@stackframe/stack`
- In all files: App.tsx, home.tsx, profile.tsx, user-menu.tsx, stack/client.ts, stack/server.ts

## What I Recommend

**Try the Vite config fix first** (already applied). If build still hangs after 5 minutes:

1. **Cancel the build**
2. **Tell me "disable auth"** - I'll do it in 30 seconds
3. **Deploy without auth**
4. **Re-enable later** when Stack Auth v2 fixes the issue

## Current Status

✅ Vite config updated to handle circular dependencies
⏳ Wait for build to complete (should work now)
🔄 If still hanging after 5 min → disable auth

Your app works perfectly without auth - all business analysis features are functional!
