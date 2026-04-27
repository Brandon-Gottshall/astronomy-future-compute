"use client";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "../lib/useSession.js";
import SlideRenderer from "./SlideRenderer";
import PairPanel from "./PairPanel";
import { FloatingQR } from "./SiteApp";
import { PHASE_LIVE, PHASE_SETUP } from "../lib/session.js";

const TRANSPORT_MESSAGES = {
  "pusher-not-configured": "Pusher is not configured. Stage state will not sync to other devices.",
  "expired-token": "The stage session expired. Reload /present to create a new session.",
  "invalid-token": "The stage session is invalid. Reload /present to continue.",
  "scope-mismatch": "This stage session was created for another deployment host.",
  "network-error": "Network error while syncing the presentation state.",
};

export default function StageView({
  slides,
  speakers,
  session,
  onResetSession,
  resettingSession,
  resetSessionError,
}) {
  const [transportError, setTransportError] = useState(null);
  const { state, dispatch, pairedRemotes } = useSession({
    sessionId: session.sessionId,
    role: "stage",
    stageToken: session.stageToken,
    total: slides.length,
    onTransportError: (error) =>
      setTransportError(
        TRANSPORT_MESSAGES[error.code] || "Presentation sync failed. Other devices may be out of date."
      ),
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
  const followUrl = session.followPath ? `${origin}${session.followPath}` : "";

  if (blanked) {
    return (
      <main className="stage-root" data-testid="stage-blanked">
        <div className="w-screen h-screen bg-black" />
      </main>
    );
  }

  if (state.phase === PHASE_SETUP) {
    return (
      <main className="stage-root" data-testid="stage-setup">
        {transportError ? (
          <div className="stage-alert">{transportError}</div>
        ) : null}
        <PairPanel
          origin={origin}
          speakers={speakers}
          speakerPaths={session.speakerPaths}
          stageToken={session.stageToken}
          pin={session.pin}
          pairedRemotes={pairedRemotes}
          slideCount={slides.length}
          onResetSession={onResetSession}
          resettingSession={resettingSession}
          resetSessionError={resetSessionError}
        />
        <FloatingQR url={followUrl} label="Scan to follow along" />
      </main>
    );
  }

  const slide = slides[state.index];
  return (
    <main className="stage-root" data-testid="stage-live">
      {transportError ? (
        <div className="stage-alert">{transportError}</div>
      ) : null}
      <div className="stage-slide">
        <SlideRenderer slide={slide} variant="stage" />
      </div>
      <div className={`stage-chrome ${chromeVisible ? "visible" : "hidden"}`}>
        <span className="badge" data-testid="stage-counter">
          {state.index + 1} / {slides.length}
        </span>
        <button onClick={() => setRepairOpen(true)} data-testid="stage-open-repair">
          Pair
        </button>
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
              speakers={speakers}
              speakerPaths={session.speakerPaths}
              stageToken={session.stageToken}
              pin={session.pin}
              pairedRemotes={pairedRemotes}
              compact
              onResetSession={onResetSession}
              resettingSession={resettingSession}
              resetSessionError={resetSessionError}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
