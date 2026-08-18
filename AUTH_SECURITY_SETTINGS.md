# Auth Security Configuration

This document outlines the Auth security settings that need to be configured in your Supabase Dashboard.

## Required Configuration Changes

### 1. Auth DB Connection Strategy (CRITICAL)

**Issue:** Auth server is using a fixed connection count (10 connections) instead of percentage-based allocation.

**How to Fix:**
1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **Database** → **Connection Pooling**
3. Look for the **Auth** connection pool settings
4. Change the connection strategy from **Fixed** to **Percentage**
5. Set the percentage to **10-15%** of your total available connections
6. Save the changes

**Why this matters:** Using a fixed connection count means scaling your database instance won't improve Auth server performance. Percentage-based allocation automatically scales with your instance size.

---

### 2. Leaked Password Protection (HIGH PRIORITY)

**Issue:** Password breach detection is currently disabled.

**How to Fix:**
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers** → **Email**
3. Scroll down to **Security** settings
4. Enable **"Leaked Password Protection"**
5. Save the changes

**What this does:** When enabled, Supabase checks user passwords against the HaveIBeenPwned database to prevent users from using compromised passwords. This is a critical security feature that protects your users.

---

### 3. Google Sign-In Provider (REQUIRED FOR GOOGLE AUTH)

**Issue:** Google OAuth provider needs to be configured to enable Google sign-in functionality.

**How to Fix:**
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the provider list
4. Toggle it to **Enabled**
5. You'll need to provide:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)
6. Set the authorized redirect URL to: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
7. Save the changes

**How to get Google OAuth credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted
6. Select **Web application** as the application type
7. Add authorized redirect URIs: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
8. Copy the Client ID and Client Secret to your Supabase settings

---

## Implementation Status

- [x] Added missing foreign key indexes (completed via migration)
- [x] Removed unused indexes (completed via migration)
- [x] Google sign-in UI implemented (completed)
- [x] Forgot password UI implemented (completed)
- [ ] Configure Google OAuth provider (requires Dashboard and Google Cloud Console access)
- [ ] Configure Auth DB connection strategy to percentage-based (requires Dashboard access)
- [ ] Enable leaked password protection (requires Dashboard access)

## Notes

All database-level security issues (unused indexes, foreign key indexes) have been resolved automatically through migrations. The Auth configuration changes require manual updates through the Supabase Dashboard as they are project-level settings that cannot be changed via SQL migrations.

These changes will not affect existing users or functionality - they only improve security and performance.
