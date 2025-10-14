# Stack Auth Setup Guide

This guide will help you set up Stack Auth for VentureClone AI, providing complete authentication with email/password, email verification, and user profiles.

## Prerequisites

- A Stack Auth account (free tier available)
- Your Neon database is already configured with the `neon_auth` schema

## Step 1: Create a Stack Auth Project

1. Go to [Stack Auth Dashboard](https://app.stack-auth.com/)
2. Sign up or log in
3. Click "Create New Project"
4. Name your project (e.g., "VentureClone AI")
5. Select your preferred authentication methods:
   - ✅ Email/Password (recommended)
   - ✅ Magic Link (optional)
   - ✅ Google OAuth (optional)
   - ✅ GitHub OAuth (optional)

## Step 2: Get Your Credentials

After creating your project, you'll see three important credentials:

1. **Project ID** - Used by both frontend and backend
2. **Publishable Client Key** - Used by frontend (safe to expose)
3. **Secret Server Key** - Used by backend (keep secret!)

## Step 3: Configure Environment Variables

Copy your `.env.example` to `.env` if you haven't already:

```bash
cp .env.example .env
```

Add your Stack Auth credentials to `.env`:

```env
# Stack Auth Configuration
VITE_STACK_PROJECT_ID=your_project_id_here
VITE_STACK_PUBLISHABLE_CLIENT_KEY=your_publishable_key_here
STACK_SECRET_SERVER_KEY=your_secret_key_here
```

## Step 4: Configure Stack Auth Settings

In your Stack Auth dashboard:

### 4.1 Set Allowed Domains

Go to **Settings → Domains** and add:
- `http://localhost:5000` (for development)
- Your production domain (e.g., `https://yourapp.com`)

### 4.2 Configure Redirect URLs

Go to **Settings → URLs** and set:
- **Sign In URL**: `/handler/sign-in`
- **Sign Up URL**: `/handler/sign-up`
- **After Sign In**: `/home`
- **After Sign Up**: `/home`
- **After Sign Out**: `/`

### 4.3 Enable Email Verification (Optional but Recommended)

Go to **Settings → Email** and:
- Enable email verification
- Customize email templates if desired
- Configure your email provider (Stack provides a default)

## Step 5: Initialize Stack Auth

Run this command to set up Stack Auth in your project:

```bash
npx @stackframe/init-stack . --no-browser
```

This command will:
- ✅ Add `@stackframe/stack` to your dependencies (already done)
- ✅ Create Stack configuration files (already done)
- ✅ Set up authentication routes (already done)

## Step 6: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5000`

3. You should see a "Sign In" button in the header

4. Click it and try:
   - Creating a new account
   - Signing in with email/password
   - Viewing your profile at `/profile`

## Features Included

### ✅ Authentication
- Email/password sign up and sign in
- Email verification
- Password reset
- Session management with cookies

### ✅ User Profile
- View profile information
- Display name and email
- Profile picture (if uploaded)
- Account creation date
- Sign out functionality

### ✅ Protected Routes
- Home page requires authentication
- Automatic redirect to sign-in for unauthenticated users
- Seamless user experience

### ✅ UI Components
- Pre-built sign-in/sign-up forms
- User avatar in header
- Profile page
- Responsive design

## Database Integration

Stack Auth automatically syncs user data to your Neon database in the `neon_auth.users_sync` table. This allows you to:

- Query user data in your application
- Create relationships with other tables
- Maintain data consistency

Example query:
```sql
SELECT * FROM neon_auth.users_sync;
```

## Customization

### Custom Sign-In Page

To customize the sign-in experience, edit:
- `client/src/pages/handler.tsx` - Auth handler component
- Use Stack's built-in components or create custom forms

### Profile Page

Customize the profile page at:
- `client/src/pages/profile.tsx`

### User Menu

Modify the header user menu at:
- `client/src/components/user-menu.tsx`

## Troubleshooting

### "Invalid credentials" error
- Double-check your environment variables
- Ensure you copied the correct keys from Stack Auth dashboard
- Restart your dev server after changing `.env`

### Redirect loop
- Verify your redirect URLs in Stack Auth dashboard
- Check that `VITE_STACK_PROJECT_ID` is set correctly

### Email verification not working
- Check your email provider settings in Stack Auth
- Look for verification emails in spam folder
- Ensure email verification is enabled in Stack Auth settings

### User not redirected after sign-in
- Verify `afterSignIn` URL in `stack/server.ts`
- Check browser console for errors

## Production Deployment

Before deploying to production:

1. ✅ Add your production domain to Stack Auth allowed domains
2. ✅ Set production environment variables on your hosting platform
3. ✅ Enable HTTPS (required for secure cookies)
4. ✅ Test authentication flow in production
5. ✅ Configure email provider for production emails

## Security Best Practices

- ✅ Never commit `.env` file to version control
- ✅ Use different Stack Auth projects for dev/staging/production
- ✅ Rotate secret keys periodically
- ✅ Enable email verification for production
- ✅ Use HTTPS in production
- ✅ Set secure cookie settings (already configured)

## Support

- Stack Auth Documentation: https://docs.stack-auth.com/
- Stack Auth Discord: https://discord.gg/stack-auth
- GitHub Issues: https://github.com/stack-auth/stack

## Next Steps

Now that authentication is set up, you can:

1. **Customize the user experience**
   - Add more profile fields
   - Implement user preferences
   - Add social login providers

2. **Integrate with your business logic**
   - Link analyses to authenticated users
   - Add user-specific features
   - Implement team collaboration

3. **Enhance security**
   - Add two-factor authentication
   - Implement role-based access control
   - Add audit logging

Enjoy your fully-featured authentication system! 🎉
