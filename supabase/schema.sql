-- ================================================================
-- ÉCHIQUIER ROYAL — Schéma Supabase complet
-- Coller dans l'éditeur SQL de votre projet Supabase
-- ================================================================

-- ── Extensions ──────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Table : site_config (contenu personnalisable du site) ───────
create table if not exists site_config (
  key   text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Valeurs par défaut
insert into site_config (key, value) values
  ('club_name',        '"Échiquier Royal"'),
  ('club_subtitle',    '"Club d''échecs"'),
  ('club_founded',     '"1987"'),
  ('club_description', '"Club d''échecs passionné depuis 1987. Rejoignez notre communauté de joueurs de tous niveaux."'),
  ('club_address',     '"12 Rue de la Tour, 75016 Paris"'),
  ('club_email',       '"contact@echiquier-royal.fr"'),
  ('club_phone',       '"01 42 88 77 66"'),
  ('club_members',     '"40+"'),
  ('club_teams',       '"2"'),
  ('schedule', '[
    {"day": "Mardi",  "hours": "18h – 21h"},
    {"day": "Jeudi",  "hours": "18h – 21h"},
    {"day": "Samedi", "hours": "14h – 18h"}
  ]'),
  ('hero_title',    '"Votre prochain coup commence ici"'),
  ('hero_subtitle', '"Rejoignez l''Échiquier Royal et progressez dans un cadre convivial, que vous soyez débutant ou joueur confirmé."'),
  ('about_title',   '"Un club forgé par la passion des 64 cases"'),
  ('about_text',    '"L''Échiquier Royal a été fondé par un groupe de passionnés souhaitant créer un espace dédié à la pratique et à l''enseignement des échecs."'),
  ('values', '[
    {"title": "Transmission", "desc": "Nous croyons que chaque joueur expérimenté a le devoir de transmettre son savoir."},
    {"title": "Fair-play",    "desc": "Le respect de l''adversaire est au cœur de chaque partie."},
    {"title": "Excellence",   "desc": "Nous encourageons chaque membre à repousser ses limites."}
  ]'),
  ('faq', '[
    {"q": "Quand et où se déroulent les séances ?", "a": "Le mardi soir (18h–21h), le jeudi soir (18h–21h) et le samedi matin (14h–18h)."},
    {"q": "Je suis débutant, est-ce que je peux venir ?", "a": "Absolument ! Première séance d''essai gratuite."},
    {"q": "Quel est le montant de la cotisation ?", "a": "60€/an pour les adultes, 30€ pour les moins de 18 ans."},
    {"q": "Comment participer aux tournois extérieurs ?", "a": "Il faut être licencié FFE. Le club prend en charge les démarches."},
    {"q": "Y a-t-il des cours pour progresser ?", "a": "Oui ! Cours collectifs et séances d''analyse en groupe."}
  ]')
on conflict (key) do nothing;

-- ── Table : tournaments ─────────────────────────────────────────
create table if not exists tournaments (
  id                    uuid primary key default uuid_generate_v4(),
  title                 text not null,
  date                  text not null,
  cadence               text,
  type                  text default 'Blitz',
  rounds                int  default 7,
  location              text,
  spots                 int  default 0,
  total                 int  default 0,
  description           text,
  price                 text,
  arbitre               text,
  homologue             boolean default false,
  niveaux               text,
  contact               text,
  fiches_techniques_urls text[]  default '{}',
  photos_urls           text[]  default '{}',
  is_past               boolean default false,
  winner                text,
  participants          int,
  winner_medal          text,
  winner_note           text,
  display_order         int  default 0,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ── Table : posts (réalisations / feed) ─────────────────────────
create table if not exists posts (
  id          uuid primary key default uuid_generate_v4(),
  type        text not null check (type in ('photo', 'annonce', 'resultat')),
  author      text not null,
  author_role text default 'Membre',
  title       text,
  content     text not null,
  images_urls text[] default '{}',
  tag         text,
  tag_color   text default 'bg-blue-100 text-blue-700',
  likes       int  default 0,
  published   boolean default true,
  display_order int default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── Table : registrations (inscriptions aux tournois) ───────────
create table if not exists registrations (
  id              uuid primary key default uuid_generate_v4(),
  tournament_id   uuid references tournaments(id) on delete cascade,
  type            text not null check (type in ('solo', 'club')),
  -- Solo
  nom             text,
  prenom          text,
  fide_id         text,
  club            text,
  -- Club
  nom_club        text,
  responsable     text,
  telephone       text,
  joueurs         jsonb default '[]',
  created_at      timestamptz default now()
);

-- ── Table : gallery (galerie photos accueil) ────────────────────
create table if not exists gallery (
  id            uuid primary key default uuid_generate_v4(),
  url           text not null,
  caption       text,
  date_label    text,
  display_order int  default 0,
  created_at    timestamptz default now()
);

-- ── Triggers updated_at ─────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger tournaments_updated_at before update on tournaments
  for each row execute function set_updated_at();

create trigger posts_updated_at before update on posts
  for each row execute function set_updated_at();

-- ── RLS (Row Level Security) ─────────────────────────────────────
alter table site_config    enable row level security;
alter table tournaments    enable row level security;
alter table posts          enable row level security;
alter table registrations  enable row level security;
alter table gallery        enable row level security;

-- Lecture publique pour tout le monde
create policy "public read site_config"   on site_config   for select using (true);
create policy "public read tournaments"   on tournaments   for select using (true);
create policy "public read posts"         on posts         for select using (published = true);
create policy "public read gallery"       on gallery       for select using (true);

-- Insertion registrations publique (formulaire d'inscription)
create policy "public insert registrations" on registrations for insert with check (true);

-- Écriture réservée aux utilisateurs authentifiés (admins)
create policy "auth write site_config"   on site_config   for all using (auth.role() = 'authenticated');
create policy "auth write tournaments"   on tournaments   for all using (auth.role() = 'authenticated');
create policy "auth write posts"         on posts         for all using (auth.role() = 'authenticated');
create policy "auth write registrations" on registrations for select using (auth.role() = 'authenticated');
create policy "auth write gallery"       on gallery       for all using (auth.role() = 'authenticated');

-- ── Storage buckets ─────────────────────────────────────────────
-- Créer dans Supabase Dashboard > Storage :
--   Bucket "tournament-fiches"  (public)
--   Bucket "tournament-photos"  (public)
--   Bucket "post-images"        (public)
--   Bucket "gallery"            (public)

-- ── Ajout des clés pour la page À propos ──────────────────────────
insert into site_config (key, value) values
  ('about_hero_title', '"Un club forgé par la passion des 64 cases"'),
  ('about_story_title', '"Notre histoire"'),
  ('about_story_paragraphs', '[
    "L''Échiquier Royal a été fondé par un groupe de passionnés souhaitant créer un espace dédié à la pratique et à l''enseignement des échecs.",
    "Au fil des décennies, le club a formé des centaines de joueurs, produit des champions régionaux et nationaux, et tissé des liens avec des clubs à travers toute l''Europe.",
    "Aujourd''hui, nous sommes fiers de compter des membres actifs de tous niveaux, engagés en championnats et reconnus par la Fédération des Échecs."
  ]'),
  ('about_venue_title', '"Un cadre exceptionnel"'),
  ('about_venue_subtitle', '"Notre salle"'),
  ('about_venue_text', '"Notre salle de jeu offre un environnement calme et propice à la concentration, avec des échiquiers permanents, une bibliothèque spécialisée et un espace d''analyse équipé."'),
  ('about_story_image_url', 'null'),
  ('about_venue_image_url', 'null')
on conflict (key) do nothing;

-- ── IMPORTANT : augmenter la limite postgres pour les base64 ──────
-- À exécuter dans SQL Editor si les images sont tronquées :
-- ALTER TABLE tournaments ALTER COLUMN fiches_techniques_urls TYPE text[];
-- ALTER TABLE posts ALTER COLUMN images_urls TYPE text[];
-- ALTER TABLE gallery ALTER COLUMN url TYPE text;
-- (normalement text est déjà illimité dans postgres — rien à faire)

-- ── Ajout des champs podium (à exécuter si le schéma existe déjà) ──────────
alter table tournaments add column if not exists podium_1 text;
alter table tournaments add column if not exists podium_2 text;
alter table tournaments add column if not exists podium_3 text;
alter table tournaments add column if not exists date_iso date;

-- ── Nouvelles clés de config ──────────────────────────────────────
insert into site_config (key, value) values
  ('hero_image_url',   'null'),
  ('post_categories',  '[]'),
  ('season_stats', '[
    {"label": "Tournois joués", "value": "8"},
    {"label": "Victoires", "value": "3"},
    {"label": "Podiums équipe", "value": "2"},
    {"label": "Séances", "value": "42"}
  ]')
on conflict (key) do nothing;
