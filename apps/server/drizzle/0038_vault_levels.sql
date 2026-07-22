-- The Core Vault: community goals. Every approved hour shipped is Restoration
-- Energy; the whole community's energy is pooled and unlocks vault levels for
-- everyone at once (unlike trophies in 0032, which are per-player milestones).
-- energy_required is the community total (in energy units = approved hours)
-- needed to recover this level. rewards is a display list of what the Core
-- hands back at that level — cosmetic equipment, not NPC gifts.
create table if not exists vault_levels (
  id bigint generated always as identity primary key,
  level integer not null unique,
  energy_required integer not null,
  title text not null default '',
  blurb text not null default '',
  rewards jsonb not null default '[]'::jsonb,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into vault_levels (level, energy_required, title, blurb, rewards, position) values
  (1, 250, 'Capital District', 'The first lights flicker back on across the ruined capital.',
    '[{"icon":"🏙️","label":"Capital banner"},{"icon":"🎖️","label":"Founder title"}]'::jsonb, 1),
  (2, 750, 'The Great Forge', 'Power returns to the workshops. Pixl can manufacture again.',
    '[{"icon":"🔨","label":"Forge profile frame"},{"icon":"🧱","label":"Building material"}]'::jsonb, 2),
  (3, 1800, 'Vault Zero', 'An underground research facility, sealed since before the Crash, reopens.',
    '[{"icon":"🦊","label":"Pixel fox pet"},{"icon":"🗝️","label":"Vault Zero title"}]'::jsonb, 3),
  (4, 3500, 'The Sky Docks', 'The first airships in centuries lift off, opening the skies.',
    '[{"icon":"🚢","label":"Airship banner"},{"icon":"🪂","label":"Skybound frame"}]'::jsonb, 4),
  (5, 6000, 'The Observatory', 'The Core scans regions unreachable since the Great Static.',
    '[{"icon":"🔭","label":"Observer title"},{"icon":"🌌","label":"Void-touched frame"},{"icon":"⭐","label":"Exclusive pet"}]'::jsonb, 5)
on conflict (level) do nothing;
