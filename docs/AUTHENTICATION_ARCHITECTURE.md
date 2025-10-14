# Authentication Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     VentureClone AI                          │
│                  Authentication System                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Browser    │◄───────►│  Stack Auth  │◄───────►│ Neon Database│
│   (Client)   │         │   Service    │         │  (Postgres)  │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │                         │
       │                        │                         │
       ▼                        ▼                         ▼
  React App              Authentication            neon_auth.users_sync
  + Stack SDK            + Session Mgmt            + User Data Sync
```

## Component Architecture

### Frontend Components

```
client/src/
├── App.tsx                          # StackProvider wrapper
├── pages/
│   ├── home.tsx                     # Protected route (requires auth)
│   ├── profile.tsx                  # User profile page
│   ├── handler.tsx                  # Auth handler (sign-in/sign-up)
│   └── splash.tsx                   # Public landing page
├── components/
│   ├── user-menu.tsx                # Header user menu with avatar
│   ├── minimal-dashboard.tsx        # Main dashboard (with user menu)
│   └── ui/
│       ├── avatar.tsx               # Avatar component
│       └── card.tsx                 # Card component
└── stack/
    └── client.ts                    # Stack Auth client config
```

### Backend Integration

```
server/
├── middleware/
│   └── user.ts                      # Cookie-based user tracking
└── stack/
    └── server.ts                    # Stack Auth server config
```

### Configuration

```
.env
├── VITE_STACK_PROJECT_ID            # Public project identifier
├── VITE_STACK_PUBLISHABLE_CLIENT_KEY # Public client key
└── STACK_SECRET_SERVER_KEY          # Secret server key (backend only)
```

## Authentication Flow

### Sign Up Flow

```
1. User visits app
   └─► Redirected to /handler/sign-in
       └─► Clicks "Sign Up"
           └─► Fills form (email + password)
               └─► Stack Auth creates account
                   └─► (Optional) Email verification sent
                       └─► User verifies email
                           └─► Redirected to /home
                               └─► Session created
```

### Sign In Flow

```
1. User visits app
   └─► Redirected to /handler/sign-in
       └─► Enters credentials
           └─► Stack Auth validates
               └─► Session created
                   └─► Redirected to /home
                       └─► User authenticated
```

### Protected Route Flow

```
1. User accesses /home
   └─► useUser({ or: "redirect" })
       ├─► If authenticated: Show page
       └─► If not authenticated: Redirect to /handler/sign-in
```

## Data Flow

### User Data Sync

```
┌─────────────┐
│ Stack Auth  │
│   Service   │
└──────┬──────┘
       │
       │ Automatic Sync
       ▼
┌─────────────────────┐
│  Neon Database      │
│  neon_auth.users_sync│
├─────────────────────┤
│ - id                │
│ - email             │
│ - display_name      │
│ - profile_image_url │
│ - email_verified    │
│ - created_at        │
│ - updated_at        │
└─────────────────────┘
       │
       │ Query
       ▼
┌─────────────────────┐
│  Your Application   │
│  - Link analyses    │
│  - User preferences │
│  - Team features    │
└─────────────────────┘
```

## Session Management

### Cookie-Based Sessions

```
┌──────────────────────────────────────────────────────────┐
│                    Session Cookie                         │
├──────────────────────────────────────────────────────────┤
│ Name:       stack-session                                 │
│ Type:       httpOnly                                      │
│ Secure:     true (production)                             │
│ SameSite:   lax                                           │
│ Max-Age:    30 days                                       │
│ Path:       /                                             │
└──────────────────────────────────────────────────────────┘
```

### Session Lifecycle

```
Sign In ──► Session Created ──► Cookie Set ──► User Authenticated
                                     │
                                     ▼
                              Valid for 30 days
                                     │
                                     ▼
                              Auto-refresh on activity
                                     │
                                     ▼
Sign Out ──► Session Destroyed ──► Cookie Cleared ──► User Logged Out
```

## Security Features

### Authentication Security

```
┌─────────────────────────────────────────────────────────┐
│                   Security Layers                        │
├─────────────────────────────────────────────────────────┤
│ 1. Password Hashing (bcrypt)                            │
│    └─► Handled by Stack Auth                            │
│                                                          │
│ 2. Secure Cookies                                       │
│    ├─► httpOnly (no JavaScript access)                  │
│    ├─► Secure (HTTPS only in production)                │
│    └─► SameSite (CSRF protection)                       │
│                                                          │
│ 3. Email Verification                                   │
│    └─► Optional but recommended                         │
│                                                          │
│ 4. Rate Limiting                                        │
│    └─► Prevents brute force attacks                     │
│                                                          │
│ 5. HTTPS Enforcement                                    │
│    └─► Required in production                           │
└─────────────────────────────────────────────────────────┘
```

## UI Components

### User Menu States

```
┌─────────────────────────────────────────────────────────┐
│                  Unauthenticated                         │
├─────────────────────────────────────────────────────────┤
│  [Sign In]                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   Authenticated                          │
├─────────────────────────────────────────────────────────┤
│  [👤 Avatar] [Display Name]                             │
│       │                                                  │
│       └──► Click to view profile                        │
└─────────────────────────────────────────────────────────┘
```

### Profile Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  [← Back to Home]                                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │  Profile                                    │         │
│  │  Manage your account settings               │         │
│  ├────────────────────────────────────────────┤         │
│  │                                             │         │
│  │  [👤]  Display Name                         │         │
│  │        user@example.com                     │         │
│  │                                             │         │
│  │  ┌─────────────────────────────────────┐   │         │
│  │  │ 👤 Display Name                     │   │         │
│  │  │    John Doe                         │   │         │
│  │  └─────────────────────────────────────┘   │         │
│  │                                             │         │
│  │  ┌─────────────────────────────────────┐   │         │
│  │  │ ✉️  Email Verified                  │   │         │
│  │  │    ✓ Verified                       │   │         │
│  │  └─────────────────────────────────────┘   │         │
│  │                                             │         │
│  │  [Sign Out]                                 │         │
│  └────────────────────────────────────────────┘         │
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │  Account Information                        │         │
│  ├────────────────────────────────────────────┤         │
│  │  User ID:  abc123...                        │         │
│  │  Primary Email: user@example.com            │         │
│  └────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

## Integration Points

### Existing Features + Auth

```
┌─────────────────────────────────────────────────────────┐
│              Business Analysis Workflow                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Before Auth:                                            │
│  └─► Anonymous user tracking (UUID cookies)             │
│                                                          │
│  After Auth:                                             │
│  ├─► Authenticated user tracking                        │
│  ├─► Link analyses to user accounts                     │
│  ├─► Persistent analysis history                        │
│  └─► User-specific features                             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Deployment Considerations

### Environment Variables

```
Development:
├── VITE_STACK_PROJECT_ID=proj_dev_xxxxx
├── VITE_STACK_PUBLISHABLE_CLIENT_KEY=pk_dev_xxxxx
└── STACK_SECRET_SERVER_KEY=sk_dev_xxxxx

Production:
├── VITE_STACK_PROJECT_ID=proj_prod_xxxxx
├── VITE_STACK_PUBLISHABLE_CLIENT_KEY=pk_prod_xxxxx
└── STACK_SECRET_SERVER_KEY=sk_prod_xxxxx
```

### Stack Auth Dashboard Settings

```
Development:
└── Allowed Domains: http://localhost:5000

Production:
├── Allowed Domains: https://yourapp.com
└── HTTPS Required: ✓
```

## Future Enhancements

### Planned Features

```
Phase 1 (Current):
├── ✅ Email/password authentication
├── ✅ User profiles
├── ✅ Protected routes
└── ✅ Session management

Phase 2 (Next):
├── ⬜ Link analyses to users
├── ⬜ User preferences
├── ⬜ Analysis history per user
└── ⬜ Export user data

Phase 3 (Future):
├── ⬜ Social login (Google, GitHub)
├── ⬜ Two-factor authentication
├── ⬜ Team workspaces
└── ⬜ Role-based access control
```

## Performance Metrics

### Authentication Performance

```
┌─────────────────────────────────────────────────────────┐
│                  Target Metrics                          │
├─────────────────────────────────────────────────────────┤
│ Sign Up:        < 2 seconds                              │
│ Sign In:        < 1 second                               │
│ Session Check:  < 100ms                                  │
│ Sign Out:       < 500ms                                  │
│ Profile Load:   < 500ms                                  │
└─────────────────────────────────────────────────────────┘
```

## Monitoring & Debugging

### Key Metrics to Track

```
1. Authentication Success Rate
   └─► Target: > 99%

2. Session Duration
   └─► Average: 7-14 days

3. Email Verification Rate
   └─► Target: > 80%

4. Sign-up Conversion
   └─► Track: Landing → Sign-up → Verified

5. Error Rates
   └─► Target: < 0.1%
```

### Debug Checklist

```
□ Check browser console for errors
□ Verify environment variables are set
□ Check Stack Auth dashboard for issues
□ Verify redirect URLs are correct
□ Test in incognito mode
□ Clear cookies and cache
□ Check network tab for failed requests
□ Verify HTTPS in production
```

---

## Summary

This authentication system provides:
- ✅ Production-ready security
- ✅ Seamless user experience
- ✅ Easy integration with existing features
- ✅ Scalable architecture
- ✅ Comprehensive documentation

**Setup Time:** 5 minutes
**Maintenance:** Minimal
**Security:** Enterprise-grade
**User Experience:** Smooth
