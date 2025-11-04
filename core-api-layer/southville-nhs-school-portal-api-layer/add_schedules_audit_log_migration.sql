-- Create schedules_audit_log table
create table if not exists public.schedules_audit_log (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules(id) on delete cascade,
  actor_user_id uuid not null references public.users(id) on delete set null,
  action text not null check (action in ('create','update','delete','publish','unpublish')),
  changed_fields jsonb,
  before jsonb,
  after jsonb,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_schedules_audit_log_schedule_id on public.schedules_audit_log(schedule_id);
create index if not exists idx_schedules_audit_log_actor_user_id on public.schedules_audit_log(actor_user_id);
create index if not exists idx_schedules_audit_log_created_at on public.schedules_audit_log(created_at desc);









