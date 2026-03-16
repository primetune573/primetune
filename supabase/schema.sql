-- PrimeTune Automotive: Supabase SQL Setup

-- 1. PROFILES & ROLES
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text default 'staff' check (role in ('admin', 'staff')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. SERVICES
create table services (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  price numeric default 0,
  duration_hours numeric default 1,
  category text,
  image_url text,
  is_emergency boolean default false,
  is_active boolean default true,
  included_items text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. BOOKINGS
create table bookings (
  id uuid primary key default gen_random_uuid(),
  booking_number text unique not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  car_brand text,
  car_model text,
  car_year text,
  service_ids uuid[] default '{}',
  service_names_snapshot text[] default '{}',
  total_price numeric default 0,
  duration_hours numeric default 1,
  booking_date date not null,
  booking_time text not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'rescheduled')),
  notes text,
  cancellation_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  cancelled_at timestamptz,
  completed_at timestamptz,
  rescheduled_from_id uuid references bookings(id)
);

-- 4. AVAILABILITY BLOCKS
create table availability_blocks (
  id uuid primary key default gen_random_uuid(),
  type text check (type in ('full-day', 'partial')),
  date date not null,
  start_hour int default 0,
  end_hour int default 24,
  reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. INVENTORY
create table inventory (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  sku text unique,
  category text,
  quantity int default 0,
  unit text,
  reorder_level int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. AUDIT LOGS
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  table_name text,
  record_id uuid,
  action text, -- 'INSERT', 'UPDATE', 'DELETE', 'STATUS_CHANGE', etc.
  old_data jsonb,
  new_data jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- RLS POLICIES

-- Profiles: Users can read their own profile; Admins handle everything.
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Admins can manage all profiles" on profiles for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Services: Public can read active; Admins manage.
alter table services enable row level security;
create policy "Anyone can view active services" on services for select using (is_active = true);
create policy "Admins can manage services" on services for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Bookings: Customers can insert; Admins manage.
alter table bookings enable row level security;
create policy "Anyone can create a booking" on bookings for insert with check (true);
create policy "Staff/Admins can manage bookings" on bookings for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'staff'))
);

-- Availability Blocks: Public read; Admins manage.
alter table availability_blocks enable row level security;
create policy "Anyone can view availability blocks" on availability_blocks for select using (true);
create policy "Admins can manage availability blocks" on availability_blocks for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Inventory: Admins/Staff only.
alter table inventory enable row level security;
create policy "Staff/Admins can manage inventory" on inventory for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'staff'))
);

-- Audit Logs: Admins only.
alter table audit_logs enable row level security;
create policy "Admins can view audit logs" on audit_logs for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- HELPER FUNCTIONS

-- Trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_profiles_modtime before update on profiles for each row execute procedure update_updated_at_column();
create trigger update_services_modtime before update on services for each row execute procedure update_updated_at_column();
create trigger update_bookings_modtime before update on bookings for each row execute procedure update_updated_at_column();
create trigger update_availability_modtime before update on availability_blocks for each row execute procedure update_updated_at_column();
create trigger update_inventory_modtime before update on inventory for each row execute procedure update_updated_at_column();
