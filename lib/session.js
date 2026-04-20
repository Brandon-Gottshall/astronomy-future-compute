const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
export const PRESENTATION_STORAGE_KEY = "astro-present:v2";
export const PAIR_TOKEN_RAW_LENGTH = 22;

function getRandomBytes(n) {
  const bytes = new Uint8Array(n);
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues) {
    throw new Error("crypto.getRandomValues is unavailable in this runtime");
  }
  cryptoApi.getRandomValues(bytes);
  return bytes;
}

export function generateSessionId() {
  const bytes = getRandomBytes(8);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export function generatePin() {
  const bytes = getRandomBytes(4);
  return Array.from(bytes, (b) => (b % 10).toString()).join("");
}

export function parseSessionParams(params, allowedSpeakers = null) {
  const s = params.get("s") || null;
  const asRaw = params.get("as") || null;
  const as = allowedSpeakers && asRaw && !allowedSpeakers.includes(asRaw) ? null : asRaw;
  const pt = params.get("pt") || null;
  return { s, as, pt };
}

export function isValidPin(pin) {
  return typeof pin === "string" && /^\d{4}$/.test(pin);
}

export function getRemoteStorageKey(sessionId, speakerId) {
  return `${PRESENTATION_STORAGE_KEY}:remote:${sessionId}:${speakerId}`;
}

export function sanitizePairToken(value = "") {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function formatPairToken(value = "") {
  const clean = sanitizePairToken(value).slice(0, PAIR_TOKEN_RAW_LENGTH);
  return [clean.slice(0, 6), clean.slice(6, 12), clean.slice(12)].filter(Boolean).join("-");
}

export const CHANNEL_PREFIX = "astro-pres";
export const EVENT_STATE_CHANGED = "state:changed";
export const EVENT_REMOTE_HEARTBEAT = "remote:heartbeat";
export const EVENT_CONTROL = "control";

export const PHASE_SETUP = "setup";
export const PHASE_LIVE = "live";
