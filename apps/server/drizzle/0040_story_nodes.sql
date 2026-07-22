-- Timeline / Chronicle content, moved out of the hardcoded web page so the
-- dashboard can edit chapters and operations. Each row is one node on the
-- season rail. kind ∈ (prologue|chapter|operation). seal is the badge glyph
-- (roman numeral or symbol); quote/outcome are used by operations.
create table if not exists story_nodes (
  id bigint generated always as identity primary key,
  kind text not null default 'chapter',
  seal text not null default '',
  tag text not null default '',
  duration text not null default '',
  title text not null default '',
  body text not null default '',
  quote text not null default '',
  outcome text not null default '',
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_story_nodes_position on story_nodes(position);

insert into story_nodes (kind, seal, tag, duration, title, body, quote, outcome, position) values
  ('prologue', '✦', 'PROLOGUE', '', 'The Fall of Pixl',
   'Origin has fallen. Centuries of every invention uploaded into the Core finally exceeded its limits — the overload became The Great Static, and the world crashed into pixelated fragments drifting in the Void. Unable to repair itself, the Core reaches into our universe and wakes the Builders.', '', '', 1),
  ('chapter', 'I', 'CHAPTER I', '3 WEEKS', 'Rise of Pixl',
   'Builders arrive in Pixl for the first time. They restore the Capital District, reactivate the Core, and help the first settlements recover from the Crash. Hope returns for the first time in centuries.', '', '', 2),
  ('operation', 'I', 'OPERATION I', '1 WEEK', 'Forge Weekend',
   'A mini online hackathon focused on developer tools.', 'The Capital is standing… but its workshops remain silent.', 'The <b>Great Forge</b> is restored — Pixl can manufacture advanced technology once again.', 3),
  ('chapter', 'II', 'CHAPTER II', '3 WEEKS', 'Echoes Beneath',
   'Power restored to the Great Forge awakens Vault Zero, an underground research facility buried since before the Crash. Builders uncover forgotten technology and the first clues about what truly caused Pixl''s downfall.', '', '', 4),
  ('operation', 'II', 'OPERATION II', '1 WEEK', 'Skybound Jam',
   'A week-long game jam.', 'The Sky Docks are almost ready.', 'The first <b>airships</b> return to service, opening travel beyond the known lands.', 5),
  ('chapter', 'III', 'CHAPTER III', '3 WEEKS', 'Beyond the Clouds',
   'Using the restored airships, Builders explore the floating Sky Isles. Ancient ruins, new allies, and strange relics hint that Pixl''s history is far older than anyone believed.', '', '', 6),
  ('operation', 'III', 'OPERATION III', '1 WEEK', 'Core Intelligence',
   'Builders create AI projects.', 'The Observatory requires new minds.', 'The <b>Observatory</b> is reactivated, letting the Core scan regions unreachable since the Crash.', 7),
  ('chapter', 'IV', 'CHAPTER IV', '3 WEEKS', 'The Signal',
   'The Observatory detects a mysterious transmission repeating from deep within the Void. As Builders investigate, they discover someone — or something — is trying to communicate with Pixl.', '', '', 8),
  ('operation', 'IV', 'OPERATION IV', '1 WEEK', 'Relay Protocol',
   'Builders create web apps, APIs, networking, or communication tools.', 'The transmission is unstable.', 'The signal is decoded, revealing <b>coordinates to a forgotten civilization</b>.', 9),
  ('chapter', 'V', 'CHAPTER V', '3 WEEKS', 'The Forgotten Frontier',
   'Builders journey beyond Pixl''s known borders and find the remnants of another civilization that survived the Crash in isolation. The chapter ends with an ancient gateway leading even farther into the unknown.', '', '', 10),
  ('operation', 'V', 'OPERATION V', '1 WEEK', 'Genesis Week',
   'Builders can create any type of project to help establish the first outpost beyond Pixl.', 'A new frontier awaits.', 'The <b>gateway is stabilized</b>, and the expedition into the unknown officially begins.', 11)
on conflict do nothing;
