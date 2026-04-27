"use client";

import SlideRenderer from "./SlideRenderer";
import { COPY } from "../lib/copy.js";

export default function PrintablePresentation() {
  const slides = COPY.slides || [];
  return (
    <main className="print-deck-page">
      <header className="print-deck-hero no-print">
        <div className="print-deck-hero-copy">
          <div className="text-xs md:text-sm font-semibold uppercase tracking-widest text-cyan-300 mb-3">
            Printable presentation
          </div>
          <h1 className="text-white mb-4">{COPY.meta.title}</h1>
          <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">
            Static slide deck for review, printing, or export. The live presenter system remains at
            its own setup link and is not required for grading.
          </p>
          <p className="mt-4 text-slate-400">
            {COPY.meta.authors.join(" & ")} · {COPY.meta.date} · {slides.length} slides
          </p>
        </div>
        <div className="print-deck-actions">
          <button type="button" className="action-btn primary" onClick={() => window.print()}>
            Print presentation
          </button>
          <a href="/" className="action-btn secondary">
            Main paper
          </a>
          <a href="/research" className="action-btn secondary">
            Research appendix
          </a>
        </div>
      </header>

      <section className="print-only print-submission-links">
        <h2>Submission links</h2>
        <p>Main paper: /</p>
        <p>Research appendix: /research</p>
        <p>Printable presentation: /presentation</p>
        <p>Presenter setup for live delivery only: /present</p>
      </section>

      <section className="print-deck-slides" aria-label="Printable slide deck">
        {slides.map((slide, index) => (
          <article className="print-slide" key={slide.id || index}>
            <div className="print-slide-counter">
              Slide {index + 1} / {slides.length}
            </div>
            <div className="print-slide-body">
              <SlideRenderer slide={slide} variant="stage" />
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
