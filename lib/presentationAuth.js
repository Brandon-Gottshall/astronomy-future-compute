import { createHmac, timingSafeEqual } from "node:crypto";
import { formatPairToken, PAIR_TOKEN_RAW_LENGTH, sanitizePairToken } from "./session.js";

export const PAIR_TOKEN_TTL_SECONDS = 2 * 60;
export const PRESENTER_TOKEN_TTL_SECONDS = 8 * 60 * 60;
export const STAGE_TOKEN_TTL_SECONDS = 8 * 60 * 60;

class PresentationAuthError extends Error {
  constructor(code, message = code) {
    super(message);
    this.code = code;
  }
}

function getTokenSecret() {
  const secret = process.env.PRESENTATION_TOKEN_SECRET;
  if (!secret) {
    throw new PresentationAuthError("presentation-secret-missing");
  }
  return secret;
}

function sign(value) {
  return createHmac("sha256", getTokenSecret()).update(value).digest("base64url");
}

function shortSignature(prefix, values, length) {
  return createHmac("sha256", getTokenSecret())
    .update([prefix, ...values].join("|"))
    .digest("hex")
    .slice(0, length)
    .toUpperCase();
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function createSignedToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function parseSignedToken(token, expectedKind, { scope, now = Date.now() } = {}) {
  if (typeof token !== "string" || !token.includes(".")) {
    throw new PresentationAuthError("invalid-token");
  }
  const [body, signature] = token.split(".");
  if (!body || !signature || !safeEqual(signature, sign(body))) {
    throw new PresentationAuthError("invalid-token");
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (payload.kind !== expectedKind) {
    throw new PresentationAuthError("invalid-token");
  }
  if (typeof payload.exp !== "number" || payload.exp * 1000 <= now) {
    throw new PresentationAuthError("expired-token");
  }
  if (scope && payload.scope !== scope) {
    throw new PresentationAuthError("scope-mismatch");
  }
  return payload;
}

export function createStageToken({ sessionId, pin, scope, now = Date.now() }) {
  return createSignedToken({
    kind: "stage",
    sessionId,
    pin,
    scope,
    iat: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + STAGE_TOKEN_TTL_SECONDS,
  });
}

export function verifyStageToken(stageToken, options = {}) {
  return parseSignedToken(stageToken, "stage", options);
}

export function createPresenterToken({ sessionId, speakerId, scope, now = Date.now() }) {
  return createSignedToken({
    kind: "presenter",
    sessionId,
    speakerId,
    scope,
    iat: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + PRESENTER_TOKEN_TTL_SECONDS,
  });
}

export function verifyPresenterToken(presenterToken, options = {}) {
  return parseSignedToken(presenterToken, "presenter", options);
}

export function createPairToken({ sessionId, speakerId, pin, scope, now = Date.now() }) {
  const exp = Math.floor(now / 1000) + PAIR_TOKEN_TTL_SECONDS;
  const exp36 = exp.toString(36).toUpperCase().padStart(6, "0");
  const checksum = shortSignature("pair-check", [sessionId, speakerId, scope, exp36], 6);
  const auth = shortSignature("pair-auth", [sessionId, speakerId, pin, scope, exp36], 10);
  return {
    pairToken: formatPairToken(`${exp36}${checksum}${auth}`),
    expiresAt: new Date(exp * 1000).toISOString(),
  };
}

export function verifyPairToken({
  sessionId,
  speakerId,
  pairToken,
  pin,
  scope,
  now = Date.now(),
}) {
  const clean = sanitizePairToken(pairToken);
  if (clean.length !== PAIR_TOKEN_RAW_LENGTH) {
    return { ok: false, error: "pair-token-invalid" };
  }
  const exp36 = clean.slice(0, 6);
  const checksum = clean.slice(6, 12);
  const auth = clean.slice(12);
  const exp = Number.parseInt(exp36, 36);
  if (!Number.isFinite(exp)) {
    return { ok: false, error: "pair-token-invalid" };
  }
  if (exp * 1000 <= now) {
    return { ok: false, error: "pair-token-expired" };
  }
  const expectedChecksum = shortSignature("pair-check", [sessionId, speakerId, scope, exp36], 6);
  if (!safeEqual(checksum, expectedChecksum)) {
    return { ok: false, error: "pair-token-invalid" };
  }
  const expectedAuth = shortSignature("pair-auth", [sessionId, speakerId, pin, scope, exp36], 10);
  if (!safeEqual(auth, expectedAuth)) {
    return { ok: false, error: "bad-pin" };
  }
  return { ok: true, exp };
}

export function isPresentationAuthError(error, code) {
  return error instanceof PresentationAuthError && (!code || error.code === code);
}
