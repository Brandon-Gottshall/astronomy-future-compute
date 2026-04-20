"use client";
import { useState } from "react";
import { useSession } from "../lib/useSession.js";
import SlideRenderer from "./SlideRenderer";
import { PHASE_SETUP } from "../lib/session.js";

export default function FollowView({ slides, sessionId }) {
  const [stageIndex, setStageIndex] = useState(0);
  const { state, dispatch } = useSession({
    sessionId,
    role: "follow",
    total: slides.length,
    onStageState: (nextState) => setStageIndex(nextState.index),
  });

  if (state.phase === PHASE_SETUP) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-8 text-center">
        <div data-testid="follow-waiting" className="contents">
        <div className="text-sm uppercase tracking-wide opacity-60 mb-2">Follow along</div>
        <h1 className="text-2xl font-semibold mb-3">Presentation will begin shortly</h1>
        <p className="opacity-70 max-w-sm">
          Stay on this page. When the presenters tap begin, the current slide will appear here
          automatically.
        </p>
        </div>
      </main>
    );
  }

  const slide = slides[state.index];
  const ahead = Math.max(0, stageIndex - state.index);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col" data-testid="follow-live">
      <div className="flex-1 p-4 overflow-auto" data-testid="follow-slide">
        <SlideRenderer slide={slide} variant="follow" />
      </div>
      <div className="flex items-center justify-between gap-2 p-3 border-t border-slate-800 bg-slate-900">
        <button
          onClick={() => {
            dispatch({ type: "detachForBrowse" });
            dispatch({ type: "prev" });
          }}
          data-testid="follow-prev"
          className="py-3 px-4 rounded-lg bg-slate-800 active:bg-slate-700"
        >
          ◀︎
        </button>
        <div className="text-xs opacity-60" data-testid="follow-counter">
          Slide {state.index + 1} / {slides.length}
        </div>
        <button
          onClick={() => {
            dispatch({ type: "detachForBrowse" });
            dispatch({ type: "next" });
          }}
          data-testid="follow-next"
          className="py-3 px-4 rounded-lg bg-slate-800 active:bg-slate-700"
        >
          ▶︎
        </button>
      </div>
      {state.browsing ? (
        <button
          onClick={() =>
            dispatch({ type: "syncFromStage", phase: "live", index: stageIndex, force: true })
          }
          data-testid="follow-resume-sync"
          className="sticky bottom-0 w-full py-3 bg-emerald-600 text-white text-sm font-medium"
        >
          Live{ahead > 0 ? ` — ${ahead} slide${ahead === 1 ? "" : "s"} ahead` : ""} — tap to
          resume sync
        </button>
      ) : null}
    </main>
  );
}
