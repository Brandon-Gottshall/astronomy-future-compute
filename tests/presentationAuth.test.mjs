import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createPairToken,
  createPresenterToken,
  createStageToken,
  verifyPairToken,
  verifyPresenterToken,
  verifyStageToken,
} from "../lib/presentationAuth.js";

process.env.PRESENTATION_TOKEN_SECRET = "test-presentation-secret";

test("stage token signs and verifies for the same scope", () => {
  const token = createStageToken({
    sessionId: "F8ARdX5m",
    pin: "4217",
    scope: "localhost-3100",
    now: 1_700_000_000_000,
  });
  const payload = verifyStageToken(token, {
    scope: "localhost-3100",
    now: 1_700_000_100_000,
  });
  assert.equal(payload.sessionId, "F8ARdX5m");
  assert.equal(payload.pin, "4217");
});

test("presenter token expires and rejects the wrong scope", () => {
  const token = createPresenterToken({
    sessionId: "F8ARdX5m",
    speakerId: "brandon",
    scope: "preview-example",
    now: 1_700_000_000_000,
  });
  assert.throws(
    () =>
      verifyPresenterToken(token, {
        scope: "preview-other",
        now: 1_700_000_001_000,
      }),
    /scope-mismatch/
  );
  assert.throws(
    () =>
      verifyPresenterToken(token, {
        scope: "preview-example",
        now: 1_700_050_000_000,
      }),
    /expired-token/
  );
});

test("pair token verifies when session, scope, token, and pin all match", () => {
  const pair = createPairToken({
    sessionId: "F8ARdX5m",
    speakerId: "brandon",
    pin: "4217",
    scope: "localhost-3100",
    now: 1_700_000_000_000,
  });
  assert.deepEqual(
    verifyPairToken({
      sessionId: "F8ARdX5m",
      speakerId: "brandon",
      pairToken: pair.pairToken,
      pin: "4217",
      scope: "localhost-3100",
      now: 1_700_000_060_000,
    }),
    { ok: true, exp: Number.parseInt(pair.pairToken.slice(0, 6), 36) }
  );
});

test("pair token distinguishes invalid token, bad pin, and expiry", () => {
  const pair = createPairToken({
    sessionId: "F8ARdX5m",
    speakerId: "tre",
    pin: "6318",
    scope: "localhost-3100",
    now: 1_700_000_000_000,
  });
  assert.deepEqual(
    verifyPairToken({
      sessionId: "F8ARdX5m",
      speakerId: "tre",
      pairToken: `${pair.pairToken.slice(0, 7)}AAAAAA${pair.pairToken.slice(13)}`,
      pin: "6318",
      scope: "localhost-3100",
      now: 1_700_000_010_000,
    }),
    { ok: false, error: "pair-token-invalid" }
  );
  assert.deepEqual(
    verifyPairToken({
      sessionId: "F8ARdX5m",
      speakerId: "tre",
      pairToken: pair.pairToken,
      pin: "1111",
      scope: "localhost-3100",
      now: 1_700_000_010_000,
    }),
    { ok: false, error: "bad-pin" }
  );
  assert.deepEqual(
    verifyPairToken({
      sessionId: "F8ARdX5m",
      speakerId: "tre",
      pairToken: pair.pairToken,
      pin: "6318",
      scope: "localhost-3100",
      now: 1_700_000_180_000,
    }),
    { ok: false, error: "pair-token-expired" }
  );
});
