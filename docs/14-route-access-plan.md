# Route Access Plan

## 1. Status

Status: planning only.

This document plans how the current app account states should map to the current routes before route redirects, protected routes, or auth/onboarding screens are implemented.

It does not implement source code, redirects, protected routes, auth UI, signup forms, login forms, onboarding forms, Supabase mutations, package changes, SQL files, migrations, or product features.

## 2. Purpose

The current app can derive an account state from Supabase Auth session, current profile lookup, and current organization lookup. The next routing decision should define what each state means for each route before changing source code.

Current routes:

- `/`
- `/auth`
- `/onboarding`
- `/dashboard`

Current account states:

- `checking_session`
- `logged_out`
- `checking_profile`
- `needs_onboarding`
- `checking_organization`
- `ready`
- `account_setup_error`

## 3. Route Roles

### `/`

The home route should act as the account-state gate.

Its future responsibility is to inspect the derived account state and send the user toward the correct next app route. Until redirects are implemented, it may continue to render account-state placeholders.

### `/auth`

The auth route should be the canonical entry route for logged-out users.

It is reserved for future signup/login UI. This planning document does not create or specify those forms.

### `/onboarding`

The onboarding route should be the canonical setup route for authenticated users who do not yet have a profile.

It is reserved for future first-organization onboarding UI. This planning document does not create or specify that form or call the onboarding RPC.

### `/dashboard`

The dashboard route should be the canonical normal app destination for users whose account state is `ready`.

It should eventually require a valid session, profile, and organization context before dashboard content renders.

## 4. Behavior at `/`

| Account state           | Planned behavior at `/`                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `checking_session`      | Show a loading placeholder while the initial session is being checked. Do not redirect yet while the state is unresolved.                                                |
| `logged_out`            | Eventually redirect to `/auth`. Until redirects are implemented, show the logged-out placeholder copy.                                                                   |
| `checking_profile`      | Show a loading placeholder while the current profile is being checked. Do not redirect yet while the state is unresolved.                                                |
| `needs_onboarding`      | Eventually redirect to `/onboarding`. Until redirects are implemented, show the onboarding-needed placeholder copy.                                                      |
| `checking_organization` | Show a loading placeholder while the organization context is being checked. Do not redirect yet while the state is unresolved.                                           |
| `ready`                 | Eventually redirect to `/dashboard`. Until redirects are implemented, continue to render the ready dashboard shell behavior if that remains the current source behavior. |
| `account_setup_error`   | Show blocking account setup error copy. Do not redirect automatically because the account state needs user support or developer diagnosis.                               |

## 5. Behavior at `/auth`

| Account state           | Planned behavior at `/auth`                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `checking_session`      | Show a loading placeholder while the initial session is being checked. Avoid showing auth UI until the logged-out state is confirmed. |
| `logged_out`            | Show the future signup/login entry UI. Current planning keeps auth UI out of scope.                                                   |
| `checking_profile`      | Show a loading placeholder while the current profile is being checked.                                                                |
| `needs_onboarding`      | Eventually redirect to `/onboarding`, because the user is authenticated but not onboarded.                                            |
| `checking_organization` | Show a loading placeholder while the organization context is being checked.                                                           |
| `ready`                 | Eventually redirect to `/dashboard`, because an onboarded user should not remain on the auth route.                                   |
| `account_setup_error`   | Show blocking account setup error copy rather than signup/login UI. Do not continue to normal app content.                            |

## 6. Behavior at `/onboarding`

| Account state           | Planned behavior at `/onboarding`                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `checking_session`      | Show a loading placeholder while the initial session is being checked.                                                               |
| `logged_out`            | Eventually redirect to `/auth`, because onboarding requires an authenticated user.                                                   |
| `checking_profile`      | Show a loading placeholder while the current profile is being checked.                                                               |
| `needs_onboarding`      | Show the future onboarding UI for first organization/profile setup. Current planning keeps onboarding UI and RPC calls out of scope. |
| `checking_organization` | Show a loading placeholder while the organization context is being checked.                                                          |
| `ready`                 | Eventually redirect to `/dashboard`, because an already-onboarded user should not repeat first-organization onboarding.              |
| `account_setup_error`   | Show blocking account setup error copy. Do not show onboarding if the account has an inconsistent profile/organization state.        |

## 7. Behavior at `/dashboard`

| Account state           | Planned behavior at `/dashboard`                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| `checking_session`      | Show a loading placeholder while the initial session is being checked.                         |
| `logged_out`            | Eventually redirect to `/auth`, because dashboard access requires authentication.              |
| `checking_profile`      | Show a loading placeholder while the current profile is being checked.                         |
| `needs_onboarding`      | Eventually redirect to `/onboarding`, because dashboard access requires completed onboarding.  |
| `checking_organization` | Show a loading placeholder while the organization context is being checked.                    |
| `ready`                 | Render the dashboard shell and, later, dashboard content that relies on ready account context. |
| `account_setup_error`   | Show blocking account setup error copy. Do not render dashboard content.                       |

## 8. Canonical Destinations

Canonical post-login destination:

- `/`

Reason: after login, the app should re-run the account-state gate. This keeps post-login handling simple and avoids making the auth route decide whether the next destination is onboarding or dashboard before profile and organization checks finish.

Canonical post-onboarding destination:

- `/dashboard`

Reason: after onboarding succeeds, the user should have a profile and organization and should enter the normal app shell. The account state should be refreshed so the dashboard only renders after the state is `ready`.

## 9. Redirect Timing Decision

Redirects should be implemented later, not in this planning task.

Planned later redirect behavior:

1. Keep checking states on the current route with loading placeholders.
2. Redirect `logged_out` users from `/`, `/onboarding`, and `/dashboard` to `/auth`.
3. Redirect `needs_onboarding` users from `/`, `/auth`, and `/dashboard` to `/onboarding`.
4. Redirect `ready` users from `/` and `/auth` to `/dashboard`.
5. Redirect `ready` users from `/onboarding` to `/dashboard` to prevent repeated onboarding.
6. Keep `account_setup_error` on a blocking error state instead of redirecting in loops.

The later source task should use the existing React Router setup and account-state hook. It should avoid adding auth UI, onboarding UI, forms, Supabase mutations, package changes, SQL, migrations, or product features unless separately approved.

## 10. Out of Scope

This route access plan does not include:

- Source code changes.
- Route implementation changes.
- Redirect implementation.
- Protected route components.
- Auth UI.
- Signup forms.
- Login forms.
- Onboarding forms.
- Supabase mutations.
- Calls to `public.complete_onboarding`.
- Package changes.
- SQL files.
- Supabase migrations.
- Product features.

## 11. Remaining Route/Access Questions

No blocking route/access planning questions remain for the current route set.

Future implementation tasks may still need to decide:

1. Whether route guarding should live in a small shared route-access component or directly in route page components.
2. The exact loading placeholder component/copy to use during route-level checking states.
3. Whether account setup errors should have a dedicated route later or remain inline on the attempted route.

## 12. Implementation Lock

Implementation is still locked.

A separate owner-approved source task is required before modifying route behavior, adding redirects, creating protected route components, creating auth UI, creating onboarding UI, adding Supabase mutations, changing packages, writing SQL, or creating migrations.

Suggested next implementation task:

- Implement route redirects and access gating for the existing four routes using the already-derived app account state, with no auth UI, no onboarding UI, no forms, no Supabase mutations, no package changes, no SQL, no migrations, and no product features.
