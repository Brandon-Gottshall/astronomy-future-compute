import { test } from "node:test";
import assert from "node:assert/strict";
import { slideReducer, INITIAL_STATE } from "../lib/slides.js";

test("INITIAL_STATE starts in setup phase at index 0", () => {
  assert.equal(INITIAL_STATE.phase, "setup");
  assert.equal(INITIAL_STATE.index, 0);
  assert.equal(INITIAL_STATE.browsing, false);
});

test("beginPresentation flips to live at index 0", () => {
  const s = { ...INITIAL_STATE, total: 5 };
  const r = slideReducer(s, { type: "beginPresentation" });
  assert.equal(r.phase, "live");
  assert.equal(r.index, 0);
});

test("next advances within bounds when live", () => {
  const s = { total: 5, index: 2, phase: "live", browsing: false };
  assert.equal(slideReducer(s, { type: "next" }).index, 3);
});

test("next is a no-op during setup", () => {
  const s = { total: 5, index: 0, phase: "setup", browsing: false };
  const r = slideReducer(s, { type: "next" });
  assert.equal(r.index, 0);
  assert.equal(r.phase, "setup");
});

test("next clamps at last slide", () => {
  const s = { total: 5, index: 4, phase: "live", browsing: false };
  assert.equal(slideReducer(s, { type: "next" }).index, 4);
});

test("prev clamps at first", () => {
  const s = { total: 5, index: 0, phase: "live", browsing: false };
  assert.equal(slideReducer(s, { type: "prev" }).index, 0);
});

test("jumpTo clamps to [0, total-1]", () => {
  const s = { total: 5, index: 0, phase: "live", browsing: false };
  assert.equal(slideReducer(s, { type: "jump", to: 99 }).index, 4);
  assert.equal(slideReducer(s, { type: "jump", to: -1 }).index, 0);
});

test("syncFromStage sets phase + index and exits browsing", () => {
  const s = { total: 5, index: 0, phase: "setup", browsing: true };
  const r = slideReducer(s, { type: "syncFromStage", phase: "live", index: 3 });
  assert.equal(r.phase, "live");
  assert.equal(r.index, 3);
  assert.equal(r.browsing, false);
});

test("detachForBrowse sets browsing=true without moving index", () => {
  const s = { total: 5, index: 2, phase: "live", browsing: false };
  const r = slideReducer(s, { type: "detachForBrowse" });
  assert.equal(r.index, 2);
  assert.equal(r.browsing, true);
});

test("setTotal updates total", () => {
  const s = { ...INITIAL_STATE };
  const r = slideReducer(s, { type: "setTotal", total: 10 });
  assert.equal(r.total, 10);
});
