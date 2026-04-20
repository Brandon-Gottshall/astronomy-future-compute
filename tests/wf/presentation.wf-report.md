# WF Run Report

## Context
- Product: Astronomy future-compute presentation mode
- Entry URL: `http://127.0.0.1:3103/present`
- Persona: capable but uninformed class presenter or audience member
- Agent constraints:
  - No repo context
  - No hidden routes
  - No implementation hints
- Build/version: local workspace on 2026-04-20 after QR-embedded pair-token update

## Checklist Results
1. [pass] Start the stage workflow  
Path taken: Stage agent opened `/present`, read the visible pairing copy, clicked `Reveal pair token`, saw the Brandon QR activate, and shared the visible session PIN.  
Confusion: None in the visible setup flow.  
Evidence: `Pair to begin`, `Scan your speaker's QR`, `Reveal a short-lived pair token, have the speaker scan the unlocked QR, then enter the session PIN on the phone.`, `QR unlocked`, visible session PIN, and a speaker URL containing `/remote?...&pt=...`.  
Severity if failed:

2. [pass] Pair a presenter remote  
Path taken: Presenter remote opened the unlocked Brandon speaker URL from the stage, saw that the QR already carried the token, entered the visible stage PIN, and reached the paired setup state.  
Confusion: None in the pairing step.  
Evidence: `Unlock this remote`, `QR token detected. Enter the stage PIN to continue.`, wrong-PIN error `That PIN is incorrect.`, success state `Paired as Brandon Gottshall`, `20 slides ready.`  
Severity if failed:

3. [pass] Begin and progress through the live presentation  
Path taken: Paired remote tapped `Begin presentation`, the stage entered the live slide view, keyboard navigation advanced the stage, and remote next/prev controls stayed in sync.  
Confusion: None in the live transition or slide-control path.  
Evidence: stage counter `1 / 20` then `2 / 20` then `3 / 20`, remote counter `Slide 1 / 20` then `Slide 2 / 20`, live remote notes, and no transport-offline warnings with the real Pusher-backed local environment.  
Severity if failed: P0

4. [pass] Follow as an audience member  
Path taken: Audience agent opened `/follow?s=...` from the visible stage follow link, waited through setup, then observed the live slide and tested detach/resume sync.  
Confusion: None.  
Evidence: waiting-room copy `Presentation will begin shortly`, then live counter `Slide 1 / 20`, later `Slide 3 / 20`, `Resume sync` after local browse, and no visible speaker names, roles, or notes.  
Severity if failed:

5. [pass] Recover from a plausible mistake  
Path taken: Recovery agent tried a wrong PIN, then an expired/unlocked QR variant, then an invalid QR variant, and finally recovered with a fresh unlocked QR from the stage.  
Confusion: None in the retry path.  
Evidence: `That PIN is incorrect.`, `That QR expired. Ask the stage to refresh it, then scan again.`, `This QR is no longer valid for this speaker. Ask the stage to refresh it.`, followed by successful return to `Paired as Brandon Gottshall`.  
Severity if failed:

6. [pass] Verify persistence or restore  
Path taken: Local browser verification refreshed `/present`, `/remote`, and the live follow page after pairing and begin.  
Confusion: None after the stage restore fix.  
Evidence: `/present` preserved the same session URL and PIN after reload, `/remote` stayed on `Paired as Brandon Gottshall` after reload, and `/follow` resumed the live synced slide cleanly.  
Severity if failed:

## Findings
- P0:
  - None reproduced in the live local Pusher-backed run.
- P1:
  - None reproduced after the final fixes.
- P2:
  - None reproduced after the final fixes.
- P3:
  - None.

## Overall Verdict
- WF status: pass
- Blocking issues:
  - None in the local Pusher-backed run.
- Recommended follow-up:
  - Re-run the same checklist against the protected Vercel preview URL after the next push so preview auth and production-like host scoping are covered by the release gate.
