import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { signMemberSessionToken } from "./memberJwt";
import { MEMBER_SESSION_COOKIE } from "@shared/const";

const TEST_MEMBER_ID = "550e8400-e29b-41d4-a716-446655440000";

vi.mock("./memberProfileFromDb", () => ({
  fetchMemberProfileForSession: vi.fn(),
}));

import { fetchMemberProfileForSession } from "./memberProfileFromDb";

const profileMock = fetchMemberProfileForSession as unknown as ReturnType<
  typeof vi.fn
>;

describe("member.me", () => {
  beforeEach(() => {
    profileMock.mockReset();
  });

  it("returns null when there is no session cookie", async () => {
    const caller = appRouter.createCaller({
      req: { headers: {}, protocol: "https" } as any,
      res: {} as any,
      user: null,
    });
    expect(await caller.member.me()).toBeNull();
    expect(profileMock).not.toHaveBeenCalled();
  });

  it("returns profile when session cookie is valid", async () => {
    const token = await signMemberSessionToken({
      sub: TEST_MEMBER_ID,
      email: "member@example.com",
    });
    profileMock.mockResolvedValueOnce({
      firstName: "Pat",
      lastName: "Lee",
      memberNumber: "LGM-550E84",
      email: "member@example.com",
      phone: "+1",
      joinDateIso: "2026-01-01T00:00:00.000Z",
      renewalDateIso: "2027-01-01T00:00:00.000Z",
      photoUrl: null,
    });

    const cookie = `${MEMBER_SESSION_COOKIE}=${encodeURIComponent(token)}`;
    const caller = appRouter.createCaller({
      req: { headers: { cookie }, protocol: "https" } as any,
      res: {} as any,
      user: null,
    });

    const me = await caller.member.me();
    expect(me).toEqual({
      firstName: "Pat",
      lastName: "Lee",
      memberNumber: "LGM-550E84",
      email: "member@example.com",
      phone: "+1",
      joinDateIso: "2026-01-01T00:00:00.000Z",
      renewalDateIso: "2027-01-01T00:00:00.000Z",
      photoUrl: null,
    });
    expect(profileMock).toHaveBeenCalledWith(
      TEST_MEMBER_ID,
      "member@example.com"
    );
  });
});
