# Supabase Security Settings

## Fixed Issues (via Migrations)

The following security issues have been automatically fixed:

1. **Missing Index on feedback.user_id** ✅
   - Added index to improve query performance
   - Migration: `fix_security_issues.sql`

2. **Missing Index on task_roles.role_id** ✅
   - Added index to improve query performance
   - Migration: `add_task_roles_role_id_index.sql`

## Manual Configuration Required

The following security settings must be configured in your Supabase Dashboard. These cannot be set via SQL migrations as they are server-level configurations.

### 1. Auth DB Connection Strategy

**Issue**: Your Auth server uses a fixed connection limit (10 connections) instead of a percentage-based strategy.

**Why This Matters**: If you upgrade your database instance size, the Auth server won't automatically scale its connection pool, limiting performance gains.

**How to Fix**:
1. Go to your Supabase Dashboard
2. Navigate to **Project Settings** → **Database**
3. Scroll to **Connection Pooling** section
4. Under **Auth Configuration**, change from fixed number to percentage-based
5. Recommended: Set to 10-20% of total connections

### 2. Leaked Password Protection

**Issue**: Protection against compromised passwords is currently disabled.

**Why This Matters**: This feature checks passwords against the HaveIBeenPwned database to prevent users from using passwords that have been exposed in data breaches, significantly enhancing account security.

**How to Fix**:
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Policies**
3. Find the **Password Protection** or **Breach Protection** setting
4. Enable **"Check against HaveIBeenPwned database"**
5. Save changes

**Note**: This only affects new password creations and changes, not existing passwords.

## Verification

After making these changes:

1. **Connection Strategy**: Check that your Auth server can scale with database upgrades
2. **Password Protection**: Try creating a test account with a known compromised password (e.g., "password123") - it should be rejected

## Security Best Practices

Beyond these fixes, consider:

- Enable **Email Confirmations** if not already enabled
- Set up **Rate Limiting** on auth endpoints
- Configure **Session Timeouts** appropriately
- Enable **MFA** (Multi-Factor Authentication) for sensitive accounts
- Regularly review **RLS Policies** for data access
- Monitor **Audit Logs** for suspicious activity
