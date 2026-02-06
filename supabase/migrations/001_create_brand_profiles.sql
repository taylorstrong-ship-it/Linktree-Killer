-- User Onboarding & Brand Storage Schema
-- Migration: 001_create_brand_profiles
-- Purpose: Create brand_profiles table with Row Level Security

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create brand_profiles table
create table if not exists public.brand_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  brand_name text not null,
  industry text,
  vibe text,
  ad_hook text,
  primary_color text default '#FF6B35',
  logo_url text,
  hero_image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.brand_profiles enable row level security;

-- RLS Policy: Users can view own brand profile
create policy "Users can view own brand profile"
  on public.brand_profiles for select
  using (auth.uid() = user_id);

-- RLS Policy: Users can insert own brand profile
create policy "Users can insert own brand profile"
  on public.brand_profiles for insert
  with check (auth.uid() = user_id);

-- RLS Policy: Users can update own brand profile
create policy "Users can update own brand profile"
  on public.brand_profiles for update
  using (auth.uid() = user_id);

-- Create index for faster user lookups
create index brand_profiles_user_id_idx on public.brand_profiles(user_id);

-- Auto-update timestamp trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at on row changes
create trigger set_updated_at
  before update on public.brand_profiles
  for each row
  execute procedure public.handle_updated_at();
