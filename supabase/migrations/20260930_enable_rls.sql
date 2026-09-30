-- Enable Row Level Security on every application table.
--
-- The app reaches Postgres only through API routes, which use the
-- service_role key (see utils/supabase/admin.ts). service_role bypasses RLS,
-- so no policies are needed for the application to work.
--
-- Deliberately NO policies are created for the anon and authenticated roles:
-- the browser must not read or write these tables directly. The publishable
-- anon key ships in the client bundle, so any policy granted to anon is
-- effectively granted to the public internet.
--
-- ORDER OF OPERATIONS - running this before the service-role key is deployed
-- will make every query in the app return nothing:
--   1. set SUPABASE_SERVICE_ROLE_KEY in Vercel (all environments)
--   2. deploy the code that uses it
--   3. only then run this migration

alter table public.cv_user_data            enable row level security;
alter table public.education               enable row level security;
alter table public.experience              enable row level security;
alter table public.languages               enable row level security;
alter table public.job_offers              enable row level security;
alter table public.generated_cv            enable row level security;
alter table public.generated_personal_data enable row level security;
alter table public.generated_education     enable row level security;
alter table public.generated_experience    enable row level security;
alter table public.generated_language      enable row level security;
alter table public.generated_skills        enable row level security;
alter table public.generated_prompt_plan   enable row level security;
alter table public.generated_experience_rewrite_instruction
                                           enable row level security;
alter table public.subscriptions           enable row level security;

-- Verify afterwards: every row must report rowsecurity = true.
--   select tablename, rowsecurity
--   from pg_tables
--   where schemaname = 'public'
--   order by tablename;
