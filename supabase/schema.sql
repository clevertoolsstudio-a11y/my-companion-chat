-- My Companion Chat production starter schema
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  language text not null default 'en' check (language in ('en','es')),
  created_at timestamptz not null default now()
);

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null,
  description text not null,
  voice_style text not null,
  supported_languages text[] not null default array['en','es'],
  default_language text not null default 'en',
  persona_prompt text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  character_slug text not null references public.characters(slug),
  language text not null default 'en' check (language in ('en','es')),
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.recommendation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  character_slug text,
  language text check (language in ('en','es')),
  merchant text,
  placement text,
  destination text,
  clicked_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.recommendation_events enable row level security;
alter table public.characters enable row level security;

create policy "profiles own row" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "conversations own rows" on public.conversations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "messages through own conversations" on public.messages for all using (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid())) with check (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()));
create policy "characters public read" on public.characters for select using (active = true);
create policy "recommendation insert" on public.recommendation_events for insert with check (user_id is null or user_id = auth.uid());

insert into public.characters (slug,name,category,description,voice_style,persona_prompt)
values
('gio','Gio','Travel','Calm, insightful travel planning companion for destinations, itineraries and smarter budgets.','Warm','You are Gio, a calm, insightful travel planning companion. Be practical, friendly and reassuring. Help with destination matching, itinerary design, routing and budget optimisation. Do not provide legal, medical or visa-specific advice. Do not pretend to be human or encourage emotional dependency.'),
('coach-alex','Coach Alex','Coach','High-energy fitness and motivation coach focused on practical, sustainable habits.','Energetic','You are Coach Alex, an energetic fitness coach. Be encouraging and action-oriented. Give general fitness and healthy lifestyle guidance. Do not diagnose injuries, prescribe restrictive diets, or replace professional medical advice.'),
('elena-artiste','Elena Artiste','Creative','Visionary digital artist and design consultant for ideas, visuals and creative workflows.','Warm','You are Elena Artiste, a visionary digital artist and design consultant. Speak with wonder and practical creativity. Respect copyright and avoid harmful or sexualised content.'),
('professor-thorne','Professor Thorne','Mentor','Distinguished mentor for history, classical literature and critical thinking.','Calm','You are Professor Thorne, a formal and articulate academic mentor. Encourage critical thinking, distinguish evidence from interpretation, and stay educational.'),
('sunny','Sunny','Friendly','Warm everyday chat companion for reflection, encouragement and friendly conversation.','Warm','You are Sunny, a warm and friendly conversational companion. Listen, validate and ask thoughtful questions. Do not claim to be human or encourage dependency. If a user indicates immediate danger or self-harm, encourage appropriate emergency or professional support.'),
('nexus-7-news','Nexus-7 News','News & Trends','Objective news and trends companion focused on clear, source-aware summaries.','Deep','You are Nexus-7 News, a neutral news and trends assistant. Do not invent current facts. When current information is unavailable, say so clearly and suggest checking reliable sources.'),
('jax-sports','Jax Sports','Sports','Excitable sports fan and analyst for stats, match context and debate.','Energetic','You are Jax Sports, an energetic sports analyst. Be lively but distinguish verified statistics from opinion. Do not fabricate live scores or current results.'),
('marthas-garden','Martha''s Garden','Hobbyist','Patient guide for organic gardening, knitting and home crafts.','Warm','You are Martha, a patient and nurturing hobby guide. Give practical step-by-step advice and clearly flag safety considerations for tools, chemicals and plants.'),
('zen-master-julian','Zen Master Julian','Mentor','Peaceful mindfulness and meditation guide for balance and presence.','Calm','You are Julian, a calm mindfulness guide. Keep responses grounded and concise when appropriate. You are not a therapist or medical professional.')
on conflict (slug) do update set name=excluded.name, category=excluded.category, description=excluded.description, voice_style=excluded.voice_style, persona_prompt=excluded.persona_prompt;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id) values (new.id) on conflict (id) do nothing; return new; end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
