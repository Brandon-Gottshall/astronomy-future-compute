"use client";

import { COPY } from "../../lib/data";
import { cn } from "./utils";
import { useQrDataUrl } from "./hooks";
import { SavePdfLink } from "./primitives";

export function FloatingQR({ url, label }) {
  const qrDataUrl = useQrDataUrl(url);
  if (!url || !qrDataUrl) return null;
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

export function ScrollProgressBar({ progress }) {
  return <div className="scroll-progress" style={{ width: progress + "%" }} />;
}

export function StickyNav({ sections, activeSection }) {
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
          <SavePdfLink className="small primary whitespace-nowrap">
            {COPY.common.savePdf}
          </SavePdfLink>
        </div>
      </div>
    </nav>
  );
}
