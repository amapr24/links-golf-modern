-- Supabase (Postgres): idempotent welcome email tracking on members.
-- Apply in SQL Editor or your migration runner before relying on DB-backed dedupe.

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS welcome_email_sent_at timestamptz NULL;

COMMENT ON COLUMN public.members.welcome_email_sent_at IS
  'First time the post-OTP welcome email was sent; used with Redis fallback in welcomeEmailOnce.';
