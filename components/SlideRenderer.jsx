"use client";
import { SLIDE_VISUALS } from "./SiteApp";

export default function SlideRenderer({ slide, variant = "stage" }) {
  if (!slide) return null;
  const Visual = slide.visual && SLIDE_VISUALS[slide.visual];
  const isStage = variant === "stage";
  const layout = isStage
    ? (Visual ? "grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 items-center" : "flex flex-col")
    : "flex flex-col gap-4";
  const titleClass = isStage
    ? "text-4xl lg:text-5xl font-semibold mb-6"
    : "text-xl font-semibold mb-3";
  const bodyClass = isStage
    ? "text-xl lg:text-2xl leading-relaxed text-slate-200"
    : "text-sm leading-relaxed text-slate-200";
  const paragraphs = (slide.body || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className={`${layout} w-full`}>
      <div>
        <h2 className={titleClass}>{slide.title}</h2>
        <div className={bodyClass}>
          {paragraphs.map((p, i) => <p key={i} className="mb-4 whitespace-pre-wrap">{p}</p>)}
        </div>
      </div>
      {Visual ? (
        <div className={isStage ? "" : "mt-2"}>
          <Visual />
        </div>
      ) : null}
    </div>
  );
}
