export type AnalyticsEventType = "page_view" | "click" | "read_milestone";

function getVisitorId() {
  try {
    const key = "iyanu-analytics-visitor";
    let id = window.localStorage.getItem(key);
    if (!id) {
      id = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return "anonymous-session";
  }
}

function getSessionId() {
  try {
    const key = "iyanu-analytics-session";
    let id = window.sessionStorage.getItem(key);
    if (!id) {
      id = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      window.sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return getVisitorId();
  }
}

function shouldSendPageView(path: string) {
  try {
    // React Strict Mode intentionally replays effects in development. This short
    // per-tab guard prevents that replay from counting as a second view.
    const key = `iyanu-analytics-last-view:${path}`;
    const now = Date.now();
    const previous = Number(window.sessionStorage.getItem(key) || 0);
    if (previous && now - previous < 5000) return false;
    window.sessionStorage.setItem(key, String(now));
    return true;
  } catch {
    return true;
  }
}

export function trackAnalytics(event: {
  type: AnalyticsEventType;
  path: string;
  slug?: string;
  label?: string;
  target?: string;
  milestone?: number;
}) {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem("iyanu-analytics-opt-out") === "true") return;
  } catch { /* Tracking may proceed without local storage. */ }
  const path = event.path.split("?")[0].slice(0, 300);
  if (event.type === "page_view" && !shouldSendPageView(path)) return;
  const payload = { ...event, visitorId: getVisitorId(), sessionId: getSessionId(), path };
  try {
    void fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Analytics should never interrupt the reading experience.
  }
}
