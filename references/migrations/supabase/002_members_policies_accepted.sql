-- Supabase (Postgres): policy bundle acknowledgement at member signup (anon insert from client).
-- Apply in SQL Editor or your migration runner alongside app releases that bump MEMBER_POLICIES_ACCEPTED_VERSION.

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS policies_accepted_version text NULL,
  ADD COLUMN IF NOT EXISTS policies_accepted_at timestamptz NULL;

COMMENT ON COLUMN public.members.policies_accepted_version IS
  'Version string of refund/terms/privacy bundle shown at signup (shared MEMBER_POLICIES_ACCEPTED_VERSION).';
COMMENT ON COLUMN public.members.policies_accepted_at IS
  'UTC time when the member row was created with those policies acknowledged in the signup UI.';
