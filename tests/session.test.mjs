import { test } from "node:test";
import assert from "node:assert/strict";
import {
  generateSessionId, generatePin, parseSessionParams, isAuthorizedControl,
  PHASE_SETUP, PHASE_LIVE,
} from "../lib/session.js";

test("generateSessionId yields a url-safe 8-char string", () => {
  const id = generateSessionId();
  assert.match(id, /^[A-Za-z0-9_-]{8}$/);
});

test("generatePin yields a 4-digit numeric string", () => {
  for (let i = 0; i < 50; i++) {
    const pin = generatePin();
    assert.match(pin, /^\d{4}$/);
  }
});

test("parseSessionParams extracts s / p / as from URLSearchParams", () => {
  const params = new URLSearchParams("s=abc123&p=4217&as=brandon");
  assert.deepEqual(parseSessionParams(params), { s: "abc123", p: "4217", as: "brandon" });
});

test("parseSessionParams rejects bogus 'as'", () => {
  const params = new URLSearchParams("s=abc&p=1111&as=eve");
  assert.equal(parseSessionParams(params, ["brandon", "tre"]).as, null);
});

test("isAuthorizedControl requires matching pin", () => {
  assert.equal(isAuthorizedControl({ pin: "4217" }, { expected: "4217" }), true);
  assert.equal(isAuthorizedControl({ pin: "1234" }, { expected: "4217" }), false);
  assert.equal(isAuthorizedControl({}, { expected: "4217" }), false);
});

test("phase constants are exported", () => {
  assert.equal(PHASE_SETUP, "setup");
  assert.equal(PHASE_LIVE, "live");
});
