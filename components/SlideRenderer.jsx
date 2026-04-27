"use client";
import { SLIDE_VISUALS } from "./presentation/slide-visuals";

function resolveLayout(slide, hasVisual) {
  if (slide.layout) return slide.layout;
  return hasVisual ? "split" : "stacked";
}

export default function SlideRenderer({ slide, variant = "stage" }) {
  if (!slide) return null;
  const Visual = slide.visual && SLIDE_VISUALS[slide.visual];
  const isStage = variant === "stage";
  const layout = resolveLayout(slide, Boolean(Visual));

  const titleClass = isStage
    ? "text-4xl lg:text-5xl font-semibold"
    : "text-xl font-semibold";
  const dekClass = isStage
    ? "text-xl lg:text-2xl text-slate-400 mt-2"
    : "text-sm text-slate-400 mt-1";
  const bodyClass = isStage
    ? "text-xl lg:text-2xl leading-relaxed text-slate-200"
    : "text-sm leading-relaxed text-slate-200";
  const bulletClass = isStage
    ? "text-xl lg:text-2xl leading-relaxed text-slate-200"
    : "text-sm leading-relaxed text-slate-200";

  const paragraphs = (slide.body || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const bullets = Array.isArray(slide.bullets) ? slide.bullets.filter(Boolean) : [];

  const TextBlock = (
    <div>
      <h2 className={titleClass}>{slide.title}</h2>
      {slide.dek ? <p className={dekClass}>{slide.dek}</p> : null}
      {bullets.length > 0 ? (
        <ul className={`mt-6 space-y-3 ${bulletClass}`}>
          {bullets.map((b, i) => (
            <li
              key={i}
              className="pl-4 border-l-2 border-indigo-500/60"
            >
              {b}
            </li>
          ))}
        </ul>
      ) : paragraphs.length > 0 ? (
        <div className={`${bodyClass} mt-6`}>
          {paragraphs.map((p, i) => (
            <p key={i} className="mb-4 whitespace-pre-wrap">
              {p}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );

  const VisualBlock = Visual ? (
    <div className={isStage ? "" : "mt-2"}>
      <Visual config={slide.visualConfig} />
    </div>
  ) : null;

  if (layout === "hero") {
    const captionBody = paragraphs.length > 0 ? (
      <div className={`${bodyClass} mt-4`}>
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-wrap">
            {p}
          </p>
        ))}
      </div>
    ) : null;
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center gap-8">
        {VisualBlock}
        <div className="max-w-4xl">
          <h2 className={titleClass}>{slide.title}</h2>
          {slide.dek ? <p className={dekClass}>{slide.dek}</p> : null}
          {captionBody}
        </div>
      </div>
    );
  }

  if (layout === "split" && VisualBlock) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 items-center w-full">
        {TextBlock}
        {VisualBlock}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {TextBlock}
      {VisualBlock}
    </div>
  );
}
