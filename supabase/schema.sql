-- ================================================================
-- ÉCHIQUIER ROYAL — Schéma Supabase complet
-- Coller dans l'éditeur SQL de votre projet Supabase
-- ================================================================

create extension if not exists "uuid-ossp";

-- ── Reset propre ─────────────────────────────────────────────────
drop table if exists registrations cascade;
drop table if exists tournaments cascade;
drop table if exists posts cascade;
drop table if exists gallery cascade;
drop table if exists site_config cascade;

-- ── site_config ──────────────────────────────────────────────────
create table site_config (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz default now()
);

insert into site_config (key, value) values
  ('club_name',        '"CSA Akbou Chess"'),
  ('club_subtitle',    '"Club d''échecs"'),
  ('club_founded',     '"1987"'),
  ('club_description', '"Club d''échecs passionné depuis 1987. Rejoignez notre communauté de joueurs de tous niveaux."'),
  ('club_address',     '""'),
  ('club_email',       '""'),
  ('club_phone',       '""'),
  ('club_members',     '"40+"'),
  ('club_teams',       '"2"'),
  ('schedule', '[{"day":"Mardi","hours":"18h – 21h"},{"day":"Jeudi","hours":"18h – 21h"},{"day":"Samedi","hours":"14h – 18h"}]'),
  ('hero_title',    '""'),
  ('hero_subtitle', '""'),
  ('hero_image_url', 'null'),
  ('about_title',   '""'),
  ('about_text',    '""'),
  ('about_hero_title', '""'),
  ('about_story_title', '"Notre histoire"'),
  ('about_story_paragraphs', '[]'),
  ('about_venue_title', '"Un cadre exceptionnel"'),
  ('about_venue_subtitle', '"Notre salle"'),
  ('about_venue_text', '"Notre salle de jeu offre un environnement calme et propice à la concentration."'),
  ('about_story_image_url', 'null'),
  ('about_venue_image_url', 'null'),
  ('values', '[{"title":"Transmission","desc":"Nous croyons que chaque joueur expérimenté a le devoir de transmettre son savoir."},{"title":"Fair-play","desc":"Le respect de l''adversaire est au cœur de chaque partie."},{"title":"Excellence","desc":"Nous encourageons chaque membre à repousser ses limites."}]'),
  ('faq', '[{"q":"Quand et où se déroulent les séances ?","a":"Le mardi, jeudi et samedi."},{"q":"Je suis débutant ?","a":"Absolument ! Première séance gratuite."},{"q":"Cotisation ?","a":"60€/an adultes, 30€ moins de 18 ans."}]'),
  ('season_stats', '[{"label":"Tournois joués","value":"8"},{"label":"Victoires","value":"3"},{"label":"Podiums équipe","value":"2"},{"label":"Séances","value":"42"}]'),
  ('social_facebook',  '""'),
  ('social_instagram', '""'),
  ('social_whatsapp',  '""'),
  ('social_youtube',   '""'),
  ('club_tournaments_per_year', '"12"'),
  ('post_types', '[]'),
  ('post_categories', '[]')
on conflict (key) do nothing;

-- ── tournaments ──────────────────────────────────────────────────
create table tournaments (
  id                     uuid primary key default uuid_generate_v4(),
  title                  text not null,
  date                   text not null,
  date_iso               date,
  cadence                text,
  type                   text default 'Blitz',
  rounds                 int  default 7,
  location               text,
  description            text,
  homologue              boolean default false,
  niveaux                text,
  fiches_techniques_urls text[] default '{}',
  photos_urls            text[] default '{}',
  is_past                boolean default false,
  winner                 text,
  participants           int,
  winner_medal           text,
  winner_note            text,
  podium_1               text,
  podium_2               text,
  podium_3               text,
  registrations_closed   boolean default false,
  display_order          int  default 0,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

-- ── posts ────────────────────────────────────────────────────────
create table posts (
  id            uuid primary key default uuid_generate_v4(),
  type          text not null default 'annonce',
  author        text not null,
  author_role   text default 'Membre',
  title         text,
  content       text not null,
  images_urls   text[] default '{}',
  tag           text,
  tag_color     text default 'bg-blue-100 text-blue-700',
  published     boolean default true,
  display_order int  default 0,
  custom_date   timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── registrations ────────────────────────────────────────────────
create table registrations (
  id            uuid primary key default uuid_generate_v4(),
  tournament_id uuid references tournaments(id) on delete cascade,
  type          text not null check (type in ('solo', 'club')),
  nom           text,
  prenom        text,
  fide_id       text,
  club          text,
  nom_club      text,
  responsable   text,
  telephone     text,
  date_naissance date,
  joueurs       jsonb default '[]',  -- Pour clubs : [{nom, prenom, fideId, dateNaissance}]
  created_at    timestamptz default now()
);

-- ── gallery ──────────────────────────────────────────────────────
create table gallery (
  id            uuid primary key default uuid_generate_v4(),
  url           text not null,
  caption       text,
  date_label    text,
  display_order int  default 0,
  created_at    timestamptz default now()
);

-- ── players ──────────────────────────────────────────────────────
create table players (
  id             uuid primary key default uuid_generate_v4(),
  nom            text not null,
  prenom         text not null,
  date_naissance date,
  categorie      text,
  fide_id        text,
  role           text,
  display_order  int default 0,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ── Triggers ─────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger tournaments_updated_at before update on tournaments
  for each row execute function set_updated_at();
create trigger posts_updated_at before update on posts
  for each row execute function set_updated_at();
create trigger players_updated_at before update on players
  for each row execute function set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────
alter table site_config    enable row level security;
alter table tournaments    enable row level security;
alter table posts          enable row level security;
alter table registrations  enable row level security;
alter table gallery        enable row level security;
alter table players        enable row level security;

create policy "public read site_config"       on site_config   for select using (true);
create policy "public read tournaments"        on tournaments   for select using (true);
create policy "public read posts"              on posts         for select using (published = true);
create policy "public read gallery"            on gallery       for select using (true);
create policy "public read players"            on players       for select using (true);
create policy "public insert registrations"    on registrations for insert with check (true);
create policy "auth write site_config"         on site_config   for all using (auth.role() = 'authenticated');
create policy "auth write tournaments"         on tournaments   for all using (auth.role() = 'authenticated');
create policy "auth write posts"               on posts         for all using (auth.role() = 'authenticated');
create policy "auth write registrations"       on registrations for select using (auth.role() = 'authenticated');
create policy "auth write gallery"             on gallery       for all using (auth.role() = 'authenticated');
create policy "auth write players"             on players       for all using (auth.role() = 'authenticated');
