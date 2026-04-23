import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { trackMetaPageView } from "@/lib/meta-capi.functions";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function generateEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function runWhenIdle(cb: () => void) {
  if (typeof window === "undefined") return;
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(cb, { timeout: 2000 });
  } else {
    setTimeout(cb, 1);
  }
}

/**
 * Sends a deduplicated PageView event to both the Meta Pixel (browser)
 * and the Meta Conversions API (server) on every route change.
 * Deduplication is handled by Meta using the shared event_id.
 * Both calls are deferred to idle time so they never block navigation.
 */
export function MetaPageViewTracker() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (lastTrackedRef.current === pathname) return;
    lastTrackedRef.current = pathname;

    const eventId = generateEventId();
    const eventSourceUrl = window.location.href;

    runWhenIdle(() => {
      // Browser pixel
      if (typeof window.fbq === "function") {
        window.fbq("track", "PageView", {}, { eventID: eventId });
      }
      // Server-side CAPI (deduplicated via event_id)
      trackMetaPageView({ data: { eventId, eventSourceUrl } }).catch((err) => {
        console.warn("[meta-capi] tracker failed", err);
      });
    });
  }, [pathname]);

  return null;
}
