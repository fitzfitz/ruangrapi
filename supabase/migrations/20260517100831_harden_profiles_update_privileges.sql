-- Harden profile update privileges after onboarding RPC behavior testing.
-- Scope: keep profile self-updates limited to full_name only.

revoke update on public.profiles from authenticated;
revoke update on public.profiles from anon;

grant update (full_name) on public.profiles to authenticated;
