import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatPairToken,
  generateSessionId,
  generatePin,
  getRemoteStorageKey,
  isValidPin,
  PAIR_TOKEN_RAW_LENGTH,
  parseSessionParams,
  PHASE_LIVE,
  PHASE_SETUP,
  PRESENTATION_STORAGE_KEY,
  sanitizePairToken,
} from "../lib/session.js";

test("generateSessionId yields a url-safe 8-char string", () => {
  const id = generateSessionId();
  assert.match(id, /^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789]{8}$/);
});

test("generatePin yields a 4-digit numeric string", () => {
  for (let i = 0; i < 50; i++) {
    const pin = generatePin();
    assert.match(pin, /^\d{4}$/);
  }
});

test("parseSessionParams extracts s / as / pt from URLSearchParams", () => {
  const params = new URLSearchParams("s=abc123&as=brandon&pt=ABCDEF-123456-ABCDEFGHJK");
  assert.deepEqual(parseSessionParams(params), {
    s: "abc123",
    as: "brandon",
    pt: "ABCDEF-123456-ABCDEFGHJK",
  });
});

test("parseSessionParams rejects bogus 'as'", () => {
  const params = new URLSearchParams("s=abc&as=eve");
  assert.deepEqual(parseSessionParams(params, ["brandon", "tre"]), {
    s: "abc",
    as: null,
    pt: null,
  });
});

test("isValidPin only accepts four digits", () => {
  assert.equal(isValidPin("4217"), true);
  assert.equal(isValidPin("999"), false);
  assert.equal(isValidPin("abcd"), false);
});

test("phase constants are exported", () => {
  assert.equal(PHASE_SETUP, "setup");
  assert.equal(PHASE_LIVE, "live");
});

test("pair token helpers sanitize and format input", () => {
  const raw = "abc123def456ghi789jk10";
  assert.equal(sanitizePairToken(raw), raw.toUpperCase());
  assert.equal(formatPairToken(raw), "ABC123-DEF456-GHI789JK10");
  assert.equal(sanitizePairToken("abc-123 def"), "ABC123DEF");
  assert.equal(sanitizePairToken(null), "");
  assert.equal(PAIR_TOKEN_RAW_LENGTH, 22);
});

test("remote storage key is namespaced", () => {
  assert.equal(
    getRemoteStorageKey("sess1234", "brandon"),
    `${PRESENTATION_STORAGE_KEY}:remote:sess1234:brandon`
  );
});
