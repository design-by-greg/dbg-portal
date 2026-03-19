-- DBG Portal - Initial schema

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('admin', 'client')) default 'client',
  full_name text,
  email text,
  phone text,
  created_at timestamp default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  status text default 'active',
  onboarding_completed boolean default false,
  company_name text,
  contact_name text,
  email text,
  phone text,
  billing_address_line_1 text,
  billing_address_line_2 text,
  billing_postal_code text,
  billing_city text,
  billing_country text,
  shipping_address_line_1 text,
  shipping_address_line_2 text,
  shipping_postal_code text,
  shipping_city text,
  shipping_country text,
  internal_notes text,
  created_at timestamp default now(),
  updated_at timestamp,
  archived_at timestamp
);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  type text check (type in ('new', 'reorder', 'creation')) default 'new',
  title text,
  description text,
  status text default 'pending',
  created_at timestamp default now(),
  updated_at timestamp,
  archived_at timestamp
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  request_id uuid references public.requests(id),
  title text,
  description text,
  status text default 'new_project',
  current_step text,
  next_step text,
  client_action_required boolean default false,
  created_at timestamp default now(),
  updated_at timestamp,
  archived_at timestamp
);

create table if not exists public.project_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  sender_profile_id uuid references public.profiles(id),
  message text,
  is_system boolean default false,
  created_at timestamp default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  abby_quote_number text,
  amount_total numeric,
  status text,
  pdf_file_path text,
  sent_to_client_at timestamp,
  validated_at timestamp,
  created_at timestamp default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  abby_invoice_number text,
  amount_total numeric,
  status text,
  invoice_date timestamp,
  pdf_file_path text,
  created_at timestamp default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id),
  type text check (type in ('project', 'manual', 'reorder')) default 'project',
  status text,
  quantity integer,
  internal_notes text,
  tracking_number text,
  tracking_url text,
  carrier text,
  created_at timestamp default now(),
  updated_at timestamp
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_role text;
  new_name text;
begin
  new_role := coalesce(new.raw_user_meta_data->>'role', 'client');
  new_name := new.raw_user_meta_data->>'full_name';

  insert into public.profiles (
    id,
    role,
    full_name,
    email,
    created_at
  )
  values (
    new.id,
    new_role,
    new_name,
    new.email,
    now()
  )
  on conflict (id) do update
  set role = excluded.role,
      full_name = excluded.full_name,
      email = excluded.email;

  if new_role = 'client' then
    insert into public.clients (
      user_id,
      contact_name,
      email,
      status,
      onboarding_completed,
      created_at
    )
    values (
      new.id,
      new_name,
      new.email,
      'active',
      false,
      now()
    )
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
