# Case Study: Astronomy's Future Compute

## Snapshot

- Type: school presentation case study
- Medium: web app instead of a conventional slide deck
- Domain: astronomy and compute infrastructure
- Current role: self-describing artifact with future portfolio potential

## Problem

The project asks a presentation-level question with a product-level constraint: can an astronomy presentation work better as a live web artifact than as a static PowerPoint deck?

That changes the job of the repo. It is not only holding slides. It has to hold:

- the presentation content
- the interaction model for presenters and audience
- the rationale for why a web surface is the right delivery mechanism

## Constraints

- It started from a single-file presentation artifact that already encoded the core content.
- The presentation has live-stage requirements, not just passive reading requirements.
- The artifact needs to be understandable later, outside the original classroom moment.
- The repo should become explainable enough to function as a case study before it is treated as a portfolio piece.

## Approach

- Preserve the original presentation abstractions during the move to Next.js so copy edits stay cheap.
- Treat the presentation as an application with stage, remote, and audience-follow modes rather than as exported slides.
- Keep logic, regression, and WF artifacts visible so the repo documents not only what it says, but how the experience is meant to behave.
- Add explicit case-study and provenance documents so the repo can explain itself without outside context.

## Outcome So Far

- The original presentation has been ported into a Next.js application.
- Presentation-mode architecture and workflow artifacts exist in-repo.
- The repo now lives under `/Users/brandon/Development/Case-Studies/astronomy-future-compute`, which matches its intended role better than a generic top-level development root.

## Why This Matters

This project is useful as a case study because it demonstrates a design choice, not just a finished screen:

- replacing static slides with an interactive web presentation
- using product architecture to support a presentation workflow
- treating a school deliverable as a reusable explanatory artifact

## Lessons And Next Steps

- The repo needs explicit provenance and interpretation boundaries so later readers know what was true at delivery time versus what was added later.
- If it eventually becomes a portfolio feature, the portfolio should point at this case study instead of replacing it.
- The next maturity step is tightening the explanatory layer around the artifact, not just polishing the UI.
