-- Player-card photos: avatar_url (already in the schema) holds the Slack
-- profile photo or a custom upload; card_pixelate says whether the game
-- renders it pixel-art style.
alter table users add column if not exists card_pixelate boolean not null default true;
