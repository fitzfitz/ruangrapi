-- Initial RuangRapi MVP schema.
-- Scope: core organization, rental operations, billing, payments,
-- receipts, utility readings, maintenance tickets, reminders, RLS,
-- updated_at maintenance, and receipt number sequencing.

create extension if not exists pgcrypto;

-- Shared timestamp maintenance.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id),
  full_name text not null check (length(trim(full_name)) > 0),
  role text not null default 'owner' check (role in ('owner', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Current user's organization helper for RLS policies.
create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.organization_id
  from public.profiles as p
  where p.id = auth.uid()
$$;

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  name text not null check (length(trim(name)) > 0),
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  property_id uuid not null references public.properties (id),
  name text not null check (length(trim(name)) > 0),
  type text not null check (type in ('room', 'house', 'apartment', 'studio', 'other')),
  status text not null default 'vacant' check (status in ('vacant', 'occupied', 'maintenance', 'inactive')),
  base_rent_amount bigint check (base_rent_amount is null or base_rent_amount >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint units_unique_name_per_property unique (organization_id, property_id, name)
);

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  full_name text not null check (length(trim(full_name)) > 0),
  phone text,
  email text,
  identity_notes text,
  emergency_contact_name text,
  emergency_contact_phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  tenant_id uuid not null references public.tenants (id),
  unit_id uuid not null references public.units (id),
  start_date date not null,
  end_date date,
  monthly_rent_amount bigint not null check (monthly_rent_amount >= 0),
  billing_day integer not null check (billing_day between 1 and 31),
  deposit_amount bigint check (deposit_amount is null or deposit_amount >= 0),
  status text not null default 'active' check (status in ('active', 'ended', 'cancelled')),
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leases_end_date_after_start_date check (end_date is null or end_date >= start_date),
  constraint leases_cancelled_at_matches_status check (
    (status = 'cancelled' and cancelled_at is not null)
    or (status <> 'cancelled')
  )
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  lease_id uuid not null references public.leases (id),
  tenant_id uuid not null references public.tenants (id),
  unit_id uuid not null references public.units (id),
  billing_period date not null,
  issued_at timestamptz,
  due_date date,
  subtotal_amount bigint not null default 0 check (subtotal_amount >= 0),
  total_amount bigint not null default 0 check (total_amount >= 0),
  status text not null default 'draft' check (status in ('draft', 'unpaid', 'partially_paid', 'paid', 'overdue', 'cancelled')),
  cancelled_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_billing_period_first_day check (billing_period = date_trunc('month', billing_period)::date),
  constraint invoices_issued_fields_match_status check (
    (status = 'draft')
    or (issued_at is not null and due_date is not null)
  ),
  constraint invoices_cancelled_at_matches_status check (
    (status = 'cancelled' and cancelled_at is not null)
    or (status <> 'cancelled')
  )
);

create table public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  invoice_id uuid not null references public.invoices (id),
  description text not null check (length(trim(description)) > 0),
  line_type text not null check (line_type in ('rent', 'utility', 'other')),
  quantity numeric(12, 2) not null default 1 check (quantity > 0),
  unit_amount bigint not null check (unit_amount >= 0),
  total_amount bigint not null check (total_amount >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  invoice_id uuid not null references public.invoices (id),
  amount bigint not null check (amount > 0),
  payment_date date not null,
  payment_method text not null check (payment_method in ('cash', 'bank_transfer', 'e_wallet', 'other')),
  reference_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  payment_id uuid not null references public.payments (id),
  receipt_number text not null,
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint receipts_payment_id_unique unique (payment_id),
  constraint receipts_receipt_number_format check (receipt_number ~ '^RR-[0-9]{4}-[0-9]{4}$'),
  constraint receipts_receipt_number_unique_per_org unique (organization_id, receipt_number)
);

create table public.utility_readings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  unit_id uuid not null references public.units (id),
  billing_period date not null,
  utility_type text not null check (utility_type in ('electricity', 'water', 'other')),
  previous_reading numeric(12, 2) check (previous_reading is null or previous_reading >= 0),
  current_reading numeric(12, 2) check (current_reading is null or current_reading >= 0),
  usage_amount numeric(12, 2) check (usage_amount is null or usage_amount >= 0),
  rate bigint check (rate is null or rate >= 0),
  total_amount bigint check (total_amount is null or total_amount >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint utility_readings_billing_period_first_day check (billing_period = date_trunc('month', billing_period)::date),
  constraint utility_readings_current_after_previous check (
    previous_reading is null
    or current_reading is null
    or current_reading >= previous_reading
  ),
  constraint utility_readings_unique_active_reading unique (organization_id, unit_id, billing_period, utility_type)
);

create table public.maintenance_tickets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  property_id uuid not null references public.properties (id),
  unit_id uuid references public.units (id),
  title text not null check (length(trim(title)) > 0),
  description text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'cancelled')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  reported_at timestamptz not null default now(),
  resolved_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint maintenance_tickets_resolved_at_matches_status check (
    (status = 'resolved' and resolved_at is not null)
    or (status <> 'resolved')
  ),
  constraint maintenance_tickets_cancelled_at_matches_status check (
    (status = 'cancelled' and cancelled_at is not null)
    or (status <> 'cancelled')
  )
);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  invoice_id uuid not null references public.invoices (id),
  tenant_id uuid not null references public.tenants (id),
  channel text not null default 'whatsapp' check (channel in ('whatsapp', 'manual')),
  message text not null check (length(trim(message)) > 0),
  status text not null default 'draft' check (status in ('draft', 'prepared', 'sent', 'cancelled')),
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reminders_cancelled_at_matches_status check (
    (status = 'cancelled' and cancelled_at is not null)
    or (status <> 'cancelled')
  )
);

-- Essential uniqueness and query indexes.
create index profiles_organization_id_idx on public.profiles (organization_id);

create index properties_organization_id_idx on public.properties (organization_id);

create index units_organization_id_idx on public.units (organization_id);
create index units_property_id_idx on public.units (property_id);
create index units_organization_id_status_idx on public.units (organization_id, status);

create index tenants_organization_id_idx on public.tenants (organization_id);

create index leases_organization_id_idx on public.leases (organization_id);
create index leases_tenant_id_idx on public.leases (tenant_id);
create index leases_unit_id_idx on public.leases (unit_id);
create unique index leases_one_active_per_tenant_idx on public.leases (organization_id, tenant_id) where status = 'active';
create unique index leases_one_active_per_unit_idx on public.leases (organization_id, unit_id) where status = 'active';

create index invoices_organization_id_idx on public.invoices (organization_id);
create index invoices_lease_id_idx on public.invoices (lease_id);
create index invoices_tenant_id_idx on public.invoices (tenant_id);
create index invoices_unit_id_idx on public.invoices (unit_id);
create index invoices_organization_id_billing_period_idx on public.invoices (organization_id, billing_period);
create index invoices_organization_id_status_idx on public.invoices (organization_id, status);
create index invoices_organization_id_due_date_idx on public.invoices (organization_id, due_date);
create unique index invoices_one_non_cancelled_per_lease_period_idx on public.invoices (organization_id, lease_id, billing_period) where status <> 'cancelled';

create index invoice_line_items_organization_id_idx on public.invoice_line_items (organization_id);
create index invoice_line_items_invoice_id_idx on public.invoice_line_items (invoice_id);

create index payments_organization_id_idx on public.payments (organization_id);
create index payments_invoice_id_idx on public.payments (invoice_id);
create index payments_organization_id_payment_date_idx on public.payments (organization_id, payment_date);

create index receipts_organization_id_idx on public.receipts (organization_id);
create index receipts_payment_id_idx on public.receipts (payment_id);

create index utility_readings_organization_id_idx on public.utility_readings (organization_id);
create index utility_readings_unit_id_idx on public.utility_readings (unit_id);
create index utility_readings_organization_id_billing_period_idx on public.utility_readings (organization_id, billing_period);

create index maintenance_tickets_organization_id_idx on public.maintenance_tickets (organization_id);
create index maintenance_tickets_property_id_idx on public.maintenance_tickets (property_id);
create index maintenance_tickets_unit_id_idx on public.maintenance_tickets (unit_id);
create index maintenance_tickets_organization_id_status_idx on public.maintenance_tickets (organization_id, status);

create index reminders_organization_id_idx on public.reminders (organization_id);
create index reminders_invoice_id_idx on public.reminders (invoice_id);
create index reminders_tenant_id_idx on public.reminders (tenant_id);
create index reminders_organization_id_status_idx on public.reminders (organization_id, status);

-- updated_at triggers.
create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger properties_set_updated_at
before update on public.properties
for each row execute function public.set_updated_at();

create trigger units_set_updated_at
before update on public.units
for each row execute function public.set_updated_at();

create trigger tenants_set_updated_at
before update on public.tenants
for each row execute function public.set_updated_at();

create trigger leases_set_updated_at
before update on public.leases
for each row execute function public.set_updated_at();

create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

create trigger invoice_line_items_set_updated_at
before update on public.invoice_line_items
for each row execute function public.set_updated_at();

create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

create trigger receipts_set_updated_at
before update on public.receipts
for each row execute function public.set_updated_at();

create trigger utility_readings_set_updated_at
before update on public.utility_readings
for each row execute function public.set_updated_at();

create trigger maintenance_tickets_set_updated_at
before update on public.maintenance_tickets
for each row execute function public.set_updated_at();

create trigger reminders_set_updated_at
before update on public.reminders
for each row execute function public.set_updated_at();

-- Database-backed receipt sequencing.
create or replace function public.next_receipt_number(
  p_organization_id uuid,
  p_issued_at timestamptz default now()
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  receipt_year integer;
  receipt_prefix text;
  next_sequence integer;
begin
  receipt_year := extract(year from p_issued_at)::integer;
  receipt_prefix := 'RR-' || receipt_year::text || '-';

  perform pg_advisory_xact_lock(
    hashtextextended(p_organization_id::text || ':' || receipt_year::text, 0)
  );

  select coalesce(max(substring(r.receipt_number from 9 for 4)::integer), 0) + 1
  into next_sequence
  from public.receipts as r
  where r.organization_id = p_organization_id
    and r.receipt_number like receipt_prefix || '____';

  return receipt_prefix || lpad(next_sequence::text, 4, '0');
end;
$$;

create or replace function public.set_receipt_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.receipt_number is null or length(trim(new.receipt_number)) = 0 then
    new.receipt_number := public.next_receipt_number(new.organization_id, new.issued_at);
  end if;

  return new;
end;
$$;

create trigger receipts_set_receipt_number
before insert on public.receipts
for each row execute function public.set_receipt_number();

-- Function execution privileges.
-- Internal trigger functions and sequencing helpers should not be callable
-- directly through Supabase RPC by authenticated clients.
revoke execute on function public.set_updated_at() from public;
revoke execute on function public.next_receipt_number(uuid, timestamptz) from public;
revoke execute on function public.set_receipt_number() from public;
revoke execute on function public.current_organization_id() from public;
grant execute on function public.current_organization_id() to authenticated;

-- Row Level Security.
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.units enable row level security;
alter table public.tenants enable row level security;
alter table public.leases enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.payments enable row level security;
alter table public.receipts enable row level security;
alter table public.utility_readings enable row level security;
alter table public.maintenance_tickets enable row level security;
alter table public.reminders enable row level security;

-- Conservative identity policies.
create policy "Users can read their own organization"
on public.organizations
for select
to authenticated
using (id = public.current_organization_id());

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Users can update their own profile full name"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Organization-scoped MVP data policies. Owner/admin have identical access.
create policy "Organization members can read properties"
on public.properties
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Organization members can insert properties"
on public.properties
for insert
to authenticated
with check (organization_id = public.current_organization_id());

create policy "Organization members can update properties"
on public.properties
for update
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Organization members can delete properties"
on public.properties
for delete
to authenticated
using (organization_id = public.current_organization_id());

create policy "Organization members can read units"
on public.units
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Organization members can insert units"
on public.units
for insert
to authenticated
with check (organization_id = public.current_organization_id());

create policy "Organization members can update units"
on public.units
for update
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Organization members can delete units"
on public.units
for delete
to authenticated
using (organization_id = public.current_organization_id());

create policy "Organization members can read tenants"
on public.tenants
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Organization members can insert tenants"
on public.tenants
for insert
to authenticated
with check (organization_id = public.current_organization_id());

create policy "Organization members can update tenants"
on public.tenants
for update
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Organization members can delete tenants"
on public.tenants
for delete
to authenticated
using (organization_id = public.current_organization_id());

create policy "Organization members can read leases"
on public.leases
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Organization members can insert leases"
on public.leases
for insert
to authenticated
with check (organization_id = public.current_organization_id());

create policy "Organization members can update leases"
on public.leases
for update
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Organization members can delete leases"
on public.leases
for delete
to authenticated
using (organization_id = public.current_organization_id());

create policy "Organization members can read invoices"
on public.invoices
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Organization members can insert invoices"
on public.invoices
for insert
to authenticated
with check (organization_id = public.current_organization_id());

create policy "Organization members can update invoices"
on public.invoices
for update
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Organization members can delete invoices"
on public.invoices
for delete
to authenticated
using (organization_id = public.current_organization_id());

create policy "Organization members can read invoice line items"
on public.invoice_line_items
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Organization members can insert invoice line items"
on public.invoice_line_items
for insert
to authenticated
with check (organization_id = public.current_organization_id());

create policy "Organization members can update invoice line items"
on public.invoice_line_items
for update
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Organization members can delete invoice line items"
on public.invoice_line_items
for delete
to authenticated
using (organization_id = public.current_organization_id());

create policy "Organization members can read payments"
on public.payments
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Organization members can insert payments"
on public.payments
for insert
to authenticated
with check (organization_id = public.current_organization_id());

create policy "Organization members can update payments"
on public.payments
for update
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Organization members can delete payments"
on public.payments
for delete
to authenticated
using (organization_id = public.current_organization_id());

create policy "Organization members can read receipts"
on public.receipts
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Organization members can insert receipts"
on public.receipts
for insert
to authenticated
with check (organization_id = public.current_organization_id());

create policy "Organization members can update receipts"
on public.receipts
for update
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Organization members can delete receipts"
on public.receipts
for delete
to authenticated
using (organization_id = public.current_organization_id());

create policy "Organization members can read utility readings"
on public.utility_readings
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Organization members can insert utility readings"
on public.utility_readings
for insert
to authenticated
with check (organization_id = public.current_organization_id());

create policy "Organization members can update utility readings"
on public.utility_readings
for update
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Organization members can delete utility readings"
on public.utility_readings
for delete
to authenticated
using (organization_id = public.current_organization_id());

create policy "Organization members can read maintenance tickets"
on public.maintenance_tickets
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Organization members can insert maintenance tickets"
on public.maintenance_tickets
for insert
to authenticated
with check (organization_id = public.current_organization_id());

create policy "Organization members can update maintenance tickets"
on public.maintenance_tickets
for update
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Organization members can delete maintenance tickets"
on public.maintenance_tickets
for delete
to authenticated
using (organization_id = public.current_organization_id());

create policy "Organization members can read reminders"
on public.reminders
for select
to authenticated
using (organization_id = public.current_organization_id());

create policy "Organization members can insert reminders"
on public.reminders
for insert
to authenticated
with check (organization_id = public.current_organization_id());

create policy "Organization members can update reminders"
on public.reminders
for update
to authenticated
using (organization_id = public.current_organization_id())
with check (organization_id = public.current_organization_id());

create policy "Organization members can delete reminders"
on public.reminders
for delete
to authenticated
using (organization_id = public.current_organization_id());

-- Explicit authenticated grants for Supabase/PostgREST access.
grant usage on schema public to authenticated;

grant select on public.organizations to authenticated;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;

grant select, insert, update, delete on public.properties to authenticated;
grant select, insert, update, delete on public.units to authenticated;
grant select, insert, update, delete on public.tenants to authenticated;
grant select, insert, update, delete on public.leases to authenticated;
grant select, insert, update, delete on public.invoices to authenticated;
grant select, insert, update, delete on public.invoice_line_items to authenticated;
grant select, insert, update, delete on public.payments to authenticated;
grant select, insert, update, delete on public.receipts to authenticated;
grant select, insert, update, delete on public.utility_readings to authenticated;
grant select, insert, update, delete on public.maintenance_tickets to authenticated;
grant select, insert, update, delete on public.reminders to authenticated;
