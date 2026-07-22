-- Record which reviewer rejected a project so the owner can be told who and why.
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "reject_by" text NOT NULL DEFAULT '';
