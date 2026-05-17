# Onboarding RPC Test Plan

## 1. Status

Status: manual local test plan only.

This document defines how to manually validate `public.complete_onboarding` against the local Supabase stack before frontend auth/onboarding UI is implemented.

It does not change SQL, create migrations, modify migration files, create source code, create scripts, modify package files, create auth UI, create signup/login screens, create routes, add seed data, add test data, or implement product features.

## 2. Purpose

The onboarding RPC creates the first organization and owner profile for an authenticated Supabase Auth user who does not yet have a `public.profiles` row.

This test plan verifies that the RPC works locally and preserves the conservative RLS model before any frontend onboarding UI is built.

## 3. Prerequisites

Before running these manual checks:

1. Docker is running.
2. Supabase local stack is running.
3. `supabase db reset` passes successfully.
4. The local database includes:
   - `supabase/migrations/20260516165311_initial_schema.sql`
   - `supabase/migrations/20260516231814_complete_onboarding_rpc.sql`
5. Local Supabase API URL and anon key are available from `supabase status`.
6. Any access tokens, anon keys, local service-role keys, test emails, and test passwords stay local and are not committed.

Use disposable local test users only. Do not add seed files or committed test data for this plan.

## 4. Evidence to Record

For each test run, record local-only evidence in a scratch note, issue comment, or terminal log that is not committed unless explicitly approved.

Recommended evidence:

- Date and time of test run.
- Git commit or working tree state being tested.
- Confirmation that `supabase db reset` passed.
- Local test user email or identifier.
- Auth user id.
- RPC response status and response body excerpt.
- Created `organization_id`.
- Created `profile_id`.
- Query or API response excerpts proving profile and organization visibility.
- Error response excerpts for expected failures.
- Any unexpected warnings, stack traces, or PostgREST/Supabase errors.

Do not record real secrets or reusable access tokens in committed files.

## 5. Manual Test Setup

1. Start local Supabase if it is not already running.
2. Run `supabase db reset` and confirm it passes.
3. Get local Supabase connection details from `supabase status`.
4. Create a disposable local Supabase Auth user using Supabase Studio or a one-off local Auth API call.
5. Sign in as that user and obtain a user access token.
6. Keep the access token local and temporary.

The user should start with an auth identity but no matching row in `public.profiles`.

## 6. Test Cases

### TC-01 Anonymous call fails

Purpose:

Verify that unauthenticated callers cannot complete onboarding.

Steps:

1. Call `public.complete_onboarding` without a user access token.
2. Use only anonymous/local API context.
3. Submit sample input values such as:
   - `organization_name`: `Test Kos Anonymous`
   - `full_name`: `Anonymous User`

Expected result:

- The call fails.
- No organization row is created.
- No profile row is created.
- The failure clearly indicates that authentication is required or that execution is not allowed for the caller.

Failure signals:

- The call succeeds without a user access token.
- Any organization/profile row is created for an anonymous call.
- The RPC is executable through broad public access.

Evidence to record:

- Request type used.
- Response status.
- Error message excerpt.
- Confirmation that no new organization/profile row was created for the anonymous attempt.

### TC-02 Authenticated user can call `public.complete_onboarding` once

Purpose:

Verify that a new authenticated user without a profile can complete onboarding exactly once.

Steps:

1. Sign in as the disposable local test user.
2. Call `public.complete_onboarding` with the user access token.
3. Submit valid input values such as:
   - `organization_name`: `Test Kos Owner`
   - `full_name`: `Test Owner`
4. Capture the returned payload.

Expected result:

- The call succeeds once.
- The response includes:
  - `organization_id`
  - `profile_id`
  - `role = owner`
  - `onboarding_completed = true`
- `profile_id` matches the authenticated user's auth user id.

Failure signals:

- The call fails for a valid authenticated user without a profile.
- The response omits one of the approved fields.
- `role` is not `owner`.
- `onboarding_completed` is not `true`.
- `profile_id` does not match the authenticated user id.

Evidence to record:

- Auth user id.
- Response status.
- Response body excerpt.
- Returned `organization_id` and `profile_id`.

### TC-03 Duplicate authenticated call fails

Purpose:

Verify that the MVP hard-fails if the same authenticated user tries onboarding again.

Steps:

1. Reuse the same authenticated user from TC-02.
2. Call `public.complete_onboarding` again with valid input values.

Expected result:

- The second call fails.
- No second organization is created for the same user.
- The failure clearly indicates that the user has already completed onboarding.

Failure signals:

- The second call succeeds.
- A second organization is created for the same authenticated user.
- The RPC returns an idempotent success payload instead of hard-failing.

Evidence to record:

- Response status.
- Error message excerpt.
- Confirmation that there is still only one profile for the user.
- Confirmation that no extra organization was created by the duplicate call.

### TC-04 Organization row is created

Purpose:

Verify that the successful onboarding call creates one organization row.

Steps:

1. Use the `organization_id` returned by TC-02.
2. Inspect the local database or query through an appropriate local admin context.
3. Confirm the organization row exists.

Expected result:

- Exactly one `public.organizations` row exists for the returned `organization_id`.
- `name` equals the trimmed organization name submitted in TC-02.

Failure signals:

- No organization row exists for the returned id.
- More than one organization appears to have been created by one successful onboarding call.
- The stored organization name is blank or not trimmed.

Evidence to record:

- Returned `organization_id`.
- Organization row excerpt showing `id` and `name`.

### TC-05 Profile row is created for `auth.uid()`

Purpose:

Verify that the successful onboarding call creates one profile row for the authenticated user.

Steps:

1. Use the `profile_id` returned by TC-02.
2. Compare it with the authenticated user's auth user id.
3. Inspect the local database or query through an appropriate local admin context.

Expected result:

- Exactly one `public.profiles` row exists for the authenticated user id.
- `profiles.id` equals the authenticated user's auth user id.
- `profiles.full_name` equals the trimmed full name submitted in TC-02.

Failure signals:

- No profile row exists for the user.
- `profiles.id` differs from the auth user id.
- More than one profile is created for the same user.
- The stored full name is blank or not trimmed.

Evidence to record:

- Auth user id.
- Profile row excerpt showing `id`, `organization_id`, `full_name`, and `role`.

### TC-06 Profile role is `owner`

Purpose:

Verify that onboarding assigns the server-side MVP owner role.

Steps:

1. Inspect the profile row created in TC-05.
2. Check the `role` value.

Expected result:

- `profiles.role = owner`.

Failure signals:

- Role is null.
- Role is anything other than `owner`.
- Role can be influenced by client input.

Evidence to record:

- Profile row excerpt showing `role = owner`.

### TC-07 Profile organization points to the created organization

Purpose:

Verify that the profile is attached to the organization created by the same onboarding call.

Steps:

1. Compare the returned `organization_id` from TC-02 with `profiles.organization_id` from TC-05.
2. Confirm they match.

Expected result:

- `profiles.organization_id` equals the returned `organization_id`.

Failure signals:

- `profiles.organization_id` is null.
- `profiles.organization_id` points to a different organization.
- The profile is created without a valid organization relationship.

Evidence to record:

- Returned `organization_id`.
- Profile row excerpt showing matching `organization_id`.

### TC-08 Authenticated user can read their own profile after onboarding

Purpose:

Verify that normal profile RLS works after onboarding.

Steps:

1. Use the onboarded user's access token.
2. Query `public.profiles` for the user's own profile through the normal local API path.

Expected result:

- The user can read exactly their own profile.
- The response includes the expected `id`, `organization_id`, `full_name`, and `role`.

Failure signals:

- The user cannot read their own profile after successful onboarding.
- The user can read unrelated profiles.
- The response returns no profile even though onboarding succeeded.

Evidence to record:

- Response status.
- Response body excerpt for the user's own profile.

### TC-09 Authenticated user can read their own organization after onboarding

Purpose:

Verify that normal organization RLS works after onboarding.

Steps:

1. Use the onboarded user's access token.
2. Query `public.organizations` for the returned `organization_id` through the normal local API path.

Expected result:

- The user can read their own organization.
- The response includes the expected organization id and name.

Failure signals:

- The user cannot read their own organization after successful onboarding.
- The user can read organizations unrelated to their profile.
- The response returns no organization even though onboarding succeeded.

Evidence to record:

- Response status.
- Response body excerpt for the user's organization.

### TC-10 User cannot update their own `organization_id` or `role`

Purpose:

Verify that the user cannot change protected identity fields from the client.

Steps:

1. Use the onboarded user's access token.
2. Attempt to update `profiles.organization_id` through the normal local API path.
3. Attempt to update `profiles.role` through the normal local API path.
4. Re-read the profile row.

Expected result:

- Updating `organization_id` fails.
- Updating `role` fails.
- The profile row still has the original `organization_id`.
- The profile row still has `role = owner`.

Failure signals:

- The user can update `organization_id`.
- The user can update `role`.
- The profile moves to another organization.
- The profile role changes through a client request.

Evidence to record:

- Response status and error excerpt for each blocked update.
- Profile row excerpt after the attempts showing unchanged `organization_id` and `role`.

### TC-11 User can update only their own `profiles.full_name` if allowed by current grants/policies

Purpose:

Verify that the current MVP profile update path allows only safe self-editing of `full_name`.

Steps:

1. Use the onboarded user's access token.
2. Update only `profiles.full_name` for the user's own profile through the normal local API path.
3. Re-read the user's profile.
4. If possible, attempt to update another user's `full_name` and confirm it is blocked by RLS.

Expected result:

- Updating the user's own `full_name` succeeds under the current grants/policies.
- The new full name is stored.
- Protected fields remain unchanged.
- The user cannot update another user's profile.

Failure signals:

- The user cannot update their own `full_name` despite the current MVP grant/policy expecting it.
- Updating `full_name` also changes protected fields.
- The user can update another user's profile.

Evidence to record:

- Response status for the allowed `full_name` update.
- Profile row excerpt showing the updated `full_name`.
- Response status and error or empty result for any blocked cross-user update attempt.

## 7. Overall Pass Criteria

The onboarding RPC behavior test run passes when:

1. Anonymous RPC call fails.
2. Authenticated onboarding succeeds once.
3. Duplicate onboarding for the same user fails.
4. One organization row is created.
5. One profile row is created for the authenticated user id.
6. Profile role is `owner`.
7. Profile organization points to the created organization.
8. The user can read their own profile after onboarding.
9. The user can read their own organization after onboarding.
10. The user cannot update their own `organization_id` or `role`.
11. The user can update only their own `profiles.full_name` under current grants/policies.

## 8. Overall Failure Signals

Stop and investigate before frontend onboarding work if any of these occur:

- `supabase db reset` fails.
- Anonymous callers can execute onboarding successfully.
- Authenticated onboarding fails for a new user without a profile.
- Duplicate onboarding succeeds.
- More than one organization/profile pair is created for one user.
- Created profile does not use the auth user id.
- Created profile does not have `role = owner`.
- Created profile points to the wrong organization.
- The onboarded user cannot read their own profile or organization.
- The user can update protected fields such as `organization_id` or `role`.
- The user can read or update another user's profile or organization.

## 9. Notes for Later App Work

This plan validates database/RLS behavior only.

Frontend auth/onboarding work remains separate and should not start from this document alone. After these manual behavior tests pass, the next app task should still be separately scoped and owner-approved, such as adding auth/session state handling or an onboarding form in the identity module.
