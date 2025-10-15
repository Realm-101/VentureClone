# Authentication Troubleshooting

## ✅ Authentication IS Implemented!

Your app has custom email/password authentication. If you're not seeing it, here's how to troubleshoot:

## Quick Checks

### 1. Do You See "Sign In" Button?

**YES** → Click it, you should go to `/auth` page
**NO** → Check browser console for errors

### 2. Environment Variables on Render

Make sure these are set:

```env
DATABASE_URL=postgresql://...  ✅ (should be set)
SESSION_SECRET=<random-string>  ⚠️ (did you set this?)
NODE_ENV=production
STORAGE=db
```

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Check Browser Console

Open browser console (F12) and look for:
- ❌ 404 errors on `/api/auth/*`
- ❌ CORS errors
- ❌ Network errors

### 4. Test the Auth Endpoints

Open browser console and run:

```javascript
// Test if auth endpoint exists
fetch('/api/auth/me')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Should return: `{error: "Not authenticated"}` (this is good!)

## Common Issues

### Issue 1: "Sign In" Button Not Showing

**Cause:** UserMenu component not rendering
**Fix:** Check that `client/src/components/user-menu.tsx` is imported in `minimal-dashboard.tsx`

**Test:**
```javascript
// In browser console
document.querySelector('button')?.textContent
// Should include "Sign In"
```

### Issue 2: Clicking "Sign In" Does Nothing

**Cause:** Route not registered
**Fix:** Verify `/auth` route exists in `App.tsx`

**Test:** Manually go to `https://yourapp.com/auth`

### Issue 3: Can't Create Account

**Possible causes:**
1. `SESSION_SECRET` not set on Render
2. Database connection issue
3. `sessions` table doesn't exist

**Fix:**
1. Set `SESSION_SECRET` environment variable
2. Check Render logs for database errors
3. Run migration to create sessions table

### Issue 4: "Sign In" Shows But Registration Fails

**Check Render logs for:**
- Database connection errors
- Session store errors
- bcrypt errors

## Manual Test Steps

### 1. Visit Your App

Go to: `https://your-app.onrender.com`

### 2. Look for "Sign In" Button

Should be in the top-right header

### 3. Click "Sign In"

Should navigate to `/auth` page with sign-in form

### 4. Click "Sign Up"

Should show registration form

### 5. Create Account

- Enter email: `test@example.com`
- Enter password: `password123` (8+ chars)
- Click "Create Account"

### 6. Should Redirect to `/home`

And show your email in the header

## Debug Commands

### Check if auth files exist in build:

```bash
# On Render, in the shell:
ls -la dist/public/assets/ | grep auth
# Should show: auth-*.js
```

### Check if auth routes are registered:

```bash
# In browser console:
fetch('/api/auth/me').then(r => console.log(r.status))
# Should show: 401 (Unauthorized) - this is correct!
```

### Check database connection:

```bash
# On Render, check logs for:
# "Session store connected" or similar
```

## What Should Work

1. ✅ "Sign In" button in header
2. ✅ Click → go to `/auth` page
3. ✅ Sign up form with email/password
4. ✅ Create account
5. ✅ Automatic login
6. ✅ Redirect to `/home`
7. ✅ See email in header
8. ✅ Click email → go to `/profile`
9. ✅ Click logout → sign out

## Still Not Working?

### Check These Files Were Deployed:

1. `client/src/pages/auth.tsx` - Sign in/up page
2. `client/src/hooks/use-auth.ts` - Auth hook
3. `client/src/components/user-menu.tsx` - User menu
4. `server/services/auth.ts` - Auth service
5. `server/routes.ts` - Auth endpoints

### Verify in Render Logs:

Look for:
```
=== REGISTERING MINIMAL ROUTES ===
```

Should show auth routes being registered.

## Need More Help?

1. **Check Render logs** - Look for errors
2. **Check browser console** - Look for network errors
3. **Test endpoints manually** - Use browser console
4. **Verify environment variables** - Especially `SESSION_SECRET`

## Quick Fix

If nothing works, try:

1. **Clear Render cache:**
   - Go to Render dashboard
   - Manual Deploy → Clear build cache & deploy

2. **Verify environment variables:**
   - Check `SESSION_SECRET` is set
   - Check `DATABASE_URL` is correct

3. **Check database:**
   - Verify `users` table exists
   - Verify `sessions` table exists

## Success Indicators

You'll know it's working when:
- ✅ "Sign In" button appears
- ✅ Clicking it goes to `/auth`
- ✅ Can create account
- ✅ Can sign in
- ✅ Email shows in header
- ✅ Can view profile
- ✅ Can sign out

**Authentication IS implemented - just need to find why it's not showing!**
