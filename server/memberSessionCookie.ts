import { parse } from "cookie";
import { MEMBER_SESSION_COOKIE } from "@shared/const";
import { verifyMemberSessionToken } from "./memberJwt";

export async function readMemberSessionFromRequest(req: {
  headers: { cookie?: string | string[] | undefined };
}): Promise<{ memberId: string; email: string } | null> {
  const raw = req.headers.cookie;
  const cookieHeader = Array.isArray(raw) ? raw.join("; ") : raw;
  if (!cookieHeader) return null;

  const token = parse(cookieHeader)[MEMBER_SESSION_COOKIE];
  if (!token) return null;

  const payload = await verifyMemberSessionToken(token);
  if (!payload) return null;
  return { memberId: payload.sub, email: payload.email };
}
