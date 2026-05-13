import * as jose from "jose";

const ALG = "HS256";
/** Dev/test only — production requires MEMBER_JWT_SECRET (32+ chars). */
const DEV_FALLBACK_SECRET = "links-golf-member-jwt-dev-only-do-not-use-in-prod!!";

export type MemberJwtPayload = {
  sub: string;
  email: string;
};

function getEncodedSecret(): Uint8Array {
  const fromEnv = process.env.MEMBER_JWT_SECRET?.trim();
  if (fromEnv && fromEnv.length >= 32) {
    return new TextEncoder().encode(fromEnv);
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "MEMBER_JWT_SECRET must be set in production (at least 32 characters)."
    );
  }
  return new TextEncoder().encode(DEV_FALLBACK_SECRET);
}

const MEMBER_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export async function signMemberSessionToken(
  payload: MemberJwtPayload
): Promise<string> {
  const secret = getEncodedSecret();
  return new jose.SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: ALG })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${MEMBER_SESSION_MAX_AGE_SEC}s`)
    .sign(secret);
}

export async function verifyMemberSessionToken(
  token: string
): Promise<MemberJwtPayload | null> {
  try {
    const secret = getEncodedSecret();
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [ALG],
    });
    const sub = typeof payload.sub === "string" ? payload.sub : "";
    const email =
      typeof payload.email === "string" ? payload.email.toLowerCase() : "";
    if (!sub || !email) return null;
    return { sub, email };
  } catch {
    return null;
  }
}

export { MEMBER_SESSION_MAX_AGE_SEC };
