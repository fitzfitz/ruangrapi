# Frontend Auth Session Plan

## 1. Status

Status: planning only.

This document plans the first frontend auth/session implementation steps for RuangRapi after the backend onboarding RPC and focused RPC behavior tests passed locally.

It does not implement source code, routes, auth UI, signup, login, onboarding forms, Supabase migrations, SQL files, package changes, or product features.

Implementation remains locked until a separate owner-approved implementation task defines the exact file scope.

## 2. Purpose

The first frontend auth/session implementation should let the app understand the current account state before normal app screens and domain queries grow further.

The app should answer:

1. Is there a current Supabase Auth session?
2. If a session exists, does the authenticated user have a `profiles` row?
3. If a profile exists, can the app load the referenced organization?
4. Which app state should be shown next?

This plan covers session/profile/organization state only. Auth screens, onboarding screens, routing, and product workflows remain separate tasks.

## 3. Current Context

Already available:

- Existing Supabase client wrapper.
- Existing app provider skeleton.
- Existing TanStack Query provider.
- Basic static app layout shell.
- Dashboard shell placeholder.
- Validated `public.complete_onboarding` RPC.
- Locally passed focused onboarding RPC behavior tests.

Approved frontend decisions for this area:

- Use Supabase Auth session from the existing Supabase client.
- Use TanStack Query for profile and organization server state.
- Do not add Redux, Zustand, or another global state library.
- Do not implement React Router yet unless planned separately.
- Do not add auth UI in this planning task.

## 4. Responsibilities

### Supabase Auth session state

The app initialization layer should be responsible for:

- Reading the initial Supabase Auth session from the existing Supabase client.
- Subscribing to Supabase Auth state changes.
- Exposing a small session state to the app tree.
- Clearing user-specific query data when the user signs out.
- Avoiding organization-scoped queries until a valid profile and organization are available.

The session state should represent only authentication state. It should not store domain data or replace TanStack Query.

### Profile server state

The identity module should own the current user profile query when implementation begins.

The profile query should:

- Run only when a Supabase Auth user id is available.
- Load the current user's own row from `public.profiles`.
- Treat a missing profile as an expected onboarding-needed state, not as a fatal application crash.
- Respect RLS by querying only through the authenticated Supabase client.
- Return only fields needed for app identity context at first: `id`, `organization_id`, `full_name`, and `role`.

### Organization server state

The identity module should also own the current organization query when implementation begins.

The organization query should:

- Run only after a profile with `organization_id` is available.
- Load the organization referenced by `profiles.organization_id`.
- Respect RLS by querying only through the authenticated Supabase client.
- Return only fields needed for app identity context at first: `id` and `name`.
- Treat a failed or missing organization lookup as a blocking account setup error.

## 5. App State Model

The first implementation can use a small derived app state instead of a new state library.

Recommended derived states:

1. `checking_session` — the app is reading the initial Supabase Auth session.
2. `logged_out` — there is no active session.
3. `checking_profile` — there is a session and the app is loading the user's profile.
4. `needs_onboarding` — there is a session but no profile row exists.
5. `checking_organization` — there is a profile and the app is loading its organization.
6. `ready` — there is a session, profile, and organization.
7. `account_setup_error` — profile exists but organization cannot be loaded.

This state can be derived from the session provider and TanStack Query results. It does not require a separate global store.

## 6. Behavior by Account State

### User is logged out

Expected behavior:

- Do not run profile, organization, or organization-scoped domain queries.
- Show a simple logged-out placeholder in the current static shell until a separate auth UI task is approved.
- Do not create signup or login UI in the first auth/session implementation unless separately approved.

### User is logged in but has no profile

Expected behavior:

- Treat the user as authenticated but not onboarded.
- Do not show normal app content or dashboard data.
- Do not run organization-scoped domain queries.
- Show a simple onboarding-needed placeholder until a separate onboarding UI task is approved.
- Future onboarding UI should call `public.complete_onboarding` with `organization_name` and `full_name`.

### User has profile and organization

Expected behavior:

- Treat the user as ready for normal app context.
- Make the current profile and organization available to app shell composition.
- Allow the existing dashboard shell placeholder to render.
- Future domain queries should include organization-aware query keys and rely on RLS for enforcement.

### Profile exists but organization lookup fails

Expected behavior:

- Show a blocking account setup error.
- Do not continue to normal app content.
- Do not run organization-scoped domain queries.
- In development, log enough detail to diagnose a profile/organization mismatch, missing organization row, or RLS issue.
- User-facing copy should remain minimal until a separate copy/UI task is approved.

## 7. TanStack Query Planning

Recommended initial query ownership:

```txt
src/modules/identity/
  queries.ts
  types.ts
```

Do not create these files until the implementation task is approved.

Recommended query keys:

- Current profile: `['identity', 'current-profile', userId]`
- Current organization: `['identity', 'current-organization', organizationId]`

Guidelines:

- Keep query keys stable and explicit.
- Enable the profile query only when `userId` exists.
- Enable the organization query only when `organizationId` exists.
- Keep query functions small and Supabase-specific.
- Do not put domain module data in the identity queries.
- Do not broadly invalidate all queries unless sign-out requires clearing user-specific cache.

## 8. First Small Implementation Tasks

These tasks should be implemented separately after owner approval.

### Task 1: Add auth session provider

Purpose:

- Add a small provider under the app initialization layer that reads the initial Supabase session and listens for auth changes.

Expected scope:

- Use the existing Supabase client wrapper.
- Expose session, user, loading state, and sign-out cache cleanup behavior if needed.
- Do not add auth UI.
- Do not add routes.
- Do not add a global state library.

### Task 2: Add identity profile query planning implementation

Purpose:

- Add the first identity module query for the current user's profile.

Expected scope:

- Create only the identity files needed for profile types/query functions/hooks.
- Query `public.profiles` for the authenticated user's own profile.
- Handle missing profile as `needs_onboarding`.
- Do not create onboarding UI.

### Task 3: Add identity organization query planning implementation

Purpose:

- Add the organization lookup that depends on the loaded profile.

Expected scope:

- Query `public.organizations` by the profile's `organization_id`.
- Treat missing or blocked organization reads as `account_setup_error`.
- Do not implement organization settings or product features.

### Task 4: Wire derived app state into the existing shell

Purpose:

- Let the current static app shell display basic placeholders for auth/session state.

Expected scope:

- Logged out placeholder.
- Onboarding-needed placeholder.
- Account setup error placeholder.
- Ready state continues to show the existing dashboard shell placeholder.
- No routes, auth forms, signup, login, or onboarding forms.

### Task 5: Validate the implementation

Purpose:

- Confirm the first auth/session implementation compiles and stays within scope.

Expected validation:

```txt
npm run build
npm run lint
npm run format:check
git diff --check
git status --short
```

## 9. Future Separate Tasks

Keep these out of the first auth/session implementation unless separately planned and approved:

- React Router setup.
- Signup UI.
- Login UI.
- Logout UI beyond any minimal provider action needed for session cleanup.
- Onboarding route.
- Onboarding form.
- Calling `public.complete_onboarding` from a form.
- User-facing error copy refinement.
- Protected route structure.
- Organization settings.
- Profile editing UI.
- Product/domain features.

## 10. Remaining Frontend Auth/Session Questions

These questions can be resolved during the next owner-approved implementation task or a focused follow-up planning task:

1. Should the initial implementation expose auth/session through React context, a custom hook, or both?
2. What exact placeholder copy should be shown for logged-out, onboarding-needed, and account setup error states?
3. Should the first implementation include a minimal sign-out action for development testing, or defer all auth actions to the auth UI task?
4. Should user-specific TanStack Query cache be cleared on every auth state change or only on sign-out/user switch?
5. How much developer-only logging should be included for account setup errors?

## 11. Implementation Lock

Implementation is still locked.

A separate owner-approved implementation task is required before creating or modifying source files for:

- Auth/session provider code.
- Identity module query files.
- Shell state wiring.
- Auth UI.
- Signup/login screens.
- Onboarding UI.
- Routes.
- Product features.

No Supabase migrations, SQL files, package changes, or dependency changes are needed for the first frontend auth/session implementation plan.
