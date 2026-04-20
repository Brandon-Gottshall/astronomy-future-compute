# Presentation Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn the current scrolling live site into a driveable slide presentation with a phone remote (two speakers, their own note tracks) and a QR-discovered audience follow-along that stays in sync until the audience chooses to browse.

**Architecture:**
- Three browser contexts share one session over Pusher Channels: **Stage** (`/present` on the laptop), **Remote** (`/remote?s=…&p=…&as=<speaker>` on a presenter phone), **Follow** (`/follow?s=…` on an audience phone). Stage generates a random session id + 4-digit PIN; control events are PIN-gated at the stage (no Pusher-side auth endpoint needed). Slides are a flat ordered list in `content/copy.yaml` (`slides:`), each with a `notes:` map keyed by speaker id.
- **Session state is `{ phase, index }`** where `phase ∈ {'setup','live'}`. Stage opens in `setup` — its default screen is a full-viewport pair view showing both speaker QRs and the session PIN. The presentation actually *starts* when either remote taps a big "Begin" button, which flips `phase` to `live` at `index: 0`. Remote, once paired, sees the Begin button in setup phase and normal prev/next controls in live phase. Follow shows a "waiting" screen in setup phase and the synced slide in live phase.
- Slide rendering is a single shared component used by Stage + Follow (different chrome). The Remote renders its own mobile-first UI. Visuals (charts, counters, comparison matrix) are reused from existing `components/SiteApp.jsx` via a named lookup table — no duplicated rendering code.
- Follow defaults to live-sync with stage once the presentation begins; any prev/next interaction detaches local index from stage state and pins a "tap to resume sync" CTA at the bottom.

**Tech Stack:** Next.js 14 (App Router, client components), Pusher Channels (free tier), `pusher-js` browser client, `qrcode` (already a dep) for pair/follow QRs, `node:assert` for pure-logic tests (no new test runner), Tailwind for layout (already wired in).

---

## Ground rules for the executor

- **Use Edit over Write** on existing files; only Write new files.
- After any copy.yaml change, run `npm run generate-copy` (or trust predev/prebuild to do it).
- **Don't commit `.env.local`**; it is in `.gitignore` via `.env*`.
- **Commit after every task.** Messages mirror the repo's present-imperative verb-phrase style (e.g. "Add slide schema to copy.yaml", "Wire stage keyboard shortcuts").
- When verifying a client component renders something, grep `lib/copy.js` or the compiled chunk at `http://localhost:3000/_next/static/chunks/app/<route>/page.js` after the dev server compiles that route — raw `curl /` won't show client-rendered strings. Example that worked in the previous pass:
  ```bash
  curl -s "http://localhost:3000/_next/static/chunks/app/present/page.js" | grep -E -o "Slide \\d+/\\d+" | head
  ```
- **Co-author trailer** on every commit:
  ```
  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```
- **Don't introduce a new test framework.** Use `node --test` with `node:assert` for pure-logic unit tests; UI is smoke-tested via dev server.
- **Don't touch `lib/copy.js` directly** — it's generated from `content/copy.yaml`.

---

## Phase A — Slide schema + authored draft

### Task A1: Add `speakers:` block + empty `slides:` block to copy.yaml

**Files:**
- Modify: `content/copy.yaml` (append after the existing top-level blocks; before or after `rubric:` — put near the top, after `meta:`)

**Step 1: Add the speakers block**

Insert after `meta:` (line ~1–15 of copy.yaml):

```yaml
speakers:
  - id: brandon
    name: "Brandon Gottshall"
    role: lead   # lead sees both note tracks primary; co sees own primary
  - id: tre
    name: "Tre Madison"
    role: co
```

**Step 2: Add an empty slides block at the bottom of copy.yaml**

```yaml
slides: []  # populated in Task A2
```

**Step 3: Regenerate copy.js and verify**

Run:
```bash
cd ~/Development/astronomy-future-compute && npm run generate-copy
grep -n '"speakers"\|"slides"' lib/copy.js | head
```

Expected: two grep hits showing the keys serialized.

**Step 4: Commit**

```bash
git add content/copy.yaml lib/copy.js
git commit -m "$(cat <<'EOF'
Add speakers + empty slides schema to copy.yaml

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Note: `lib/copy.js` is gitignored. The `git add lib/copy.js` call will be a no-op. Only `content/copy.yaml` lands in the commit.

---

### Task A2: Author the ~22-slide draft

**Files:**
- Modify: `content/copy.yaml` (replace `slides: []` with the populated list)

**Step 1: Replace the empty `slides: []` with this authored draft.** Every slide has `id`, `section`, `title`, `body`, optional `visual`, `speaker`, and a `notes:` map with both `brandon` and `tre` keys (either may be empty string for slides where that speaker is silent).

Breakdown target (the executor should write all entries; representative examples below, pattern-match the rest from `content/copy.yaml` live-mode prose):

- hero → 1 slide
- need → 3 slides
- context → 2 slides
- bridge → 3 slides
- responses → 3 slides
- underwater → 2 slides
- orbital → 3 slides
- conclusion → 2 slides
- references → 1 slide

Total: 20. Adjust ±2 if prose resists a clean split.

**Speaker assignment pattern** (Brandon drives structural slides, Tre takes underwater + orbital detail slides, both share conclusions). Concretely:

- hero, need, context, bridge → `speaker: brandon`
- responses → `speaker: brandon` (hand-off on last slide)
- underwater → `speaker: tre`
- orbital → `speaker: tre`
- conclusion → alternating: first slide `brandon`, second `tre`
- references → `speaker: brandon`

**Example slide to copy the shape from**:

```yaml
slides:
  - id: hero
    section: hero
    title: "Astronomy's Future Compute"
    body: |
      Comparing land-based, underwater, and orbital data-center paths for modern astronomy.
      ASTR 1020K · Brandon Gottshall & Tre Madison · Spring 2026
    visual: null
    speaker: brandon
    notes:
      brandon: |
        Open: "Astronomy is one of the most compute-dependent sciences now, and the question
        of where that compute physically lives is becoming a real scientific infrastructure
        question." 20 seconds. Hand to the deck with the arrow.
      tre: ""

  - id: need-1
    section: need
    title: "Why astronomy needs compute at all"
    body: |
      Wide-field surveys generate terabytes per night. Time-domain alerting needs
      real-time difference imaging. Archival search re-interrogates decades of
      observations. The observation isn't done until the compute has run.
    visual: null
    speaker: brandon
    notes:
      brandon: |
        Don't list all four pipelines — pick two (surveys + alerting) and name them.
        Land the line: "observation is incomplete until the compute has run."
      tre: |
        If anyone asks about specific survey volumes, SDSS is >650 TB cumulative,
        DES is ~2.5 TB/night. Only drop those if asked.

  # … the executor authors the remaining slides in this shape …
```

**Source material** for splitting: `content/copy.yaml` already contains the long-form prose under `live.need.*`, `live.context.*`, `live.bridge.*`, `live.responses.*`, `live.underwater.*`, `live.orbital.*`, `live.conclusion.*`, plus `rubric.topicSummary.body`, `rubric.astronomyRelevance.body`, `rubric.futureImpact.body`, `rubric.recommendation.body`. Use those as the raw material — don't invent new claims, don't rephrase the precision-pass wording. Every `body:` should be ≤ 60 words to keep the stage readable.

**Step 2: Regenerate and verify**

```bash
npm run generate-copy
node -e 'const c=require("./lib/copy.js"); console.log("slides:",c.COPY.slides.length, "speakers:", c.COPY.speakers.length)'
```

Expected: `slides: 20` (±2), `speakers: 2`.

**Step 3: Spot-check notes coverage**

```bash
node -e 'const c=require("./lib/copy.js");c.COPY.slides.forEach((s,i)=>{if(!s.notes||!("brandon" in s.notes)||!("tre" in s.notes))console.log("missing notes keys on slide",i,s.id)})'
```

Expected: no output.

**Step 4: Commit**

```bash
git add content/copy.yaml
git commit -m "$(cat <<'EOF'
Author draft slides + per-speaker presenter notes

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task A3: Extend `scripts/build-editor-copy.rb` to emit slides

So the copy-editor Markdown stays a faithful projection after we add slides.

**Files:**
- Modify: `scripts/build-editor-copy.rb` (append a new section after the `rubric.*` block at line ~382)

**Step 1: Append speaker + slide emission**

At the bottom of the file (before `File.write(TARGET, out.join("\n"))`), add:

```ruby
emit_heading(out, 2, "Speakers")
emit_bundle(out, "speakers") do |lines|
  dig!(data, "speakers").each_with_index do |speaker, index|
    emit(lines, "Speaker #{index + 1} Id: #{speaker['id']}")
    emit(lines, "Speaker #{index + 1} Name: #{speaker['name']}")
    emit(lines, "Speaker #{index + 1} Role: #{speaker['role']}")
  end
end

emit_heading(out, 2, "Slides")
dig!(data, "slides").each_with_index do |slide, index|
  emit_bundle(out, "slides.#{index}") do |lines|
    emit_label(lines, "Id", slide["id"])
    emit_label(lines, "Section", slide["section"])
    emit_label(lines, "Speaker", slide["speaker"])
    emit_label(lines, "Visual", slide["visual"] || "none")
    emit_label(lines, "Title", slide["title"])
    emit_paragraph(lines, "Body", slide["body"])
    (slide["notes"] || {}).each do |speaker_id, text|
      emit_paragraph(lines, "Notes (#{speaker_id})", text.to_s)
    end
  end
end
```

**Step 2: Run and spot-check**

```bash
ruby scripts/build-editor-copy.rb
grep -c '^\[\[slides\.' content/copy.editor.md
```

Expected: matches the number of slides (20 ±2).

**Step 3: Commit**

```bash
git add scripts/build-editor-copy.rb
git commit -m "$(cat <<'EOF'
Emit speakers + slides into copy.editor.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase B — Pusher plumbing + pure-logic helpers

### Task B1: Install Pusher SDKs

**Step 1: Add the client**

```bash
cd ~/Development/astronomy-future-compute && npm install pusher-js@8.4
```

Server SDK is not needed — we skip Pusher's `/api/auth` flow entirely because we use public channels + PIN-in-message validation.

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "$(cat <<'EOF'
Add pusher-js client for presentation realtime

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task B2: Add env-var scaffolding

**Files:**
- Create: `.env.example`
- Modify: `README.md` (append a "Presentation mode env vars" section)

**Step 1: Create `.env.example`**

```
# Pusher Channels — free tier is fine for a classroom presentation.
# Sign up at https://pusher.com/channels, create a "Channels" app,
# then paste the four values below.
NEXT_PUBLIC_PUSHER_KEY=your_app_key_here
NEXT_PUBLIC_PUSHER_CLUSTER=us2
```

**Step 2: Append to `README.md`**

```markdown
## Presentation mode

Copy `.env.example` to `.env.local` and fill in your Pusher app key +
cluster. Then:

1. Open `/present` on your laptop — it opens on the pair screen with
   both speaker QRs visible and the session PIN displayed.
2. Each speaker scans their own QR → lands on `/remote?…` paired.
3. Tap "Begin presentation" on either remote when ready. The stage
   flips to slide 1 and audience follow-along goes live.
4. Corner QR on the stage is the audience follow-along — scan to
   follow along on their own phone.
```

**Step 3: Commit**

```bash
git add .env.example README.md
git commit -m "$(cat <<'EOF'
Document Pusher env vars for presentation mode

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task B3: Write `lib/session.js` + tests (TDD)

**Files:**
- Create: `lib/session.js`
- Create: `tests/session.test.mjs`

**Step 1: Write the failing tests first**

```js
// tests/session.test.mjs
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
```

**Step 2: Run — expect FAIL**

```bash
node --test tests/session.test.mjs
```

Expected: FAIL (module not found).

**Step 3: Implement**

```js
// lib/session.js
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export function generateSessionId() {
  const bytes = new Uint8Array(8);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    const { webcrypto } = require("node:crypto");
    webcrypto.getRandomValues(bytes);
  }
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export function generatePin() {
  const bytes = new Uint8Array(4);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    const { webcrypto } = require("node:crypto");
    webcrypto.getRandomValues(bytes);
  }
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
export const EVENT_STATE_CHANGED = "state:changed";   // full { phase, index }
export const EVENT_REMOTE_HEARTBEAT = "remote:heartbeat";

export const PHASE_SETUP = "setup";
export const PHASE_LIVE = "live";
```

**Step 4: Re-run tests**

```bash
node --test tests/session.test.mjs
```

Expected: PASS (5/5).

**Step 5: Add npm script**

Modify `package.json` — add under `"scripts"`:
```json
"test": "node --test tests"
```

**Step 6: Commit**

```bash
git add lib/session.js tests/session.test.mjs package.json
git commit -m "$(cat <<'EOF'
Add session id, PIN, and PIN-validation helpers

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task B4: Slide-index reducer + tests (TDD)

Isolate index math (prev/next/jump/wrap-guards) from React so it's testable.

**Files:**
- Create: `lib/slides.js`
- Create: `tests/slides.test.mjs`

**Step 1: Tests**

```js
// tests/slides.test.mjs
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
```

**Step 2: Run — expect FAIL.**

```bash
node --test tests/slides.test.mjs
```

**Step 3: Implement**

```js
// lib/slides.js
import { PHASE_SETUP, PHASE_LIVE } from "./session.js";

export const INITIAL_STATE = { total: 0, index: 0, phase: PHASE_SETUP, browsing: false };

function clampIndex(total, value) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(value, total - 1));
}

export function slideReducer(state, action) {
  switch (action.type) {
    case "beginPresentation":
      return { ...state, phase: PHASE_LIVE, index: 0, browsing: false };
    case "next":
      if (state.phase !== PHASE_LIVE) return state;
      return { ...state, index: clampIndex(state.total, state.index + 1) };
    case "prev":
      if (state.phase !== PHASE_LIVE) return state;
      return { ...state, index: clampIndex(state.total, state.index - 1) };
    case "jump":
      if (state.phase !== PHASE_LIVE) return state;
      return { ...state, index: clampIndex(state.total, action.to) };
    case "detachForBrowse":
      return { ...state, browsing: true };
    case "syncFromStage":
      return {
        ...state,
        phase: action.phase ?? state.phase,
        index: clampIndex(state.total, action.index ?? state.index),
        browsing: false,
      };
    case "setTotal":
      return { ...state, total: action.total };
    default:
      return state;
  }
}
```

**Step 4: Re-run → PASS.**

**Step 5: Commit**

```bash
git add lib/slides.js tests/slides.test.mjs
git commit -m "$(cat <<'EOF'
Add slide-index reducer with prev/next/jump/detach semantics

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task B5: `useSession` hook

**Files:**
- Create: `lib/useSession.js`

**Step 1: Implement** (final REST-relay form — Task B6 builds the `/api/broadcast` endpoint it talks to)

Pure-client hook. No test — integration is smoke-tested in Phases C–E.

The hook speaks a single event vocabulary over the Pusher channel:
- `state:changed` — stage broadcasts `{ phase, index }` whenever its local state mutates; remote + follow `syncFromStage` on receive.
- `control` — remote sends `{ action, pin, as }` where `action ∈ {'next','prev','jump','begin'}`; stage validates PIN and applies via reducer (which then triggers the `state:changed` rebroadcast).
- `heartbeat` — remote sends `{ as, t }` periodically; stage tracks paired remotes.

Everyone POSTs to `/api/broadcast`; no one calls `channel.trigger` directly (public channel, no client-events enabled).

```js
// lib/useSession.js
"use client";
import { useEffect, useReducer, useRef, useCallback } from "react";
import Pusher from "pusher-js";
import {
  CHANNEL_PREFIX,
  EVENT_STATE_CHANGED,
  EVENT_REMOTE_HEARTBEAT,
  isAuthorizedControl,
} from "./session.js";
import { slideReducer, INITIAL_STATE } from "./slides.js";

async function post(sessionId, event, payload) {
  try {
    await fetch("/api/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session: sessionId, event, payload }),
    });
  } catch (e) { /* best-effort */ }
}

// role: "stage" | "remote" | "follow"
export function useSession({ sessionId, role, pin, as, total }) {
  const [state, dispatch] = useReducer(slideReducer, { ...INITIAL_STATE, total });
  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  const expectedPinRef = useRef(pin);
  const pairedRemotesRef = useRef(new Map()); // as -> lastHeartbeatTs (stage only)

  useEffect(() => { expectedPinRef.current = pin; }, [pin]);
  useEffect(() => { dispatch({ type: "setTotal", total }); }, [total]);

  useEffect(() => {
    if (!sessionId) return undefined;
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key) { console.warn("NEXT_PUBLIC_PUSHER_KEY missing; remote/follow will be offline"); return undefined; }
    const pusher = new Pusher(key, { cluster });
    const channel = pusher.subscribe(`${CHANNEL_PREFIX}${sessionId}`);
    pusherRef.current = pusher;
    channelRef.current = channel;

    channel.bind(EVENT_STATE_CHANGED, (msg) => {
      if (role === "stage") return; // stage is the authority; ignore its own echoes
      if (msg && typeof msg.index === "number" && typeof msg.phase === "string") {
        dispatch({ type: "syncFromStage", phase: msg.phase, index: msg.index });
      }
    });

    channel.bind(EVENT_REMOTE_HEARTBEAT, (msg) => {
      if (role !== "stage" || !msg?.as) return;
      pairedRemotesRef.current.set(msg.as, msg.t || Date.now());
    });

    if (role === "stage") {
      channel.bind("control", (msg) => {
        if (!isAuthorizedControl(msg, { expected: expectedPinRef.current })) return;
        if (msg.action === "begin") dispatch({ type: "beginPresentation" });
        else if (msg.action === "next") dispatch({ type: "next" });
        else if (msg.action === "prev") dispatch({ type: "prev" });
        else if (msg.action === "jump" && typeof msg.to === "number") dispatch({ type: "jump", to: msg.to });
      });
    }

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channel.name);
      pusher.disconnect();
    };
  }, [sessionId, role]);

  // Stage rebroadcasts state on every local change
  useEffect(() => {
    if (role !== "stage" || !sessionId) return;
    post(sessionId, EVENT_STATE_CHANGED, { phase: state.phase, index: state.index });
  }, [state.phase, state.index, role, sessionId]);

  const sendControl = useCallback((action, extra = {}) => {
    if (role !== "remote" || !sessionId) return;
    post(sessionId, "control", { action, pin: expectedPinRef.current, as, ...extra });
  }, [role, as, sessionId]);

  const beginPresentation = useCallback(() => sendControl("begin"), [sendControl]);

  const sendHeartbeat = useCallback(() => {
    if (role !== "remote" || !sessionId) return;
    post(sessionId, EVENT_REMOTE_HEARTBEAT, { as, t: Date.now() });
  }, [role, as, sessionId]);

  return {
    state,
    dispatch,
    sendControl,
    beginPresentation,
    sendHeartbeat,
    pairedRemotes: pairedRemotesRef.current, // stage reads live; other roles ignore
  };
}
```

**Step 2: Commit**

```bash
git add lib/useSession.js
git commit -m "$(cat <<'EOF'
Add useSession hook backed by REST relay

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

---

### Task B6: `/api/broadcast` route (server side of the relay)

**Files:**
- Create: `app/api/broadcast/route.js`
- Modify: `package.json` (add `pusher` server SDK dep)
- Modify: `.env.example` to add the server-side keys

**Step 1: Install server SDK**

```bash
npm install pusher@5.2
```

**Step 2: Append to `.env.example`**

```
# Server-side (never exposed to the client)
PUSHER_APP_ID=your_app_id
PUSHER_KEY=same_as_NEXT_PUBLIC_PUSHER_KEY
PUSHER_SECRET=your_app_secret
```

**Step 3: Create `app/api/broadcast/route.js`**

```js
import Pusher from "pusher";
import { CHANNEL_PREFIX } from "../../../lib/session.js";

export const runtime = "nodejs"; // Pusher server SDK needs Node

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.session !== "string" || typeof body.event !== "string") {
    return Response.json({ ok: false, error: "bad-request" }, { status: 400 });
  }
  await pusher.trigger(`${CHANNEL_PREFIX}${body.session}`, body.event, body.payload ?? {});
  return Response.json({ ok: true });
}
```

B5 already posts to `/api/broadcast`; no rewire needed.

**Step 4: Smoke test**

```bash
npm run dev &
# Wait for "Ready in"
curl -s -XPOST http://localhost:3000/api/broadcast \
  -H 'Content-Type: application/json' \
  -d '{"session":"test","event":"state:changed","payload":{"phase":"live","index":3}}'
# Expect: {"ok":true}  (with valid Pusher creds; {"ok":false} or 500 if creds missing)
```

Kill the dev server when done.

**Step 5: Commit**

```bash
git add app/api/broadcast/route.js .env.example package.json package-lock.json
git commit -m "$(cat <<'EOF'
Relay presentation events through /api/broadcast

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase C — Stage route (`/present`)

### Task C1: Shared `SlideRenderer` component

**Files:**
- Create: `components/SlideRenderer.jsx`

Used by both Stage and Follow. Looks up `visual` by name from a static registry of components already exported from `components/SiteApp.jsx`.

**Step 1: Export reusable visuals from SiteApp.jsx**

Find the existing chart/counter components in `components/SiteApp.jsx` and add them to a named export near the top/bottom:

```js
// near bottom of components/SiteApp.jsx
export const SLIDE_VISUALS = {
  energyGrowth: EnergyGrowthChart,           // replace with real names after grepping
  astronomyImpact: AstronomyImpactChart,
  comparisonMatrix: ComparisonMatrixBlock,   // already a function in the file
  // …add any others referenced in the slide YAML `visual:` field
};
```

Grep for component names first:
```bash
grep -nE "^function [A-Z]" components/SiteApp.jsx
```

**Step 2: Write `components/SlideRenderer.jsx`**

```jsx
"use client";
import { SLIDE_VISUALS } from "./SiteApp";

export default function SlideRenderer({ slide, variant = "stage" }) {
  if (!slide) return null;
  const Visual = slide.visual && SLIDE_VISUALS[slide.visual];
  const layout =
    variant === "stage"
      ? "grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 items-center"
      : "flex flex-col gap-6";
  return (
    <div className={`${layout} w-full`}>
      <div>
        <h2 className={variant === "stage" ? "text-5xl lg:text-6xl font-semibold mb-6" : "text-2xl font-semibold mb-3"}>
          {slide.title}
        </h2>
        <div className={variant === "stage" ? "text-2xl leading-relaxed text-slate-200" : "text-base leading-relaxed text-slate-200"}>
          {slide.body?.split("\n\n").map((p, i) => (<p key={i} className="mb-4">{p}</p>))}
        </div>
      </div>
      {Visual ? (
        <div className={variant === "stage" ? "" : "mt-4"}><Visual /></div>
      ) : null}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add components/SlideRenderer.jsx components/SiteApp.jsx
git commit -m "$(cat <<'EOF'
Extract SlideRenderer + visual registry shared by stage/follow

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task C2: `/present` route + StageView (setup + live phases)

**Files:**
- Create: `app/present/page.jsx`
- Create: `components/StageView.jsx`
- Create: `components/PairPanel.jsx`

**UX shape**:
- Stage opens with `phase === 'setup'`. The full-viewport content IS the pair view: both speaker QRs side-by-side, session PIN shown, paired-status badge on each QR that flips green when that speaker's remote has sent a recent heartbeat.
- When either remote taps "Begin presentation" (Task D1), that posts `control: "begin"`, stage's reducer flips to `phase === 'live'` at `index: 0`, and the view swaps to the slide.
- During live, pressing `R` opens the PairPanel as a dismissible dialog for re-pairing a dropped phone.
- Keyboard advance/prev only fires during live (the reducer enforces this too).

**Step 1: `app/present/page.jsx`**

```jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import StageView from "../../components/StageView";
import { COPY } from "../../lib/copy.js";
import { generateSessionId, generatePin } from "../../lib/session.js";

export default function PresentPage() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Persist the generated session+pin in sessionStorage so F5 keeps you paired.
    const saved = typeof window !== "undefined" ? sessionStorage.getItem("astro-present") : null;
    if (saved) {
      try { setSession(JSON.parse(saved)); return; } catch (e) {}
    }
    const fresh = { id: generateSessionId(), pin: generatePin() };
    sessionStorage.setItem("astro-present", JSON.stringify(fresh));
    setSession(fresh);
  }, []);

  const slides = useMemo(() => COPY.slides || [], []);
  const speakers = useMemo(() => COPY.speakers || [], []);

  if (!session) return null;
  return <StageView slides={slides} speakers={speakers} sessionId={session.id} pin={session.pin} />;
}
```

**Step 2: `components/StageView.jsx`**

```jsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "../lib/useSession.js";
import SlideRenderer from "./SlideRenderer";
import PairPanel from "./PairPanel";
import FloatingQR from "./FloatingQR"; // see Task F1
import { PHASE_LIVE, PHASE_SETUP } from "../lib/session.js";

export default function StageView({ slides, speakers, sessionId, pin }) {
  const { state, dispatch, pairedRemotes } = useSession({
    sessionId, role: "stage", pin, total: slides.length,
  });
  const [chromeVisible, setChromeVisible] = useState(true);
  const [blanked, setBlanked] = useState(false);
  const [repairOpen, setRepairOpen] = useState(false);

  const keydown = useCallback((e) => {
    if (state.phase === PHASE_LIVE) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") { e.preventDefault(); dispatch({ type: "next" }); return; }
      if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); dispatch({ type: "prev" }); return; }
      if (e.key === "Home") { dispatch({ type: "jump", to: 0 }); return; }
      if (e.key === "End") { dispatch({ type: "jump", to: slides.length - 1 }); return; }
    }
    if (e.key === "r" || e.key === "R") setRepairOpen((v) => !v);
    else if (e.key === "b" || e.key === "B") setBlanked((v) => !v);
    else if (e.key === "Escape") setChromeVisible((v) => !v);
  }, [dispatch, slides.length, state.phase]);

  useEffect(() => {
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [keydown]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const followUrl = `${origin}/follow?s=${sessionId}`;

  if (blanked) return <main className="stage-root"><div className="w-screen h-screen bg-black" /></main>;

  if (state.phase === PHASE_SETUP) {
    return (
      <main className="stage-root">
        <PairPanel origin={origin} sessionId={sessionId} pin={pin} speakers={speakers} pairedRemotes={pairedRemotes} slideCount={slides.length} />
        <FloatingQR url={followUrl} label="Scan to follow along" />
      </main>
    );
  }

  const slide = slides[state.index];
  return (
    <main className="stage-root">
      <div className="stage-slide">
        <SlideRenderer slide={slide} variant="stage" />
      </div>
      <div className={`stage-chrome ${chromeVisible ? "visible" : "hidden"}`}>
        <span className="badge">{state.index + 1} / {slides.length}</span>
        <button onClick={() => setRepairOpen(true)}>Pair</button>
      </div>
      <FloatingQR url={followUrl} label="Scan to follow along" />
      {repairOpen ? (
        <div role="dialog" onClick={() => setRepairOpen(false)} className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-6">
          <div onClick={(e) => e.stopPropagation()} className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Re-pair a remote</h2>
              <button onClick={() => setRepairOpen(false)}>✕</button>
            </div>
            <PairPanel origin={origin} sessionId={sessionId} pin={pin} speakers={speakers} pairedRemotes={pairedRemotes} compact />
          </div>
        </div>
      ) : null}
    </main>
  );
}
```

Minimal styling in `app/globals.css` (append at the bottom):

```css
.stage-root{width:100vw;height:100vh;background:var(--bg-primary);color:var(--text-primary);display:flex;align-items:center;justify-content:center;overflow:hidden}
.stage-slide{max-width:92vw;max-height:92vh;padding:2rem}
.stage-chrome{position:fixed;top:1rem;left:1rem;display:flex;gap:0.75rem;align-items:center;transition:opacity 0.2s}
.stage-chrome.hidden{opacity:0;pointer-events:none}
.stage-chrome .badge{background:rgba(148,163,184,0.15);border:1px solid rgba(148,163,184,0.3);border-radius:999px;padding:0.25rem 0.75rem;font-size:0.875rem}
.stage-chrome button{background:rgba(59,130,246,0.2);border:1px solid rgba(59,130,246,0.5);border-radius:0.375rem;padding:0.25rem 0.75rem;color:var(--text-primary);cursor:pointer}
```

**Step 3: `components/PairPanel.jsx`** — the full pair screen (setup phase) AND the re-pair dialog body

```jsx
"use client";
import { useEffect, useState } from "react";

function Qr({ url, label, paired }) {
  const [dataUrl, setDataUrl] = useState(null);
  useEffect(() => {
    if (!url) return;
    (async () => {
      const QR = (await import("qrcode")).default;
      setDataUrl(await QR.toDataURL(url, { margin: 1, width: 320 }));
    })();
  }, [url]);
  return (
    <div className="text-center">
      <div className="mb-2 text-lg font-medium flex items-center justify-center gap-2">
        <span>{label}</span>
        {paired ? <span className="text-xs bg-emerald-500/20 text-emerald-300 rounded-full px-2 py-0.5">paired</span> : null}
      </div>
      {dataUrl
        ? <img alt={`Pair ${label}`} src={dataUrl} width="280" height="280" className="mx-auto rounded bg-white p-2" />
        : <div className="h-[280px] w-[280px] mx-auto bg-slate-800 rounded" />}
      <div className="mt-2 text-xs opacity-60 break-all max-w-[280px] mx-auto">{url}</div>
    </div>
  );
}

export default function PairPanel({ origin, sessionId, pin, speakers, pairedRemotes, compact = false, slideCount }) {
  const urlFor = (as) => `${origin}/remote?s=${sessionId}&p=${pin}&as=${as}`;
  // Tick every 2s so heartbeat-driven paired-badge state stays fresh.
  const [, force] = useState(0);
  useEffect(() => { const t = setInterval(() => force((v) => v + 1), 2000); return () => clearInterval(t); }, []);
  const isPaired = (as) => {
    const last = pairedRemotes?.get?.(as);
    return typeof last === "number" && Date.now() - last < 30_000;
  };
  return (
    <div className={compact ? "w-full" : "min-h-screen w-full flex flex-col items-center justify-center p-8"}>
      {!compact ? (
        <div className="text-center mb-8">
          <div className="text-sm uppercase tracking-wide opacity-60 mb-2">Pair to begin</div>
          <h1 className="text-3xl font-semibold mb-2">Scan your speaker's QR</h1>
          <p className="opacity-70">Either speaker can tap "Begin presentation" on their remote to start.</p>
        </div>
      ) : null}
      <div className={`grid ${speakers.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-10`}>
        {speakers.map((s) => (
          <Qr key={s.id} url={urlFor(s.id)} label={s.name} paired={isPaired(s.id)} />
        ))}
      </div>
      {!compact ? (
        <div className="mt-10 text-center text-sm opacity-60">
          Session PIN: <span className="font-mono">{pin}</span>
          {typeof slideCount === "number" ? <span className="ml-4">{slideCount} slides</span> : null}
        </div>
      ) : null}
    </div>
  );
}
```

**Step 4: Smoke test**

```bash
npm run dev
# Open http://localhost:3000/present
# - Stage opens on the full-viewport pair screen with both speaker QRs
# - Arrow keys do nothing while phase === setup
# - Opening /remote?…&as=brandon should cause Brandon's QR to show a green "paired" badge within ~10s
# - Tapping Begin on the remote flips stage to slide 1
# - Pressing R during live opens the re-pair dialog
```

**Step 5: Commit**

```bash
git add app/present components/StageView.jsx components/PairPanel.jsx app/globals.css
git commit -m "$(cat <<'EOF'
Build /present stage with setup screen and phase-gated keys

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase D — Remote route (`/remote`)

### Task D1: `/remote` route + RemoteView

**Files:**
- Create: `app/remote/page.jsx`
- Create: `components/RemoteView.jsx`

**Step 1: `app/remote/page.jsx`**

```jsx
"use client";
import { useEffect, useState } from "react";
import RemoteView from "../../components/RemoteView";
import { COPY } from "../../lib/copy.js";
import { parseSessionParams } from "../../lib/session.js";

const ALLOWED = ["brandon", "tre"];

export default function RemotePage() {
  const [params, setParams] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setParams(parseSessionParams(new URLSearchParams(window.location.search), ALLOWED));
  }, []);
  if (!params) return null;
  if (!params.s || !params.p || !params.as) {
    return <main className="p-8 text-center">Invalid remote link. Scan the QR on the stage.</main>;
  }
  const speaker = (COPY.speakers || []).find((s) => s.id === params.as);
  return <RemoteView slides={COPY.slides || []} speaker={speaker} speakers={COPY.speakers || []} sessionId={params.s} pin={params.p} />;
}
```

**Step 2: `components/RemoteView.jsx`**

```jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "../lib/useSession.js";
import { PHASE_SETUP } from "../lib/session.js";

export default function RemoteView({ slides, speaker, speakers, sessionId, pin }) {
  const { state, sendControl, beginPresentation, sendHeartbeat } = useSession({
    sessionId, role: "remote", pin, as: speaker?.id, total: slides.length,
  });
  const [otherExpanded, setOtherExpanded] = useState(speaker?.role === "lead");

  // wake lock — keeps the phone screen on
  useEffect(() => {
    let lock = null;
    (async () => { try { lock = await navigator.wakeLock?.request("screen"); } catch (e) {} })();
    return () => { try { lock?.release(); } catch (e) {} };
  }, []);

  // heartbeat every 10s so the stage can show which speakers are paired
  useEffect(() => {
    const h = setInterval(sendHeartbeat, 10_000);
    sendHeartbeat();
    return () => clearInterval(h);
  }, [sendHeartbeat]);

  // --- Setup phase: Begin button ---
  if (state.phase === PHASE_SETUP) {
    return (
      <main className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <header className="p-6 text-center">
          <div className="text-xs uppercase tracking-wide opacity-60 mb-1">Paired as</div>
          <div className="text-2xl font-semibold">{speaker?.name}</div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
          <div className="text-sm opacity-70">{slides.length} slides ready.</div>
          <div className="text-base opacity-80 max-w-sm">
            Tap when you and your co-presenter are ready. The stage and audience follow-along will go live at slide 1.
          </div>
          <button
            onClick={beginPresentation}
            className="mt-6 w-full max-w-sm py-6 rounded-xl bg-emerald-600 active:bg-emerald-500 text-xl font-semibold"
          >
            Begin presentation
          </button>
          <div className="text-xs opacity-50 mt-6">
            If something breaks, go back to the stage and press <kbd className="px-1 border border-slate-600 rounded">R</kbd> to re-pair.
          </div>
        </div>
      </main>
    );
  }

  // --- Live phase: controls + notes ---
  const slide = slides[state.index];
  const next = slides[state.index + 1];
  const otherSpeaker = useMemo(() => speakers.find((s) => s.id !== speaker?.id), [speakers, speaker]);
  const myNote = slide?.notes?.[speaker?.id] || "";
  const otherNote = otherSpeaker ? (slide?.notes?.[otherSpeaker.id] || "") : "";
  const currentSlideSpeaker = speakers.find((s) => s.id === slide?.speaker);

  return (
    <main className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide opacity-60">Slide {state.index + 1} / {slides.length}</div>
          <div className="text-sm font-medium">{slide?.title}</div>
        </div>
        {currentSlideSpeaker ? (
          <span className={`text-xs px-2 py-1 rounded-full ${currentSlideSpeaker.id === speaker?.id ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-700/40 text-slate-300"}`}>
            {currentSlideSpeaker.name} speaking
          </span>
        ) : null}
      </header>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <section>
          <div className="text-xs uppercase tracking-wide opacity-60 mb-1">Your notes</div>
          <div className="text-lg leading-relaxed whitespace-pre-wrap">{myNote || <span className="opacity-40">(nothing for this slide)</span>}</div>
        </section>

        {otherSpeaker ? (
          <section>
            <button
              onClick={() => setOtherExpanded((v) => !v)}
              className="w-full flex items-center justify-between text-xs uppercase tracking-wide opacity-60 py-2"
            >
              <span>{otherSpeaker.name}'s notes</span>
              <span>{otherExpanded ? "▾" : "▸"}</span>
            </button>
            {otherExpanded ? (
              <div className="text-sm leading-relaxed whitespace-pre-wrap opacity-80">{otherNote || <span className="opacity-40">(empty)</span>}</div>
            ) : null}
          </section>
        ) : null}

        {next ? (
          <section className="pt-4 border-t border-slate-800 text-xs opacity-60">
            Up next: {next.title}
          </section>
        ) : null}
      </div>

      <footer className="p-3 border-t border-slate-800 grid grid-cols-2 gap-3 bg-slate-900 sticky bottom-0">
        <button onClick={() => sendControl("prev")} className="py-5 rounded-lg bg-slate-800 active:bg-slate-700 text-lg">◀︎ Prev</button>
        <button onClick={() => sendControl("next")} className="py-5 rounded-lg bg-indigo-600 active:bg-indigo-500 text-lg">Next ▶︎</button>
      </footer>
    </main>
  );
}
```

**Step 3: Smoke test**

```bash
npm run dev
# In one tab: http://localhost:3000/present
# Click 'R' or press R → open overlay; copy the Brandon URL
# Paste in a second tab → should show remote with notes
# Tap Next/Prev → stage tab advances
```

**Step 4: Commit**

```bash
git add app/remote components/RemoteView.jsx
git commit -m "$(cat <<'EOF'
Build /remote controller with per-speaker notes + dual-track for lead

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase E — Follow route (`/follow`)

### Task E1: `/follow` route + FollowView with resumable sync

**Files:**
- Create: `app/follow/page.jsx`
- Create: `components/FollowView.jsx`

**Step 1: `app/follow/page.jsx`**

```jsx
"use client";
import { useEffect, useState } from "react";
import FollowView from "../../components/FollowView";
import { COPY } from "../../lib/copy.js";
import { parseSessionParams } from "../../lib/session.js";

export default function FollowPage() {
  const [params, setParams] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setParams(parseSessionParams(new URLSearchParams(window.location.search)));
  }, []);
  if (!params) return null;
  if (!params.s) return <main className="p-8 text-center">No session in URL.</main>;
  return <FollowView slides={COPY.slides || []} sessionId={params.s} />;
}
```

**Step 2: `components/FollowView.jsx`**

```jsx
"use client";
import { useEffect, useState } from "react";
import { useSession } from "../lib/useSession.js";
import SlideRenderer from "./SlideRenderer";
import { PHASE_SETUP } from "../lib/session.js";

export default function FollowView({ slides, sessionId }) {
  const { state, dispatch } = useSession({
    sessionId, role: "follow", total: slides.length,
  });
  // Track the stage's authoritative index separately so the resume CTA can show "N ahead".
  const [stageIndex, setStageIndex] = useState(0);
  useEffect(() => {
    if (!state.browsing) setStageIndex(state.index);
  }, [state.browsing, state.index]);

  // Waiting-room: stage is still on the pair screen.
  if (state.phase === PHASE_SETUP) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-sm uppercase tracking-wide opacity-60 mb-2">Follow along</div>
        <h1 className="text-2xl font-semibold mb-3">Presentation will begin shortly</h1>
        <p className="opacity-70 max-w-sm">Stay on this page. When the presenters tap begin, you'll start seeing the current slide here automatically.</p>
      </main>
    );
  }

  const slide = slides[state.index];
  const ahead = Math.max(0, stageIndex - state.index);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <div className="flex-1 p-4 overflow-auto">
        <SlideRenderer slide={slide} variant="follow" />
      </div>
      <div className="flex items-center justify-between gap-2 p-3 border-t border-slate-800 bg-slate-900">
        <button onClick={() => { dispatch({ type: "detachForBrowse" }); dispatch({ type: "prev" }); }}
                className="py-3 px-4 rounded-lg bg-slate-800 active:bg-slate-700">◀︎</button>
        <div className="text-xs opacity-60">Slide {state.index + 1} / {slides.length}</div>
        <button onClick={() => { dispatch({ type: "detachForBrowse" }); dispatch({ type: "next" }); }}
                className="py-3 px-4 rounded-lg bg-slate-800 active:bg-slate-700">▶︎</button>
      </div>
      {state.browsing ? (
        <button
          onClick={() => dispatch({ type: "syncFromStage", phase: "live", index: stageIndex })}
          className="sticky bottom-0 w-full py-3 bg-emerald-600 text-white text-sm font-medium"
        >
          Live — {ahead > 0 ? `${ahead} slide${ahead === 1 ? "" : "s"} ahead — ` : ""}tap to resume sync
        </button>
      ) : null}
    </main>
  );
}
```

Note: in the prev/next handlers, `dispatch({ type: "prev" })` is a no-op in setup but harmless. The reducer's setup-phase guard also means the follower's own prev/next won't move anything while stage is still in setup; the waiting-room view short-circuits that path regardless.

**Step 3: Smoke test**

```bash
npm run dev
# /present in tab A (waiting on pair screen) + /follow?s=<id> in tab B (waiting room)
# Open /remote?s=…&p=…&as=brandon in tab C, tap Begin
# Tab A → slide 1; Tab B → slide 1
# Tap arrow on B → B detaches + emerald CTA appears; Tap CTA → B resyncs to current
```

**Step 4: Commit**

```bash
git add app/follow components/FollowView.jsx
git commit -m "$(cat <<'EOF'
Build /follow with resumable sync and mobile-friendly navigation

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase F — Corner-QR context, print, polish

### Task F1: Make FloatingQR context-aware

**Files:**
- Modify: `components/SiteApp.jsx` (the existing `function FloatingQR()` near line 1619)

**Step 1: Convert FloatingQR to accept optional `url` / `label` props**

```jsx
/* ===== FLOATING QR ===== */
export default function FloatingQR({ url: overrideUrl, label = "Open research appendix" } = {}) {
  const [fallbackUrl, setFallbackUrl] = useState(null);
  useEffect(() => {
    if (overrideUrl) return;
    setFallbackUrl(window.location.origin + window.location.pathname + "?mode=atlas");
  }, [overrideUrl]);
  const url = overrideUrl || fallbackUrl;
  const qrDataUrl = useQrDataUrl(url);
  if (!qrDataUrl) return null;
  return (
    <a href={url} target="_blank" rel="noreferrer" title={label}
       className="no-print hidden md:block"
       style={{position:"fixed",bottom:"1rem",right:"1rem",zIndex:50,background:"rgba(15,23,42,0.85)",borderRadius:"0.5rem",padding:"0.375rem",backdropFilter:"blur(8px)",border:"1px solid rgba(148,163,184,0.15)",lineHeight:0}}>
      <img alt={label} src={qrDataUrl} width="72" height="72" />
    </a>
  );
}
```

Also re-export it from the file so `StageView` can import without pulling the whole site.

**Step 2: Existing live/atlas callers continue to work** — they call `<FloatingQR />` with no props.

**Step 3: Commit**

```bash
git add components/SiteApp.jsx
git commit -m "$(cat <<'EOF'
Let FloatingQR accept an override URL for presentation follow-along

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task F2: Print stylesheet — one slide per page

**Files:**
- Modify: `app/globals.css` (append)

**Step 1: Append**

```css
@media print {
  .stage-root { width: auto; height: auto; }
  .stage-chrome, .no-print { display: none !important; }
  .stage-slide { page-break-after: always; padding: 1in; }
}
```

**Step 2: Verify via Cmd+P on `/present` — browser should paginate one slide per page.**

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "$(cat <<'EOF'
Paginate /present as one-slide-per-page in print

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task F3: End-to-end smoke verification

**Step 1: Make sure all three routes compile without console errors**

```bash
npm run dev
# Open in three tabs:
#   http://localhost:3000/present
#   http://localhost:3000/remote?s=<copied>&p=<copied>&as=brandon
#   http://localhost:3000/follow?s=<copied>
```

**Step 2: WF-style checklist** (per `/Users/brandon/.codex/WF-TEST-SPEC.md`). Record pass/fail for each:

- [ ] `/present` opens on the pair screen with both speaker QRs + the session PIN, NOT on slide 1.
- [ ] Opening the Brandon QR URL → `/remote?…&as=brandon` shows "Paired as Brandon" + a big "Begin presentation" button.
- [ ] Within ~10s of the remote loading, the matching speaker QR on stage shows a green "paired" badge.
- [ ] Tapping "Begin presentation" on the remote flips the stage to slide 1 and the remote to the notes/controls view.
- [ ] Arrow-right on stage advances to slide 2; remote tab's counter advances; follow tab mirrors.
- [ ] Remote's prev/next buttons advance stage + follow.
- [ ] Brandon's remote shows Tre's notes panel expanded by default (role=lead). Tre's remote shows it collapsed by default.
- [ ] During the presentation, pressing `R` on stage opens the re-pair dialog; dismissing it doesn't drop state.
- [ ] Follow phone after tapping ▶︎ detaches and shows the green "Live — tap to resume sync" CTA; tapping it catches up.
- [ ] Follow shows the "Presentation will begin shortly" waiting room while phase is `setup`.
- [ ] Follow never shows speaker names, speaker badges, or notes.
- [ ] Corner QR on `/present` points to `/follow?s=<id>` (not `?mode=atlas`).
- [ ] Keyboard `B` blanks the stage; `B` again un-blanks.
- [ ] No build or console errors.

**Step 3: Commit any fixes found during the smoke run as their own small commits.** Do not lump fixes into the "build" commits.

---

### Task F4: Update `MEMORY.md` (global memory)

**File:** `/Users/brandon/.claude/projects/-Users-brandon/memory/MEMORY.md`

**Step 1: Add a project memory entry**

Create `/Users/brandon/.claude/projects/-Users-brandon/memory/project_astronomy_presentation_mode.md`:

```markdown
---
name: Astronomy future-compute presentation mode
description: Three-role Pusher-backed slide presentation with per-speaker notes and resumable audience follow-along; lives in ~/Development/astronomy-future-compute
type: project
---

Three browser roles share a Pusher session: Stage at /present (laptop), Remote at /remote?s&p&as (presenter phone, PIN-gated, per-speaker notes), Follow at /follow?s (audience phone, read-only, auto-sync until interaction then sticky "resume" CTA). Slides + speakers live in content/copy.yaml. Server relay at app/api/broadcast. Env: NEXT_PUBLIC_PUSHER_KEY/CLUSTER + PUSHER_APP_ID/KEY/SECRET.

**Why:** Student ASTR 1020K presentation with two speakers (Brandon lead, Tre co). Lead sees both note tracks by default; co sees own primary. Audience never sees speaker identity.

**How to apply:** When touching slide content, edit `content/copy.yaml` under `slides:` — do not touch `lib/copy.js` (generated). When changing realtime behavior, edit `lib/useSession.js` and `app/api/broadcast/route.js` together.
```

Then append to `MEMORY.md`:
```
- [Astronomy presentation mode](project_astronomy_presentation_mode.md) — Stage / Remote / Follow roles, Pusher-backed, lives in ~/Development/astronomy-future-compute
```

**Step 2: Commit (in the astronomy repo; memory files are outside git)**

No commit — memory files are in `~/.claude/projects/-Users-brandon/memory/` which isn't in the repo. Just save the files.

---

## Verification summary (to run after Phase F)

```bash
cd ~/Development/astronomy-future-compute

# 1. Pure-logic tests
node --test tests

# 2. Dev build compiles cleanly
npm run dev
# Expected: "✓ Ready in <Ns>", no errors

# 3. Smoke the three routes (manual)
#    http://localhost:3000/present
#    → pair QR overlay with two speakers
#    → follow/remote tabs sync

# 4. Kill dev server
```

## Out of scope (explicit YAGNI)

- **Private Pusher channels + `/api/pusher/auth`** — we chose PIN-in-message via REST relay for simpler ops.
- **Multi-remote quorum / conflict resolution** — stage just takes whichever control event lands first; two remotes hitting Next simultaneously produce one advance, which is fine.
- **Persistent sessions across stage reload** — sessionStorage keeps the pair URL stable for F5 but a full close ends the session.
- **PWA / offline** — classroom has wifi; not worth the config.
- **Real auth** — PIN protects against accidental hijack, not targeted attackers.
- **Audience analytics** — the follow channel is fire-and-forget.
