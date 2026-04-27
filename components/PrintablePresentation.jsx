"use client";

import SlideRenderer from "./SlideRenderer";
import { COPY } from "../lib/copy.js";
import { Button } from "@/components/ui/button";

export default function PrintablePresentation() {
  const slides = COPY.slides || [];
  return (
    <main className="print-deck-page">
      <header className="print-deck-hero no-print">
        <div className="print-deck-hero-copy">
          <div className="text-xs md:text-sm font-semibold uppercase tracking-widest text-cyan-300 mb-3">
            {COPY.print.eyebrow}
          </div>
          <h1 className="text-white mb-4">{COPY.meta.title}</h1>
          <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">
            {COPY.print.intro}
          </p>
          <p className="mt-4 text-slate-400">
            {COPY.meta.authors.join(" & ")} · {COPY.meta.date} · {slides.length} {COPY.print.slidesSuffix}
          </p>
        </div>
        <div className="print-deck-actions">
          <Button
            type="button"
            className="min-h-11 rounded-full border-cyan-400/70 bg-gradient-to-br from-cyan-600 to-blue-600 px-4 py-2 font-bold text-white hover:from-cyan-500 hover:to-blue-500"
            onClick={() => window.print()}
          >
            {COPY.print.printButton}
          </Button>
          <Button
            asChild
            variant="secondary"
            className="min-h-11 rounded-full border border-white/15 bg-white/10 px-4 py-2 font-bold text-slate-200 hover:bg-white/15 hover:text-white"
          >
            <a href="/">{COPY.print.mainPaperLink}</a>
          </Button>
          <Button
            asChild
            variant="secondary"
            className="min-h-11 rounded-full border border-white/15 bg-white/10 px-4 py-2 font-bold text-slate-200 hover:bg-white/15 hover:text-white"
          >
            <a href="/research">{COPY.print.researchAppendixLink}</a>
          </Button>
        </div>
      </header>

      <section className="print-only print-submission-links">
        <h2>{COPY.print.submissionLinksTitle}</h2>
        <p>{COPY.print.mainPaperSubmission}</p>
        <p>{COPY.print.researchAppendixSubmission}</p>
        <p>{COPY.print.printablePresentationSubmission}</p>
        <p>{COPY.print.presenterSetupSubmission}</p>
      </section>

      <section className="print-deck-slides" aria-label={COPY.print.slidesAriaLabel}>
        {slides.map((slide, index) => (
          <article className="print-slide" key={slide.id || index}>
            <div className="print-slide-counter">
              {COPY.print.slideLabel} {index + 1} / {slides.length}
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
