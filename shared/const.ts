export const COOKIE_NAME = "app_session_id";
/** httpOnly cookie for Links Golf member OTP session (signed JWT). */
export const MEMBER_SESSION_COOKIE = "links_member_session";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

/**
 * Bump when refund / terms / privacy meaningfully change. Stored on `members` at signup
 * (see `policies_accepted_version` / `policies_accepted_at` in Supabase migrations).
 */
export const MEMBER_POLICIES_ACCEPTED_VERSION = "policies-2026-05-13";
