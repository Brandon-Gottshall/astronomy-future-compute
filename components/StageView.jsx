"use client";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "../lib/useSession.js";
import SlideRenderer from "./SlideRenderer";
import PairPanel from "./PairPanel";
import { FloatingQR } from "./SiteApp";
import { PHASE_LIVE, PHASE_SETUP } from "../lib/session.js";

export default function StageView({ slides, speakers, sessionId, pin }) {
  const { state, dispatch, pairedRemotes } = useSession({
    sessionId,
    role: "stage",
    pin,
    total: slides.length,
  });
  const [chromeVisible, setChromeVisible] = useState(true);
  const [blanked, setBlanked] = useState(false);
  const [repairOpen, setRepairOpen] = useState(false);

  const keydown = useCallback(
    (e) => {
      if (state.phase === PHASE_LIVE) {
        if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
          e.preventDefault();
          dispatch({ type: "next" });
          return;
        }
        if (e.key === "ArrowLeft" || e.key === "PageUp") {
          e.preventDefault();
          dispatch({ type: "prev" });
          return;
        }
        if (e.key === "Home") {
          dispatch({ type: "jump", to: 0 });
          return;
        }
        if (e.key === "End") {
          dispatch({ type: "jump", to: slides.length - 1 });
          return;
        }
      }
      if (e.key === "r" || e.key === "R") setRepairOpen((v) => !v);
      else if (e.key === "b" || e.key === "B") setBlanked((v) => !v);
      else if (e.key === "Escape") setChromeVisible((v) => !v);
    },
    [dispatch, slides.length, state.phase]
  );

  useEffect(() => {
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [keydown]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const followUrl = `${origin}/follow?s=${sessionId}`;

  if (blanked) {
    return (
      <main className="stage-root">
        <div className="w-screen h-screen bg-black" />
      </main>
    );
  }

  if (state.phase === PHASE_SETUP) {
    return (
      <main className="stage-root">
        <PairPanel
          origin={origin}
          sessionId={sessionId}
          pin={pin}
          speakers={speakers}
          pairedRemotes={pairedRemotes}
          slideCount={slides.length}
        />
        <FloatingQR url={followUrl} label="Scan to follow along" />
      </main>
    );
  }

  const slide = slides[state.index];
  return (
    <main className="stage-root">
      <div className="stage-slide">
        <SlideRenderer slide={slide} variant="stage" />
      </div>
      <div className={`stage-chrome ${chromeVisible ? "visible" : "hidden"}`}>
        <span className="badge">
          {state.index + 1} / {slides.length}
        </span>
        <button onClick={() => setRepairOpen(true)}>Pair</button>
      </div>
      <FloatingQR url={followUrl} label="Scan to follow along" />
      {repairOpen ? (
        <div
          role="dialog"
          onClick={() => setRepairOpen(false)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-2xl w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Re-pair a remote</h2>
              <button onClick={() => setRepairOpen(false)}>✕</button>
            </div>
            <PairPanel
              origin={origin}
              sessionId={sessionId}
              pin={pin}
              speakers={speakers}
              pairedRemotes={pairedRemotes}
              compact
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
