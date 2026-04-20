# Astronomy's Future Compute — Next.js port

Port of the single-file Preact/htm presentation site (`ASTRO Presentation Site.html`)
to Next.js (App Router). Abstractions are preserved for easy copy edits:

- **`lib/data.js`** — `DATA` and `COPY` objects (same shape and keys as the original).
  Edit text and numbers here exactly as you would in the original HTML file.
- **`components/SiteApp.jsx`** — all section components (`FullViewportHero`,
  `TheProblemSection`, `ThreePathwaysSection`, `AstronomyImpactSection`,
  `ButWhatAboutSection`, `RecommendationsSection`, `ReferencesSection`,
  `LiveHero`, `LiveAstronomySection`, etc.) ported one-to-one from the original.
- **`app/page.jsx`** — picks atlas vs live mode from `?mode=` exactly like the original.
- **`app/globals.css`** — the original `<style>` block, unchanged.

## Run

```bash
npm install
npm run dev
```

Then open <http://localhost:3000> (live mode) or <http://localhost:3000/?mode=atlas>.

## Presentation mode

Copy `.env.example` to `.env.local` and fill in your Pusher app key, cluster,
id, secret, and `PRESENTATION_TOKEN_SECRET`. Then:

1. Open `/present` on your laptop — it opens on the pair screen with both
   speaker QRs visible and the session PIN displayed.
2. Each speaker scans their own QR → lands on `/remote?…&as=<speaker>`.
3. On the stage, click `Reveal pair token` for that speaker and tell them the
   short-lived token plus the session PIN.
4. On the phone, enter the pair token and PIN. The remote unlocks its `Begin presentation`
   button.
5. Tap `Begin presentation` on either remote when ready. The stage flips to
   slide 1 and audience follow-along goes live.
6. Corner QR on the stage is the audience follow-along — anyone can scan to
   follow along on their own phone.

## Regression and WF

Pure logic tests:

```bash
npm test
```

Browser regression:

```bash
npm run test:regression
```

If you already have a dev server running on a non-default port, point Playwright
at it instead of hardcoding `3000`:

```bash
E2E_BASE_URL=http://127.0.0.1:3002 PW_NO_WEB_SERVER=1 npm run test:regression
```

WF artifacts for the low-context presentation pass live under [`tests/wf`](./tests/wf):

- `presentation.wf-spec.yaml`
- `presentation.wf-agent-prompt.md`
- `presentation.wf-report.template.md`

## Shipping Notes

- CI runs `npm test`, `npm run build`, and Playwright regression when the required
  presentation secrets are configured in GitHub Actions.
- Vercel preview and production environments both need:
  `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`, `PUSHER_APP_ID`,
  `PUSHER_KEY`, `PUSHER_SECRET`, and `PRESENTATION_TOKEN_SECRET`.
- The presentation channel namespace is derived from the deployment host, so preview
  and production do not cross-talk even when they share one Pusher app.
