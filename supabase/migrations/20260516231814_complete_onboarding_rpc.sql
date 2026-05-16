-- Complete onboarding RPC for the RuangRapi MVP.
-- Scope: authenticated onboarding bootstrap only.
-- Creates one organization and one owner profile for auth.uid().

create or replace function public.complete_onboarding(
  organization_name text,
  full_name text
)
returns table (
  organization_id uuid,
  profile_id uuid,
  role text,
  onboarding_completed boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_organization_name text;
  v_full_name text;
  v_organization_id uuid;
  v_profile_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required to complete onboarding'
      using errcode = '28000';
  end if;

  v_organization_name := btrim(coalesce(organization_name, ''));
  v_full_name := btrim(coalesce(full_name, ''));

  if length(v_organization_name) < 2 or length(v_organization_name) > 120 then
    raise exception 'organization_name must be between 2 and 120 characters after trimming'
      using errcode = '22023';
  end if;

  if length(v_full_name) < 2 or length(v_full_name) > 120 then
    raise exception 'full_name must be between 2 and 120 characters after trimming'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.profiles as p
    where p.id = v_user_id
  ) then
    raise exception 'User has already completed onboarding'
      using errcode = 'P0001';
  end if;

  insert into public.organizations (name)
  values (v_organization_name)
  returning id into v_organization_id;

  insert into public.profiles (id, organization_id, full_name, role)
  values (v_user_id, v_organization_id, v_full_name, 'owner')
  returning id into v_profile_id;

  return query
  select
    v_organization_id as organization_id,
    v_profile_id as profile_id,
    'owner'::text as role,
    true as onboarding_completed;
exception
  when unique_violation then
    raise exception 'User has already completed onboarding'
      using errcode = 'P0001';
end;
$$;

revoke execute on function public.complete_onboarding(text, text) from public;
revoke execute on function public.complete_onboarding(text, text) from anon;
grant execute on function public.complete_onboarding(text, text) to authenticated;
