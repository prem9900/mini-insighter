# Authentication Setup & Troubleshooting

## Common Issues and Solutions

### Issue 1: "Invalid login credentials" or signup not working

**Solution:** Check your Supabase email confirmation settings.

1. Go to your Supabase Dashboard: https://sdpkcglxkdbozkkoglor.supabase.co
2. Navigate to **Authentication** > **Settings**
3. Look for **"Enable email confirmations"**
4. For development, you can **disable** this to allow instant signup
5. Click **Save**

### Issue 2: Service Role Key Error

Your `.env.local` file has the same key for both `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`. 

**To fix:**
1. Go to your Supabase Dashboard
2. Navigate to **Settings** > **API**
3. Copy the **service_role** key (NOT the anon key)
4. Update your `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

**Important:** The service role key should be different from the anon key and should NEVER be exposed to the frontend.

### Issue 3: Redirect loops or authentication not persisting

**Solution:** The SessionHandler is working correctly, but make sure:
1. Cookies are enabled in your browser
2. You're not in incognito/private mode
3. Clear browser cache and cookies for localhost

### Issue 4: "User already registered" error

If you see this error when trying to sign up:
1. The email is already in use
2. Try logging in instead with `/login`
3. Or use a different email address

## Testing Authentication

### Test Signup:
1. Go to `http://localhost:3000/signup`
2. Enter email: `test@example.com`
3. Enter password: `password123` (min 6 characters)
4. Click "Create Account"

**Expected behavior:**
- If email confirmation is **disabled**: You'll be redirected to `/dashboard`
- If email confirmation is **enabled**: You'll see a success message asking you to check email

### Test Login:
1. Go to `http://localhost:3000/login`
2. Enter your registered email and password
3. Click "Sign In"

**Expected behavior:**
- Successful login redirects to `/dashboard`
- Failed login shows error message

## Quick Fix for Development

To make signup work immediately without email confirmation:

1. **Disable email confirmation in Supabase:**
   - Dashboard > Authentication > Settings
   - Uncheck "Enable email confirmations"
   - Save

2. **Restart your dev server:**
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

3. **Test signup again** - you should be auto-logged in and redirected to dashboard

## Environment Variables Checklist

Make sure your `.env.local` has:

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://sdpkcglxkdbozkkoglor.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Must be different from anon key!

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# BigQuery (Optional for now)
GOOGLE_APPLICATION_CREDENTIALS=./credentials/bigquery-key.json
GOOGLE_CLOUD_PROJECT=your_project_id
```

## Still Having Issues?

If you're still experiencing problems:

1. **Check Supabase Dashboard Logs:**
   - Go to Authentication > Logs
   - Look for failed signup/login attempts
   - Check the error messages

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for any JavaScript errors
   - Check Network tab for failed API calls

3. **Verify Supabase URL:**
   - Make sure the URL in `.env.local` matches your project URL
   - No trailing slash

4. **Test Supabase Connection:**
   - Try logging in to Supabase Dashboard
   - Verify your project is active

## Manual User Creation (Workaround)

If signup still doesn't work, you can create a user manually:

1. Go to Supabase Dashboard
2. Navigate to **Authentication** > **Users**
3. Click **"Add user"**
4. Enter email and password
5. Click **"Create user"**
6. Now you can login with those credentials

## Next Steps After Authentication Works

Once you can successfully sign up and log in:
1. ✅ You'll see the dashboard
2. ✅ You can create projects
3. ⚠️ You'll need to run Supabase migrations to create database tables
4. ⚠️ You'll need to link BigQuery datasets to use the chat feature
