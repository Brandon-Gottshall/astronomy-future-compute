const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function getRandomBytes(n) {
  const bytes = new Uint8Array(n);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
    return bytes;
  }
  const nodeCrypto = require("node:crypto");
  nodeCrypto.webcrypto.getRandomValues(bytes);
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
  const p = params.get("p") || null;
  const asRaw = params.get("as") || null;
  const as = allowedSpeakers && asRaw && !allowedSpeakers.includes(asRaw) ? null : asRaw;
  return { s, p, as };
}

export function isAuthorizedControl(message, { expected }) {
  return Boolean(message && message.pin && message.pin === expected);
}

export const CHANNEL_PREFIX = "astro-pres-";
export const EVENT_STATE_CHANGED = "state:changed";
export const EVENT_REMOTE_HEARTBEAT = "remote:heartbeat";
export const EVENT_CONTROL = "control";

export const PHASE_SETUP = "setup";
export const PHASE_LIVE = "live";
