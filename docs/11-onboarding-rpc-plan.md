# Onboarding RPC Plan

## 1. Status

Status: planning only.

This document plans the secure database RPC needed for RuangRapi MVP onboarding bootstrap. It does not implement SQL, create migrations, modify existing migration SQL, create source code, create auth UI, create signup/login screens, create routes, or implement product features.

The RPC implementation remains locked until a separate owner-approved migration implementation task.

## 2. Purpose

The current RuangRapi database and RLS model depends on `profiles.organization_id` to determine which organization a signed-in user can access.

That creates a bootstrap problem for a newly authenticated Supabase Auth user:

1. Supabase Auth can identify the user.
2. The user does not yet have a `public.profiles` row.
3. Without a profile, the app cannot resolve `profiles.organization_id`.
4. Without an organization context, organization-scoped RLS policies cannot allow normal application access.
5. Direct client-side insertion into both `organizations` and `profiles` is not the approved bootstrap path because the existing model keeps profile and organization access conservative.

The planned RPC should solve only this first-account bootstrap problem by creating exactly one organization and one owner profile for the authenticated user.

## 3. Approved Context

The plan follows the approved auth and onboarding direction:

- Use Supabase Auth email/password first.
- Require email confirmation before onboarding starts if the Supabase Auth configuration supports it.
- If an authenticated user has no profile, send them to onboarding.
- Onboarding collects only the minimum required fields.
- Onboarding creates one organization and one owner profile.
- Use a secure database RPC for MVP onboarding bootstrap.
- Do not introduce a server-side/service-role backend layer for MVP unless the RPC approach proves insufficient.

## 4. Proposed RPC Name

Proposed function name:

- `public.complete_onboarding`

Reasoning:

- The name describes the user-facing lifecycle step rather than low-level table operations.
- It keeps the implementation focused on completing onboarding once, not on general organization or profile creation.
- It can be called from the future onboarding screen after the user is authenticated and has submitted the minimum required fields.

## 5. Proposed Inputs

The RPC should accept only the fields the onboarding form needs:

- `organization_name`
- `full_name`

The RPC should not accept:

- `user_id`
- `organization_id`
- `role`
- arbitrary profile ids
- invitation ids
- tenant ids
- organization membership data
- permission data

The current user must be derived from Supabase Auth context inside the database function, conceptually through the authenticated request identity.

## 6. Proposed Output

The RPC should return a small success payload that lets the app continue to the normal app context.

Recommended payload fields:

- `organization_id`
- `profile_id`
- `role`

The role should be returned as `owner` after the server-side creation succeeds.

The payload should not return unrelated business data, tenant data, dashboard metrics, or any broader organization records.

## 7. Validation Rules

The RPC should validate inputs before creating rows.

Recommended validation rules:

1. The caller must be authenticated.
2. `organization_name` is required.
3. `organization_name` must not be blank after trimming whitespace.
4. `full_name` is required.
5. `full_name` must not be blank after trimming whitespace.
6. Input values should be stored in normalized trimmed form.
7. The authenticated user must not already have a profile.
8. The RPC must not accept or trust a client-provided role.
9. The RPC must not accept or trust a client-provided user id.
10. The RPC must set `profiles.role` to `owner` server-side.

Length limits can be added during SQL implementation if the owner approves exact limits. Until then, required non-blank strings are the minimum planning rule.

## 8. Expected Behavior

On successful execution, the RPC should complete onboarding in one database transaction.

Expected successful flow:

1. Confirm the request is from an authenticated user.
2. Resolve the current user id from the auth context.
3. Check whether a profile already exists for that user.
4. Reject immediately if a profile already exists.
5. Validate and trim `organization_name` and `full_name`.
6. Create one `organizations` row using the organization name.
7. Create one `profiles` row where:
   - `profiles.id` is the authenticated user id.
   - `profiles.organization_id` references the newly created organization.
   - `profiles.full_name` is the validated full name.
   - `profiles.role` is `owner`.
8. Return a small success payload containing the new organization/profile identifiers and role.

The organization and profile should be created together atomically. If profile creation fails, the organization creation should not be left behind as an orphan onboarding artifact.

## 9. Failure Cases

The future implementation should fail safely for these cases:

1. Unauthenticated caller.
2. Caller belongs to the anonymous/public role rather than an authenticated user.
3. Missing `organization_name`.
4. Blank `organization_name` after trimming.
5. Missing `full_name`.
6. Blank `full_name` after trimming.
7. The authenticated user already has a profile.
8. Profile insertion would violate the existing `profiles.id` primary key.
9. Organization creation fails.
10. Profile creation fails.
11. The database transaction cannot complete.
12. The function is called with unexpected or malformed input.

Recommended failure behavior:

- Return or raise a clear error that the application can map to onboarding UI states later.
- Do not partially create onboarding records.
- Do not expose internal database details that are unnecessary for users.
- Log or expose enough developer detail in local development to diagnose setup, grants, or RLS issues.

Exact error codes and user-facing copy should be decided during the implementation task.

## 10. Security Rules

The RPC should follow these security rules:

1. It must be callable only by authenticated users.
2. It must not be executable by `anon` or broad `public` access.
3. It must derive the user id from the authenticated database context.
4. It must never accept `user_id` from the client.
5. It must never accept `role` from the client.
6. It must set `role = owner` internally.
7. It must refuse to run when a profile already exists for the authenticated user.
8. It must create only one organization and one owner profile.
9. It must not allow joining an existing organization.
10. It must not create admin profiles through onboarding.
11. It must not create tenants, properties, units, billing records, or other product data.
12. It must not bypass RLS for any general-purpose operation beyond this narrow bootstrap transaction.
13. It should use `SECURITY DEFINER` carefully if required to create the first organization/profile under the conservative RLS model.
14. If `SECURITY DEFINER` is used, it should set a safe `search_path`.
15. Function ownership should be controlled so normal authenticated users cannot alter the function.

## 11. Grants and Execution Access

Conceptually, execution access should be:

- Grant execute to `authenticated` only.
- Do not grant execute to `anon`.
- Do not grant execute broadly to `public`.
- Keep table-level grants conservative and consistent with the existing RLS model.

The implementation task should also verify that any default privileges or broad grants do not accidentally make the RPC executable by unauthenticated callers.

## 12. Avoiding Multiple Profiles for the Same User

The RPC should use layered protection to prevent duplicate profiles:

1. Check whether a profile already exists for the authenticated user before creating anything.
2. Use the authenticated user id as the profile id.
3. Rely on the existing `profiles.id` primary key as a database backstop.
4. Perform organization and profile creation in one transaction.
5. Treat duplicate profile attempts as onboarding failure, not as a request to create another organization.

This preserves the MVP rule that a user belongs to one organization through one profile.

## 13. Avoiding Accidental Multiple Organizations

The main accidental-organization risk is creating an organization row and then failing to create the matching profile, or allowing repeated onboarding calls for the same authenticated user.

The RPC should reduce that risk by:

1. Checking for an existing profile before creating an organization.
2. Creating the organization and profile atomically in the same transaction.
3. Rejecting repeated calls after the profile exists.
4. Not accepting an existing organization id from the client.
5. Not supporting organization switching, invitations, or joins in this RPC.
6. Treating retry behavior carefully: if the first call succeeds but the client does not receive the response, a retry should fail with an already-onboarded state rather than creating another organization.

A future implementation may choose an idempotent response for already-onboarded users only if that behavior is explicitly approved. The simpler MVP direction is to reject when a profile already exists.

## 14. Interaction With Existing RLS Model

The current RLS model allows normal application access after a profile exists because `profiles.organization_id` can be used as the organization boundary.

The onboarding RPC is the narrow bridge from authenticated-but-not-onboarded to onboarded:

- Before onboarding: the user has an auth identity but no profile or organization context.
- During onboarding: the RPC creates the missing organization/profile pair.
- After onboarding: normal RLS policies can resolve the user's organization through `profiles.organization_id`.

This RPC should not weaken the broader RLS model. It should only handle the initial bootstrap gap.

## 15. Local Testing Expectations After Implementation

After the RPC is implemented in a separate approved task, local validation should test at least these cases:

1. Authenticated user without a profile can complete onboarding successfully.
2. The successful call creates exactly one organization row.
3. The successful call creates exactly one profile row for the authenticated user.
4. The created profile has `role = owner`.
5. The created profile references the newly created organization.
6. The RPC response contains the expected basic identifiers or success payload.
7. Repeating the RPC for the same authenticated user fails safely or returns the approved already-onboarded behavior.
8. Anonymous/unauthenticated callers cannot execute the RPC.
9. The RPC is not executable through broad `public` access.
10. Blank organization names are rejected.
11. Blank full names are rejected.
12. Client-provided user id or role cannot affect created rows.
13. If profile creation fails, no orphan organization remains.
14. After onboarding, the user can read their own profile under RLS.
15. After onboarding, the user can read their own organization under RLS.
16. After onboarding, the user still cannot read another user's organization.
17. The existing table policies and grants continue to work for organization-scoped MVP data.

Validation should use the local Supabase workflow and project validation commands defined in the implementation task.

## 16. Explicit Non-Goals

This RPC plan does not add or approve:

- SQL in this task.
- Migration files in this task.
- Changes to existing migration SQL.
- Source code.
- Auth UI.
- Signup UI.
- Login UI.
- Onboarding UI.
- Routes.
- Product features.
- Invitation system.
- Multi-organization membership.
- Organization switching.
- Tenant login.
- Tenant mobile app access.
- Enterprise permissions.
- Role-specific database permissions.
- Server-side/service-role bootstrap layer.
- Payment gateway, marketplace, or accounting workflows.

## 17. Remaining RPC Questions

These details should be finalized in the separate owner-approved implementation task:

1. Exact SQL function return shape and error signaling style.
2. Exact user-facing copy for each onboarding failure state.
3. Exact string length limits for `organization_name` and `full_name`, if any.
4. Whether an already-onboarded retry should hard-fail or return an approved idempotent success payload.
5. Exact local Supabase test commands and fixtures for authenticated and anonymous RPC calls.

## 18. Implementation Lock

Implementation remains locked.

A separate owner-approved migration implementation task is required before creating:

- SQL.
- A migration file.
- Function bodies.
- Grants.
- RLS changes.
- Source code.
- Auth or onboarding UI.

The suggested next gate is owner review and approval of this RPC plan before any SQL or implementation work begins.
