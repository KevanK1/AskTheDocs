create table if not exists public.user_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  prompt_count integer not null default 0 check (prompt_count >= 0)
);