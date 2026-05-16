# Auth and Onboarding Plan

## 1. Status

Status: approved at planning level.

This document plans the first RuangRapi auth and onboarding flow for the MVP. It does not implement auth UI, signup, login, routes, source code, migrations, SQL files, Supabase RPC functions, Edge Functions, or product features.

The owner-approved planning decisions in this document are ready to guide future work. Implementation remains locked until separate owner-approved implementation and migration tasks.

## 2. Purpose

The current database and RLS model is intentionally conservative:

- Users belong to one organization for the MVP.
- `profiles.organization_id` determines organization access.
- Users may read their own profile.
- Users may update only their own `profiles.full_name`.
- Users may not update their own `organization_id` or `role`.
- Users may read only the organization referenced by their own profile.
- Owner/admin have identical database access for MVP.

This creates a bootstrap problem: a newly authenticated user has an auth identity, but does not yet have a `profiles` row or an organization. Without a profile, organization-scoped RLS cannot know which organization the user belongs to.

This document defines the intended MVP onboarding path for that first organization/profile creation.

## 3. Bootstrap Problem

Supabase Auth creates and manages the authenticated user identity in `auth.users`.

RuangRapi application access depends on `public.profiles`:

- `profiles.id` matches the authenticated Supabase user id.
- `profiles.organization_id` points to the user's organization.
- `profiles.role` is `owner` or `admin`.

A new user after signup may be authenticated but still have no profile. In that state:

1. The app can identify the authenticated user through Supabase Auth.
2. The app cannot yet resolve an organization context from `profiles.organization_id`.
3. Organization-scoped reads and writes should not proceed.
4. The user should be guided into onboarding instead of normal app screens.

Because RLS is conservative, direct client-side insertion into both `organizations` and `profiles` is not the approved bootstrap path. The MVP should use a secure database RPC for onboarding bootstrap, designed in a separate owner-approved migration task.

## 4. Recommended MVP Flow

The MVP should use Supabase Auth email/password first. Magic link can be considered later, but is not required for the first MVP.

Recommended high-level flow:

1. User signs up or logs in with Supabase Auth.
2. If Supabase Auth configuration supports email confirmation, require email confirmation before onboarding starts.
3. App checks the authenticated session.
4. If no authenticated session exists, show the future auth entry screen.
5. If a session exists, app checks whether a profile exists for the authenticated user.
6. If no profile exists, route the user to onboarding.
7. If a profile exists, load the user's organization context.
8. After organization context is available, allow normal app access.

This task does not create those screens, routes, queries, or auth/session helpers.

## 5. First Organization and Owner Profile Creation

For MVP onboarding, a new user without a profile should create exactly one organization and one owner profile.

Onboarding should collect only the minimum needed fields:

- Organization name.
- User full name.

On successful onboarding, the system should create:

1. One `organizations` row.
2. One `profiles` row for the authenticated user.
3. `profiles.role = owner`.
4. `profiles.organization_id` pointing to the new organization.

The result should be a normal MVP account where the user belongs to exactly one organization.

The owner-approved creation mechanism is a secure database RPC. Because the existing RLS model does not allow arbitrary client-side profile/organization writes, the future RPC design must be reviewed as its own migration task before any SQL is written.

## 6. Approved Bootstrap Mechanism

The owner-approved MVP bootstrap approach is a secure database RPC.

### Secure database RPC

Create a carefully scoped database function that an authenticated user can call only when they do not already have a profile. The function would create the organization and owner profile together in one transaction.

Planning expectations:

- It should require an authenticated user.
- It should refuse to run if the user already has a profile.
- It should create only one organization and one owner profile for that user.
- It should set `role = owner` server-side.
- It should not let the client choose arbitrary role or user id values.
- It should validate required names.

No RPC SQL is written in this document.

### Server-side/service-role bootstrap

A server-side/service-role backend layer is not approved for MVP onboarding unless the RPC approach proves insufficient.

Planning expectations:

- Service-role keys must never be exposed to the browser.
- The server-side flow must verify the authenticated user.
- It should refuse to run if the user already has a profile.
- It should set `role = owner` server-side.
- It should create only the minimum required rows.

No server-side flow is implemented in this document.

## 7. Behavior After Login

After a successful login, the app should check whether the authenticated user has a profile.

### If no profile exists

The user should be treated as authenticated but not onboarded.

Expected behavior:

- Do not show normal app screens yet.
- Do not run organization-scoped domain queries yet.
- Send the user to onboarding.
- Allow the user to create one organization and one owner profile through the approved bootstrap mechanism.

### If a profile exists

The user should be treated as onboarded.

Expected behavior:

- Load the user's profile.
- Load the organization referenced by `profiles.organization_id`.
- Use that organization as the app context.
- Proceed to the dashboard shell.

If the profile exists but the organization cannot be read, the app should show a blocking account setup error instead of continuing with missing organization context. In development, log developer details to help diagnose the profile/organization mismatch or RLS issue.

## 8. Behavior After Signup

After signup, behavior may depend on Supabase Auth settings such as email confirmation.

Approved planning rule:

- If Supabase Auth configuration supports email confirmation, require confirmation before onboarding starts.
- If the user is not yet confirmed or does not have an active session, wait until login/session is available.
- Once an authenticated session exists, run the same profile check used after login.
- If no profile exists, show onboarding.
- If a profile exists, continue to normal app context.

The MVP should avoid creating organization/profile rows before the authenticated user identity is clearly available.

## 9. Existing Profile Safety Rules

If a user already has a profile:

- Do not show first-organization onboarding again.
- Do not create another organization for that user.
- Do not allow the user to change `organization_id` from the client.
- Do not allow the user to change `role` from the client.
- Allow only safe profile editing, starting with `full_name`, consistent with the RLS strategy.

This preserves the one-organization-per-user MVP model.

## 10. MVP Out of Scope

The auth/onboarding MVP should not include:

- Multi-organization membership.
- Organization switching.
- Invitation system.
- Admin user management screens.
- Tenant app login.
- Tenant mobile app access.
- Enterprise role and permission tables.
- Enterprise permissions.
- Role-specific database permissions between owner and admin.
- Marketplace access.
- Payment gateway access.
- Complex approval workflows.
- Public self-join into an existing organization.

These can be reconsidered later only through owner-approved planning and documentation updates.

## 11. Future Implementation Tasks

Recommended future implementation sequence:

1. Plan the exact secure database RPC design in a separate owner-approved migration task.
2. In that separate task, define the exact migration/RLS changes needed for the onboarding bootstrap RPC.
3. Only after owner approval for that RPC migration task, create the migration SQL.
4. Add auth/session state handling in the app shell in a separate implementation task.
5. Add a profile lookup query for the authenticated user.
6. Add an onboarding route/screen for users without a profile.
7. Add an onboarding form that collects organization name and user full name.
8. Wire onboarding submission to the approved RPC bootstrap mechanism.
9. Add safe handling for already-onboarded users.
10. Add blocking account setup error handling when a profile exists but organization lookup fails.
11. Add validation and tests appropriate to the chosen implementation path.

Each implementation step should be done as a small separate task.

## 12. Remaining Auth and Onboarding Questions

Resolved owner-approved decisions:

1. Use a secure database RPC for MVP onboarding bootstrap.
2. Do not introduce a server-side/service-role backend layer for onboarding in the MVP unless the RPC approach proves insufficient.
3. Use Supabase Auth email/password first.
4. Require email confirmation before onboarding starts if Supabase Auth configuration supports it.
5. After successful onboarding, send the user to the dashboard shell.
6. If a profile exists but organization lookup fails, show a blocking account setup error and log developer details in development.
7. Magic link can be considered later, but is not required for first MVP.
8. Multi-organization membership, invitation system, tenant login, and enterprise permissions remain out of scope.

Remaining questions before implementation:

1. Exact RPC function name, input fields, validation behavior, grants, and failure cases.
2. Exact migration and RLS changes required for the RPC bootstrap path.
3. Exact user-facing copy for the blocking account setup error.

The next gate is a separate owner-approved RPC design and migration task. Until that task is approved, do not write SQL, create migrations, modify existing migrations, create SQL files, or implement onboarding code.

## 13. Implementation Lock

This document is planning only.

Do not implement until a separate owner-approved task defines the exact scope for:

- Auth UI.
- Signup/login flows.
- Onboarding routes.
- Organization/profile bootstrap mechanism.
- RPC or server-side/service-role implementation.
- Any migration or SQL changes.

Next gate: secure onboarding RPC design and migration planning must happen in a separate owner-approved migration task before any SQL or implementation work begins.
