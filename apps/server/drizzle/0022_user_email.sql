-- Store the Hack Club identity email so we have an exact key to resolve a
-- slack_id later (Slack users.lookupByEmail) and a second contact channel.
alter table users add column if not exists email text;
