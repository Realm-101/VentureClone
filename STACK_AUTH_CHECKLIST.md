# Stack Auth Setup Checklist

Use this checklist to set up authentication in 5 minutes!

## ☐ Step 1: Create Stack Auth Account (2 min)

- [ ] Go to https://app.stack-auth.com/
- [ ] Sign up with your email
- [ ] Verify your email

## ☐ Step 2: Create Project (1 min)

- [ ] Click "Create New Project"
- [ ] Name it: **VentureClone AI**
- [ ] Select authentication methods:
  - [ ] ✅ Email/Password (required)
  - [ ] ⬜ Magic Link (optional)
  - [ ] ⬜ Google OAuth (optional)
  - [ ] ⬜ GitHub OAuth (optional)
- [ ] Click "Create Project"

## ☐ Step 3: Copy Credentials (30 sec)

You'll see three keys on your dashboard. Copy them:

- [ ] **Project ID** (starts with `proj_`)
- [ ] **Publishable Client Key** (starts with `pk_`)
- [ ] **Secret Server Key** (starts with `sk_`)

## ☐ Step 4: Update .env File (30 sec)

- [ ] Open your `.env` file (or create from `.env.example`)
- [ ] Add these three lines:

```env
VITE_STACK_PROJECT_ID=proj_xxxxxxxxxxxxx
VITE_STACK_PUBLISHABLE_CLIENT_KEY=pk_xxxxxxxxxxxxx
STACK_SECRET_SERVER_KEY=sk_xxxxxxxxxxxxx
```

- [ ] Replace the `xxxxx` with your actual keys
- [ ] Save the file

## ☐ Step 5: Configure Stack Auth Dashboard (1 min)

### Allowed Domains
- [ ] Go to **Settings → Domains**
- [ ] Add: `http://localhost:5000`
- [ ] (Later) Add your production domain

### Redirect URLs
- [ ] Go to **Settings → URLs**
- [ ] Set these values:

| Setting | Value |
|---------|-------|
| Sign In URL | `/handler/sign-in` |
| Sign Up URL | `/handler/sign-up` |
| After Sign In | `/home` |
| After Sign Up | `/home` |
| After Sign Out | `/` |

- [ ] Click "Save"

## ☐ Step 6: Start Your App (30 sec)

- [ ] Open terminal
- [ ] Run: `npm run dev`
- [ ] Wait for server to start

## ☐ Step 7: Test Authentication (1 min)

- [ ] Open browser to `http://localhost:5000`
- [ ] You should see "Sign In" button in header
- [ ] Click "Sign In"
- [ ] Click "Sign Up" to create account
- [ ] Enter email and password
- [ ] Click "Create Account"
- [ ] (If email verification enabled) Check your email
- [ ] Sign in with your credentials
- [ ] You should be redirected to `/home`
- [ ] Click your avatar in header
- [ ] Click "Profile" to view your profile page
- [ ] Click "Sign Out" to test sign out

## ✅ Success Checklist

You're done when you can:

- [ ] ✅ See "Sign In" button for unauthenticated users
- [ ] ✅ Create a new account
- [ ] ✅ Sign in with email/password
- [ ] ✅ See your avatar in the header
- [ ] ✅ Access your profile page at `/profile`
- [ ] ✅ Sign out successfully
- [ ] ✅ Get redirected to sign-in when accessing protected routes

## 🎉 You're Done!

Your app now has:
- ✅ Email/password authentication
- ✅ User profiles
- ✅ Protected routes
- ✅ Session management
- ✅ Sign in/sign up/sign out flows

## 🐛 Troubleshooting

### Can't sign in?
- [ ] Check all three keys are in `.env`
- [ ] Restart dev server: `Ctrl+C` then `npm run dev`
- [ ] Clear browser cache

### Redirect issues?
- [ ] Verify URLs in Stack Auth dashboard match exactly
- [ ] Check browser console for errors

### Email not sending?
- [ ] Stack provides default email service
- [ ] Check spam folder
- [ ] Verify email settings in Stack dashboard

## 📚 Need Help?

- **Quick Start:** [docs/AUTHENTICATION_QUICKSTART.md](docs/AUTHENTICATION_QUICKSTART.md)
- **Full Guide:** [docs/STACK_AUTH_SETUP.md](docs/STACK_AUTH_SETUP.md)
- **Implementation Details:** [AUTHENTICATION_IMPLEMENTATION.md](AUTHENTICATION_IMPLEMENTATION.md)
- **Stack Auth Docs:** https://docs.stack-auth.com/
- **Stack Auth Discord:** https://discord.gg/stack-auth

---

**Total Time:** ~5 minutes ⚡
**Difficulty:** Easy 🟢
**Result:** Production-ready authentication 🎉
