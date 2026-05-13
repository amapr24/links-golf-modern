import { trpc } from "@/lib/trpc";

/**
 * True when the Links Golf member OTP session cookie is present and valid
 * (`member.session`). Not the same as platform `auth.me`.
 */
export function useHasMemberSession(): boolean {
  const { data, isPending } = trpc.member.session.useQuery(undefined, {
    staleTime: 60_000,
  });
  if (isPending) return false;
  return data != null;
}
