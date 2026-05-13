import { describe, it, expect } from "vitest";
import { signMemberSessionToken, verifyMemberSessionToken } from "./memberJwt";

describe("memberJwt", () => {
  it("round-trips member claims", async () => {
    const token = await signMemberSessionToken({
      sub: "550e8400-e29b-41d4-a716-446655440000",
      email: "member@example.com",
    });
    const out = await verifyMemberSessionToken(token);
    expect(out).toEqual({
      sub: "550e8400-e29b-41d4-a716-446655440000",
      email: "member@example.com",
    });
  });

  it("rejects tampered token", async () => {
    const token = await signMemberSessionToken({
      sub: "550e8400-e29b-41d4-a716-446655440000",
      email: "a@b.com",
    });
    const tampered = token.slice(0, -4) + "xxxx";
    expect(await verifyMemberSessionToken(tampered)).toBeNull();
  });
});
