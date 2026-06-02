alter table public.maintenance_tickets
  add column estimated_cost bigint check (estimated_cost is null or estimated_cost >= 0),
  add column actual_cost bigint check (actual_cost is null or actual_cost >= 0);
