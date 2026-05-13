# Environment variables

Operational reference for **Links Golf** server and client. Values are never committed; set them in each deployment (Vercel, Fly, Docker, etc.) and in local `.env` / `.env.local` as your stack expects.

## Server (Node / Express + tRPC)

| Variable | Required | Purpose |
|----------|----------|---------|
| `PORT` | No | HTTP port (default `3000`). |
| `NODE_ENV` | No | `production` enforces a real `MEMBER_JWT_SECRET`; dev/test may use fallbacks. |
| `MEMBER_JWT_SECRET` | **Yes in production** | Signs the httpOnly member session cookie (min ~32 chars). |
| `REDIS_URL` | Recommended in production | OTP storage, send-OTP rate limits, welcome-once dedupe across **multiple** Node processes. Without it, in-memory stores are single-process only. |
| `RESEND_API_KEY` | For email | [Resend](https://resend.com) API key; OTP and welcome emails are skipped or fail closed when unset. |
| `SUPABASE_URL` or `VITE_SUPABASE_URL` | For DB-backed flows | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | For welcome + `member.me` | Service role: resolve member by email after OTP, `welcome_email_sent_at`, dashboard profile. Not required for OTP-only smoke tests if those paths are unused. |
| `TRUST_PROXY` | Behind CDN/LB | Set to `1` or `true` for one trusted hop, or a **positive integer** (hop count) so Express `req.ip` and `x-forwarded-for` parsing in rate limits match the real client. Omit or `0` / `false` when not behind a proxy. |
| `SEND_OTP_RATE_WINDOW_MS` | No | Override default OTP send rate-limit window. |
| `SEND_OTP_MAX_PER_EMAIL_PER_WINDOW` | No | Max OTP emails per address per window. |
| `SEND_OTP_MAX_PER_IP_PER_WINDOW` | No | Max OTP emails per client IP per window. |

## Client (Vite)

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Public Supabase URL (anon client). |
| `VITE_SUPABASE_ANON_KEY` | Public anon key for browser Supabase client. |

Other `VITE_*` keys follow your app’s `import.meta.env` usage.

## Related docs

- [`references/BACKLOG.md`](./BACKLOG.md) — Resend, Redis, OTP, trust proxy notes.
- [`references/migrations/supabase/`](./migrations/supabase/) — SQL for optional columns (e.g. welcome email timestamp).
