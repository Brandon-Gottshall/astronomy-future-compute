import { CHANNEL_PREFIX } from "./session.js";

export function normalizePresentationScope(raw = "") {
  const value = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return value || "local";
}

export function getClientPresentationScope() {
  if (typeof window === "undefined") return "local";
  return normalizePresentationScope(window.location.host);
}

export function getPresentationScopeFromHeaders(headers) {
  const origin = headers?.get?.("origin");
  if (origin) {
    try {
      return normalizePresentationScope(new URL(origin).host);
    } catch (e) {
      /* ignore */
    }
  }
  return normalizePresentationScope(
    headers?.get?.("x-forwarded-host") || headers?.get?.("host") || "local"
  );
}

export function getPresentationScopeFromRequest(req) {
  return getPresentationScopeFromHeaders(req.headers);
}

export function getPresentationChannelName(sessionId, scope) {
  return `${CHANNEL_PREFIX}-${normalizePresentationScope(scope)}-${sessionId}`;
}
