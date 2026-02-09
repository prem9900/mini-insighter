-- ⚠️ WARNING: This will delete all existing data!
-- Run this if you are having issues with table structure or permissions.

-- 1. Drop existing tables (to start fresh)
drop table if exists messages cascade;
drop table if exists chats cascade;
drop table if exists datasets cascade;
drop table if exists projects cascade;

-- 2. Create Projects Table
create table projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table projects enable row level security;

-- Policies
create policy "Users can view own projects" on projects
  for select using (auth.uid() = user_id);

create policy "Users can create projects" on projects
  for insert with check (auth.uid() = user_id);

create policy "Users can update own projects" on projects
  for update using (auth.uid() = user_id);

create policy "Users can delete own projects" on projects
  for delete using (auth.uid() = user_id);

-- 3. Create Datasets Table
create table datasets (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  bigquery_project_id text not null,
  bigquery_dataset_id text not null,
  bigquery_table_id text not null,
  schema_json jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table datasets enable row level security;

create policy "Users can view datasets for own projects" on datasets
  for select using (exists (select 1 from projects where projects.id = datasets.project_id and projects.user_id = auth.uid()));

create policy "Users can create datasets for own projects" on datasets
  for insert with check (exists (select 1 from projects where projects.id = project_id and projects.user_id = auth.uid()));

create policy "Users can delete datasets for own projects" on datasets
  for delete using (exists (select 1 from projects where projects.id = datasets.project_id and projects.user_id = auth.uid()));

-- 4. Create Chats Table
create table chats (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table chats enable row level security;

create policy "Users can view own chats" on chats
  for select using (auth.uid() = user_id);

create policy "Users can create chats" on chats
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own chats" on chats
  for delete using (auth.uid() = user_id);

-- 5. Create Messages Table
create table messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references chats(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  sql_query text,
  query_results jsonb,
  visualization_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table messages enable row level security;

create policy "Users can view messages for own chats" on messages
  for select using (exists (select 1 from chats where chats.id = messages.chat_id and chats.user_id = auth.uid()));

create policy "Users can create messages for own chats" on messages
  for insert with check (exists (select 1 from chats where chats.id = chat_id and chats.user_id = auth.uid()));
