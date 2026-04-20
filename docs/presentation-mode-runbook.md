# Presentation Mode Runbook

## Required environment

Set these in `.env.local`, GitHub Actions secrets, and both Vercel preview and
production environments:

- `NEXT_PUBLIC_PUSHER_KEY`
- `NEXT_PUBLIC_PUSHER_CLUSTER`
- `PUSHER_APP_ID`
- `PUSHER_KEY`
- `PUSHER_SECRET`
- `PRESENTATION_TOKEN_SECRET`

## Local smoke flow

1. Start the app with `npm run dev`.
2. Open `/present`.
3. Confirm the stage shows:
   - both speaker QR cards
   - a visible session PIN
   - `Reveal pair token` actions
4. Scan or open a speaker QR URL.
5. Reveal a pair token on the stage and enter that token plus the session PIN on the phone.
6. Tap `Begin presentation`.
7. Verify:
   - `/present` enters live mode
   - `/remote` shows notes and controls
   - `/follow?s=<session>` leaves the waiting room and tracks slide changes

## Recovery checks

- Wrong PIN shows an explicit PIN error.
- Expired pair token shows an explicit expiry error.
- Invalid pair token shows an explicit invalid-token error.
- Pressing `R` on the stage reopens pairing without dropping the live slide state.
- Refreshing a paired remote restores the presenter token from `sessionStorage`.

## Regression

Run the deterministic browser regression with:

```bash
npm run test:regression
```

In multi-agent local environments, run the dev server on a dedicated port and point
Playwright at it:

```bash
PORT=3002 npm run dev
E2E_BASE_URL=http://127.0.0.1:3002 PW_NO_WEB_SERVER=1 npm run test:regression
```

## WF gate

Use the existing harness assets in `tests/wf/`:

- `presentation.wf-spec.yaml`
- `presentation.wf-agent-prompt.md`
- `presentation.wf-report.template.md`

Required low-context roles:

1. Stage agent
2. Presenter agent
3. Audience agent
4. Recovery agent

Release is blocked on unresolved `P0` or `P1` WF findings.

## Preview and production rollout

1. Ensure the GitHub repo is connected to the Vercel project.
2. Configure the six presentation environment variables in Vercel preview and production.
3. Open a PR and verify:
   - GitHub Actions `verify` job passes
   - GitHub Actions `regression` job passes when secrets are present
   - the Vercel preview deployment loads `/present`, `/remote`, and `/follow`
4. Run the WF pass against the preview deployment and attach the report.
5. Merge to `main`.
6. Smoke production on `/present`, `/remote`, and `/follow`.
