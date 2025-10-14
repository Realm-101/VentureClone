# Authentication Quick Start

Get authentication up and running in 5 minutes!

## 🚀 Quick Setup

### 1. Create Stack Auth Account

Visit [Stack Auth](https://app.stack-auth.com/) and create a free account.

### 2. Create a New Project

- Click "Create New Project"
- Name it "VentureClone AI"
- Enable "Email/Password" authentication

### 3. Copy Your Credentials

You'll see three keys on your dashboard:
- Project ID
- Publishable Client Key  
- Secret Server Key

### 4. Add to Environment

Open your `.env` file and add:

```env
VITE_STACK_PROJECT_ID=proj_xxxxxxxxxxxxx
VITE_STACK_PUBLISHABLE_CLIENT_KEY=pk_xxxxxxxxxxxxx
STACK_SECRET_SERVER_KEY=sk_xxxxxxxxxxxxx
```

### 5. Configure URLs in Stack Dashboard

Go to **Settings → URLs** and set:

| Setting | Value |
|---------|-------|
| Sign In URL | `/handler/sign-in` |
| Sign Up URL | `/handler/sign-up` |
| After Sign In | `/home` |
| After Sign Up | `/home` |
| After Sign Out | `/` |

### 6. Add Allowed Domains

Go to **Settings → Domains** and add:
- `http://localhost:5000`
- Your production domain (when ready)

### 7. Start Your App

```bash
npm run dev
```

### 8. Test It Out!

1. Open `http://localhost:5000`
2. Click "Sign In" in the header
3. Create a new account
4. Check your email for verification (if enabled)
5. Sign in and view your profile!

## ✅ What You Get

- ✅ Email/password authentication
- ✅ Email verification
- ✅ Password reset
- ✅ User profiles
- ✅ Session management
- ✅ Protected routes
- ✅ User menu with avatar
- ✅ Sign out functionality

## 🎨 Customization

### Change Profile Page
Edit: `client/src/pages/profile.tsx`

### Modify User Menu
Edit: `client/src/components/user-menu.tsx`

### Update Auth Flow
Edit: `stack/server.ts` and `stack/client.ts`

## 🐛 Troubleshooting

**Can't sign in?**
- Check your `.env` file has all three keys
- Restart your dev server: `Ctrl+C` then `npm run dev`

**Redirect issues?**
- Verify URLs in Stack Auth dashboard match exactly
- Check browser console for errors

**Email not sending?**
- Stack provides default email service
- Check spam folder
- Verify email settings in Stack dashboard

## 📚 Full Documentation

For detailed setup and advanced features, see:
- [Complete Stack Auth Setup Guide](./STACK_AUTH_SETUP.md)
- [Stack Auth Official Docs](https://docs.stack-auth.com/)

## 🎉 You're Done!

Your app now has enterprise-grade authentication. Users can:
- Sign up with email/password
- Verify their email
- Sign in securely
- View and manage their profile
- Sign out

Need help? Check the [troubleshooting section](./STACK_AUTH_SETUP.md#troubleshooting) in the full guide.
