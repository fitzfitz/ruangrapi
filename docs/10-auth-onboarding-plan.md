# Auth and Onboarding Plan

## 1. Status

Status: planning only.

This document plans the first RuangRapi auth and onboarding flow for the MVP. It does not implement auth UI, signup, login, routes, source code, migrations, SQL files, Supabase RPC functions, Edge Functions, or product features.

Implementation remains locked until a separate owner-approved task.

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

Because RLS is conservative, direct client-side insertion into both `organizations` and `profiles` may not be sufficient or appropriate. The implementation may need a secure bootstrap mechanism later, such as an owner-approved RPC or server-side/service-role flow.

## 4. Recommended MVP Flow

The MVP should use Supabase Auth for authentication.

Recommended high-level flow:

1. User signs up or logs in with Supabase Auth.
2. App checks the authenticated session.
3. If no authenticated session exists, show the future auth entry screen.
4. If a session exists, app checks whether a profile exists for the authenticated user.
5. If no profile exists, route the user to onboarding.
6. If a profile exists, load the user's organization context.
7. After organization context is available, allow normal app access.

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

The exact creation mechanism is intentionally not implemented in this document. Because the existing RLS model does not allow arbitrary client-side profile/organization writes, the future implementation should explicitly choose and review one safe bootstrap path.

## 6. Bootstrap Mechanism Options for Later Review

A future implementation task should choose one safe bootstrap approach. Options include:

### Option A: Secure database RPC

Create a carefully scoped database function that an authenticated user can call only when they do not already have a profile. The function would create the organization and owner profile together in one transaction.

Planning expectations:

- It should require an authenticated user.
- It should refuse to run if the user already has a profile.
- It should create only one organization and one owner profile for that user.
- It should set `role = owner` server-side.
- It should not let the client choose arbitrary role or user id values.
- It should validate required names.

No RPC SQL is written in this document.

### Option B: Server-side/service-role bootstrap

Use a server-side trusted environment to create the organization and profile with service-role privileges.

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
- Proceed to normal app shell and future domain screens.

If the profile exists but the organization cannot be read, the app should show a safe error state instead of continuing with missing organization context.

## 8. Behavior After Signup

After signup, behavior may depend on Supabase Auth settings such as email confirmation.

Recommended planning rule:

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
- Role-specific database permissions between owner and admin.
- Marketplace access.
- Payment gateway access.
- Complex approval workflows.
- Public self-join into an existing organization.

These can be reconsidered later only through owner-approved planning and documentation updates.

## 11. Future Implementation Tasks

Recommended future implementation sequence:

1. Decide the bootstrap mechanism: secure RPC or server-side/service-role flow.
2. If using RPC, plan the exact migration/RLS changes in a separate owner-approved SQL task.
3. If using a server-side flow, plan the trusted runtime and secret handling before writing code.
4. Add auth/session state handling in the app shell.
5. Add a profile lookup query for the authenticated user.
6. Add an onboarding route/screen for users without a profile.
7. Add an onboarding form that collects organization name and user full name.
8. Wire onboarding submission to the approved bootstrap mechanism.
9. Add safe handling for already-onboarded users.
10. Add validation and tests appropriate to the chosen implementation path.

Each implementation step should be done as a small separate task.

## 12. Remaining Auth and Onboarding Questions

The main planning question before implementation is:

1. Should the bootstrap use a secure database RPC or a server-side/service-role flow?

Secondary questions before UI work:

1. Should signup require email confirmation before onboarding starts?
2. What exact auth methods are enabled for MVP: email/password only, magic link, or both?
3. What should the first post-onboarding destination be: dashboard shell, property setup prompt, or another app shell screen?
4. What error copy should be shown when a user has a profile but organization lookup fails?

## 13. Implementation Lock

This document is planning only.

Do not implement until a separate owner-approved task defines the exact scope for:

- Auth UI.
- Signup/login flows.
- Onboarding routes.
- Organization/profile bootstrap mechanism.
- RPC or server-side/service-role implementation.
- Any migration or SQL changes.
