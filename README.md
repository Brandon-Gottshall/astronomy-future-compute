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
id, and secret. Then:

1. Open `/present` on your laptop — it opens on the pair screen with both
   speaker QRs visible and the session PIN displayed.
2. Each speaker scans their own QR → lands on `/remote?…` paired.
3. Tap "Begin presentation" on either remote when ready. The stage flips to
   slide 1 and audience follow-along goes live.
4. Corner QR on the stage is the audience follow-along — anyone can scan to
   follow along on their own phone.
