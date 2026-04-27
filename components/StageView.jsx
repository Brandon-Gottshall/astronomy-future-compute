"use client";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "../lib/useSession.js";
import SlideRenderer from "./SlideRenderer";
import PairPanel from "./PairPanel";
import { FloatingQR } from "./SiteApp";
import { PHASE_LIVE, PHASE_SETUP } from "../lib/session.js";
import { COPY } from "../lib/copy.js";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const TRANSPORT_MESSAGES = COPY.errors?.stageTransport || {};

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
        TRANSPORT_MESSAGES[error.code] || TRANSPORT_MESSAGES.fallback
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
          <Alert
            variant="destructive"
            className="stage-alert border-rose-500/40 bg-rose-500/10 text-rose-200"
            aria-live="polite"
          >
            <AlertDescription>{transportError}</AlertDescription>
          </Alert>
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
        <FloatingQR url={followUrl} label={COPY.stage.followQrLabel} />
      </main>
    );
  }

  const slide = slides[state.index];
  return (
    <main className="stage-root" data-testid="stage-live">
      {transportError ? (
        <Alert
          variant="destructive"
          className="stage-alert border-rose-500/40 bg-rose-500/10 text-rose-200"
          aria-live="polite"
        >
          <AlertDescription>{transportError}</AlertDescription>
        </Alert>
      ) : null}
      <div className="stage-slide">
        <SlideRenderer slide={slide} variant="stage" />
      </div>
      <div className={`stage-chrome ${chromeVisible ? "visible" : "hidden"}`}>
        <Badge className="badge" data-testid="stage-counter">
          {state.index + 1} / {slides.length}
        </Badge>
        <Button type="button" onClick={() => setRepairOpen(true)} data-testid="stage-open-repair">
          {COPY.stage.pairButton}
        </Button>
      </div>
      <FloatingQR url={followUrl} label={COPY.stage.followQrLabel} />
      <Dialog open={repairOpen} onOpenChange={setRepairOpen} modal>
        <DialogContent className="max-w-2xl border-slate-700 bg-slate-900 text-slate-100">
          <DialogHeader>
            <DialogTitle>{COPY.stage.repairTitle}</DialogTitle>
            <DialogDescription className="text-slate-300">
              {COPY.stage.pairIntroBody}
            </DialogDescription>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
    </main>
  );
}
