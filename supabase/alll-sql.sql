create table public.attendances (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  date date not null,
  check_in_time time without time zone null,
  check_out_time time without time zone null,
  activity_description text null,
  status public.attendance_status null default 'present'::attendance_status,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint attendances_pkey primary key (id),
  constraint attendances_user_id_date_key unique (user_id, date),
  constraint attendances_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_attendances_user_id on public.attendances using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_attendances_date on public.attendances using btree (date) TABLESPACE pg_default;

create index IF not exists idx_attendances_status on public.attendances using btree (status) TABLESPACE pg_default;

create trigger update_attendances_updated_at BEFORE
update on attendances for EACH row
execute FUNCTION update_updated_at_column ();

create view public.dashboard_stats as
select
  (
    select
      count(*) as count
    from
      users
    where
      users.role = 'participant'::user_role
      and users.status = 'active'::entity_status
  ) as total_participants,
  (
    select
      count(*) as count
    from
      users
    where
      users.role = 'supervisor'::user_role
      and users.status = 'active'::entity_status
  ) as total_supervisors,
  (
    select
      count(*) as count
    from
      units
    where
      units.status = 'active'::entity_status
  ) as total_units,
  (
    select
      count(*) as count
    from
      attendances
    where
      attendances.date = CURRENT_DATE
      and attendances.status = 'present'::attendance_status
  ) as today_present;

create table public.monitoring_locations (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  location_name character varying(255) not null,
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  request_date date not null,
  reason text null,
  status public.request_status null default 'pending'::request_status,
  notes text null,
  created_at timestamp with time zone null default now(),
  constraint monitoring_locations_pkey primary key (id),
  constraint monitoring_locations_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_monitoring_user_id on public.monitoring_locations using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_monitoring_status on public.monitoring_locations using btree (status) TABLESPACE pg_default;

create index IF not exists idx_monitoring_request_date on public.monitoring_locations using btree (request_date) TABLESPACE pg_default;

create table public.system_settings (
  id uuid not null default extensions.uuid_generate_v4 (),
  key character varying(255) not null,
  value jsonb not null,
  description text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint system_settings_pkey primary key (id),
  constraint system_settings_key_key unique (key)
) TABLESPACE pg_default;

create trigger update_system_settings_updated_at BEFORE
update on system_settings for EACH row
execute FUNCTION update_updated_at_column ();

create view public.unit_employee_counts as
select
  u.id,
  u.name,
  u.department,
  count(us.id) filter (
    where
      us.status = 'active'::entity_status
  ) as employee_count
from
  units u
  left join users us on u.id = us.unit_id
where
  u.status = 'active'::entity_status
group by
  u.id,
  u.name,
  u.department;

create table public.units (
  id uuid not null default extensions.uuid_generate_v4 (),
  name character varying(255) not null,
  department character varying(255) not null,
  manager_id uuid null,
  status public.entity_status null default 'active'::entity_status,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint units_pkey primary key (id),
  constraint units_manager_id_fkey foreign KEY (manager_id) references users (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_units_status on public.units using btree (status) TABLESPACE pg_default;

create index IF not exists idx_units_department on public.units using btree (department) TABLESPACE pg_default;

create trigger update_units_updated_at BEFORE
update on units for EACH row
execute FUNCTION update_updated_at_column ();

create table public.users (
  id uuid not null default extensions.uuid_generate_v4 (),
  email character varying(255) not null,
  name character varying(255) not null,
  role public.user_role null default 'participant'::user_role,
  unit_id uuid null,
  status public.entity_status null default 'active'::entity_status,
  internship_start date null,
  internship_end date null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  password text null,
  supervisor_id uuid null,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_supervisor_id_fkey foreign KEY (supervisor_id) references users (id) on delete set null,
  constraint users_unit_id_fkey foreign KEY (unit_id) references units (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_users_supervisor_id on public.users using btree (supervisor_id) TABLESPACE pg_default;

create index IF not exists idx_users_email on public.users using btree (email) TABLESPACE pg_default;

create index IF not exists idx_users_role on public.users using btree (role) TABLESPACE pg_default;

create index IF not exists idx_users_unit_id on public.users using btree (unit_id) TABLESPACE pg_default;

create index IF not exists idx_users_status on public.users using btree (status) TABLESPACE pg_default;

create trigger update_users_updated_at BEFORE
update on users for EACH row
execute FUNCTION update_updated_at_column ();

-- RLS POLICIES FOR USERS TABLE
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow_Select_Staff" 
ON public.users FOR SELECT 
USING ( role IN ('supervisor', 'admin') );

CREATE POLICY "Allow_Select_Self" 
ON public.users FOR SELECT 
USING ( id = auth.uid() );

-- Full access for admins based on JWT metadata
CREATE POLICY "Admin_Full_Access"
ON public.users FOR ALL
USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

-- NOTE: If Join queries for supervisor (Self-Join) return PGRST200 (400 Bad Request),
-- it is due to a stale schema cache in PostgREST. 
-- Fix: Use separate fetch calls for supervisor_id in the API layer.
-- NOTE: If Join queries for 'units' return PGRST201 (Ambiguity), 
-- it's because both 'users' and 'units' have foreign keys to each other.
-- Fix: Use '!users_unit_id_fkey' hint in the select query.
