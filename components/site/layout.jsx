"use client";

import { useEffect, useState } from "react";
import { COPY } from "../../lib/data";
import { cn, modeHref } from "./utils";
import { useQrDataUrl } from "./hooks";
import { Card, PrintButton } from "./primitives";
import { Button } from "@/components/ui/button";

export function AppendixBanner() {
  return (
    <div className="no-print border-b border-indigo-500/25 bg-indigo-500/10">
      <div className="max-w-6xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="text-indigo-200">{COPY.common.appendixBannerMain}</span>
        <a
          href={modeHref("live", "live-hero")}
          className="ref-link text-indigo-300"
        >
          {COPY.common.appendixBannerBack}
        </a>
      </div>
    </div>
  );
}

export function SubmissionPanel({ mode }) {
  const isResearch = mode === "research";
  const copy = COPY.site.submission;
  const printLabel = isResearch ? copy.printResearch : copy.printMain;
  const currentLabel = isResearch ? copy.researchViewLabel : copy.mainViewLabel;
  return (
    <aside className="submission-panel no-print" aria-label={copy.ariaLabel}>
      <div>
        <div className="text-xs uppercase tracking-widest text-cyan-300 font-semibold mb-2">
          {copy.kicker}
        </div>
        <h2 className="text-2xl md:text-3xl mb-2">{copy.title}</h2>
        <p className="text-slate-300 max-w-3xl">
          {copy.body}
        </p>
      </div>
      <div className="submission-grid">
        <Card className="submission-card">
          <div className="submission-kicker">{copy.currentKicker}</div>
          <h3>{currentLabel}</h3>
          <p>{copy.currentBody}</p>
          <PrintButton className="primary">{printLabel}</PrintButton>
        </Card>
        <a className="submission-card link-card" href={isResearch ? "/" : "/research"}>
          <div className="submission-kicker">{copy.otherViewKicker}</div>
          <h3>{isResearch ? copy.mainViewLabel : copy.researchViewLabel}</h3>
          <p>{isResearch ? copy.mainBody : copy.researchBody}</p>
        </a>
        <a className="submission-card link-card" href="/presentation">
          <div className="submission-kicker">{copy.slidesKicker}</div>
          <h3>{copy.slidesTitle}</h3>
          <p>{copy.slidesBody}</p>
        </a>
      </div>
    </aside>
  );
}

export function PrintSubmissionLinks() {
  return (
    <aside className="print-only print-submission-links">
      <h2>{COPY.print.submissionLinksTitle}</h2>
      <p>{COPY.print.mainPaperSubmission}</p>
      <p>{COPY.print.researchAppendixSubmission}</p>
      <p>{COPY.print.printablePresentationSubmission}</p>
      <p>{COPY.print.presenterSetupSubmission}</p>
    </aside>
  );
}

/* ===== FLOATING QR ===== */
export function FloatingQR({ url: overrideUrl, label = COPY.common.openResearchAtlas } = {}) {
  const [fallbackUrl, setFallbackUrl] = useState(null);
  useEffect(() => {
    if (overrideUrl) return;
    setFallbackUrl(window.location.origin + "/research");
  }, [overrideUrl]);
  const url = overrideUrl || fallbackUrl;
  const qrDataUrl = useQrDataUrl(url);
  if (!qrDataUrl) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={label}
      className="no-print hidden md:block fixed bottom-4 right-4 z-50 rounded-lg border border-slate-400/15 bg-slate-900/85 p-1.5 leading-none backdrop-blur"
    >
      <img alt={label} src={qrDataUrl} width="72" height="72" />
    </a>
  );
}

/* ===== NAVIGATION ===== */
export function ScrollProgressBar({ progress }) {
  return <div className="scroll-progress" style={{ width: progress + "%" }} />;
}

export function StickyNav({ mode, sections, activeSection }) {
  const targetMode = mode === "live" ? "atlas" : "live";
  const targetLabel =
    mode === "live"
      ? COPY.common.openResearchAtlas
      : COPY.common.openPresentationMode;
  return (
    <nav
      className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md no-print"
    >
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-1 overflow-x-auto">
        {sections.map((s) => (
          <a
            key={s.id}
            href={"#" + s.id}
            className={cn("nav-pill", activeSection === s.id && "active")}
          >
            {s.nav}
          </a>
        ))}
        <div className="ml-auto pl-3">
          <Button asChild className="action-btn small secondary whitespace-nowrap">
            <a href={modeHref(targetMode, targetMode === "live" ? "live-hero" : "hero")}>
              {targetLabel}
            </a>
          </Button>
        </div>
        <Button asChild className="action-btn small secondary whitespace-nowrap">
          <a href="/presentation">{COPY.site.nav.slides}</a>
        </Button>
        <PrintButton className="small primary whitespace-nowrap">{COPY.site.nav.print}</PrintButton>
      </div>
    </nav>
  );
}
