import { useEffect, useState } from "react";

/**
 * True when the primary pointer is coarse (typical touch / tablet).
 * Used to avoid `background-attachment: fixed`, which is costly and unreliable on mobile Safari.
 */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarse(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return coarse;
}
