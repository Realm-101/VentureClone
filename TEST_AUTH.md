# Test Authentication

## Quick Test in Browser Console

Open your browser console (F12) on your deployed site and run:

```javascript
// Test 1: Check if auth endpoint exists
fetch('/api/auth/me')
  .then(r => r.json())
  .then(data => console.log('Auth endpoint response:', data))
  .catch(err => console.error('Auth endpoint error:', err))

// Test 2: Try to register
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'test@example.com', 
    password: 'password123' 
  })
})
  .then(r => r.json())
  .then(data => console.log('Register response:', data))
  .catch(err => console.error('Register error:', err))
```

## What You Should See

### Test 1 Response:
```json
{
  "error": "Not authenticated"
}
```
This is GOOD! It means the endpoint works.

### Test 2 Response:
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "username": "test@example.com"
  }
}
```
This means registration works!

## If You See Errors

### 404 Error
- Auth routes not registered
- Check Render logs

### 500 Error
- Database connection issue
- Session store issue
- Check Render logs for details

### CORS Error
- Should not happen (same origin)
- Check if API is on different domain

## Manual Test

1. Go to: `https://your-app.onrender.com/auth`
2. Should see sign-in form
3. Click "Sign up"
4. Enter email and password
5. Click "Create Account"
6. Should redirect to `/home`
7. Should see email in header

## Current Issue

The orange circle you see is likely:
- A loading state that never resolves
- Or an empty avatar fallback

The fix I just pushed should show "Sign In" button instead.

## After Pushing

```bash
git add .
git commit -m "Fix UserMenu to show Sign In button properly"
git push
```

Wait for Render to deploy, then refresh and you should see "Sign In" button!
