import { useCallback, useEffect, useRef } from "react";

const IDLE_MS = 60_000;

/**
 * Counts active study seconds: only while the tab is visible and the user
 * touched the page in the last minute. Idle gaps are never counted.
 * `take()` returns the seconds accumulated so far and resets the counter.
 */
export function useStudyClock() {
  const secs = useRef(0);
  const lastActive = useRef(Date.now());

  useEffect(() => {
    const touch = () => { lastActive.current = Date.now(); };
    const events = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible" && Date.now() - lastActive.current < IDLE_MS) secs.current += 1;
    }, 1000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, touch));
      window.clearInterval(id);
    };
  }, []);

  return useCallback(() => {
    const s = secs.current;
    secs.current = 0;
    return s;
  }, []);
}
