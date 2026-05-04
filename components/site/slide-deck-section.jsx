"use client";

import SlideRenderer from "../SlideRenderer";
import { COPY } from "../../lib/data";

export default function SlideDeckSection() {
  const slides = COPY.slides || [];
  if (!slides.length) return null;
  return (
    <section id="slides" className="section-wrap">
      <div className="fade-in text-center mb-10">
        <h2 className="mb-2">Slides</h2>
        <p className="text-slate-400 max-w-3xl mx-auto">
          The presentation in slide form, top to bottom.
        </p>
      </div>
      <div className="print-deck-slides">
        {slides.map((slide, index) => (
          <article className="print-slide" key={slide.id || index}>
            <div className="print-slide-body">
              <SlideRenderer slide={slide} variant="stage" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
