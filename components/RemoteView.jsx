"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "../lib/useSession.js";
import {
  getRemoteStorageKey,
  isValidPin,
  sanitizePairToken,
  PHASE_SETUP,
} from "../lib/session.js";
import { COPY } from "../lib/copy.js";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const PAIR_ERROR_MESSAGES = COPY.errors?.pair || {};
const TRANSPORT_ERROR_MESSAGES = COPY.errors?.remoteTransport || {};

export default function RemoteView({ slides, speaker, speakers, sessionId, pairTokenFromUrl }) {
  const storageKey = speaker ? getRemoteStorageKey(sessionId, speaker.id) : null;
  const [presenterToken, setPresenterToken] = useState(null);
  const [pin, setPin] = useState("");
  const [pairing, setPairing] = useState(false);
  const [pairError, setPairError] = useState(null);
  const [transportError, setTransportError] = useState(null);
  const [otherExpanded, setOtherExpanded] = useState(speaker?.role === "lead");
  const unlockedPairToken = sanitizePairToken(pairTokenFromUrl);

  const clearPresenterToken = useCallback(() => {
    if (storageKey && typeof window !== "undefined") {
      sessionStorage.removeItem(storageKey);
    }
    setPresenterToken(null);
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      setPresenterToken(saved);
    }
  }, [storageKey]);

  const { state, sendControl, beginPresentation, sendHeartbeat } = useSession({
    sessionId,
    role: "remote",
    as: speaker?.id,
    total: slides.length,
    presenterToken,
    onTransportError: (error) => {
      setTransportError(
        TRANSPORT_ERROR_MESSAGES[error.code] ||
          TRANSPORT_ERROR_MESSAGES.fallback
      );
      if (["expired-token", "invalid-token", "scope-mismatch"].includes(error.code)) {
        clearPresenterToken();
      }
    },
  });

  useEffect(() => {
    let wakeLock = null;
    (async () => {
      try {
        wakeLock = await navigator.wakeLock?.request("screen");
      } catch (e) {
        /* ignore */
      }
    })();
    return () => {
      try {
        wakeLock?.release();
      } catch (e) {
        /* ignore */
      }
    };
  }, []);

  useEffect(() => {
    if (!presenterToken) return undefined;
    const interval = setInterval(() => {
      void sendHeartbeat();
    }, 10_000);
    void sendHeartbeat();
    return () => clearInterval(interval);
  }, [presenterToken, sendHeartbeat]);

  const otherSpeaker = useMemo(
    () => speakers.find((item) => item.id !== speaker?.id),
    [speaker, speakers]
  );

  if (!speaker) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8 text-center">
        <div className="max-w-sm space-y-3">
          <h1 className="text-2xl font-semibold">{COPY.remote.invalidTitle}</h1>
          <p className="opacity-80">{COPY.remote.invalidBody}</p>
        </div>
      </main>
    );
  }

  const pairRemote = async () => {
    setPairing(true);
    setPairError(null);
    setTransportError(null);

    if (!unlockedPairToken) {
      setPairing(false);
      setPairError(PAIR_ERROR_MESSAGES["missing-pair-token"]);
      return;
    }

    if (!isValidPin(pin)) {
      setPairing(false);
      setPairError(PAIR_ERROR_MESSAGES["bad-pin"]);
      return;
    }

    const response = await fetch("/api/present/pair", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        speakerId: speaker.id,
        pairToken: unlockedPairToken,
        pin,
      }),
    });
    const data = await response.json().catch(() => null);
    setPairing(false);
    if (!response.ok || !data?.ok) {
      setPairError(
        PAIR_ERROR_MESSAGES[data?.error] || PAIR_ERROR_MESSAGES.fallback
      );
      return;
    }
    setPresenterToken(data.presenterToken);
    if (storageKey && typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, data.presenterToken);
    }
  };

  if (!presenterToken) {
    return (
      <main className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <header className="p-6 text-center">
          <div className="text-xs uppercase tracking-wide opacity-60 mb-1">{COPY.remote.presenterRemoteLabel}</div>
          <div className="text-2xl font-semibold">{speaker.name}</div>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <Card
            className="w-full max-w-md border-slate-800 bg-slate-900/70 text-slate-100"
            data-testid="remote-pairing"
            role="form"
          >
            <CardHeader>
              <CardTitle className="text-2xl">{COPY.remote.unlockTitle}</CardTitle>
              <CardDescription className="text-slate-300">
                {COPY.remote.unlockBody}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {unlockedPairToken ? (
                <Alert
                  className="border-indigo-500/30 bg-indigo-500/10 text-slate-100"
                  role="status"
                  aria-live="polite"
                >
                  <AlertDescription>{COPY.remote.tokenDetected}</AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-100">
                  <AlertDescription>{COPY.remote.tokenMissing}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="session-pin-input" className="text-slate-300">
                  {COPY.remote.pinLabel}
                </Label>
                <Input
                  id="session-pin-input"
                  value={pin}
                  onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void pairRemote();
                    }
                  }}
                  data-testid="session-pin-input"
                  className="h-auto w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 font-mono text-base text-slate-100 tracking-[0.35em] placeholder:text-slate-500 outline-none focus:border-indigo-400"
                  placeholder="1234"
                  inputMode="numeric"
                  aria-describedby={pairError ? "remote-pair-error" : undefined}
                />
              </div>
              {pairError ? (
                <Alert
                  id="remote-pair-error"
                  variant="destructive"
                  className="border-rose-500/40 bg-rose-500/10 text-rose-200"
                  aria-live="polite"
                >
                  <AlertDescription>{pairError}</AlertDescription>
                </Alert>
              ) : null}
              <Button
                type="button"
                onClick={() => void pairRemote()}
                disabled={pairing || !unlockedPairToken}
                data-testid="pair-remote-button"
                className="h-auto w-full rounded-xl bg-indigo-600 py-4 text-lg font-semibold disabled:opacity-60"
              >
                {pairing ? COPY.remote.unlockingButton : COPY.remote.unlockButton}
              </Button>
              <p className="text-xs opacity-60">
                {COPY.remote.freshQrHelp}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (state.phase === PHASE_SETUP) {
    return (
      <main className="min-h-screen flex flex-col bg-slate-950 text-slate-100" data-testid="remote-setup">
        <header className="p-6 text-center">
          <div className="text-xs uppercase tracking-wide opacity-60 mb-1">{COPY.remote.pairedAsLabel}</div>
          <div className="text-2xl font-semibold">{speaker.name}</div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
          <div className="text-sm opacity-70">{slides.length} {COPY.remote.slidesReady}</div>
          <div className="text-base opacity-80 max-w-sm">
            {COPY.remote.setupReadyBody}
          </div>
          {transportError ? (
            <Alert
              variant="destructive"
              className="max-w-sm border-rose-500/40 bg-rose-500/10 text-rose-200"
              aria-live="polite"
            >
              <AlertDescription>{transportError}</AlertDescription>
            </Alert>
          ) : null}
          <Button
            type="button"
            onClick={() => void beginPresentation()}
            data-testid="begin-presentation"
            className="mt-4 h-auto w-full max-w-sm py-6 rounded-xl bg-emerald-600 active:bg-emerald-500 text-xl font-semibold"
          >
            {COPY.remote.beginButton}
          </Button>
          <Button
            type="button"
            variant="link"
            onClick={clearPresenterToken}
            className="text-sm text-slate-300 opacity-70 underline underline-offset-4"
          >
            {COPY.remote.repairButton}
          </Button>
        </div>
      </main>
    );
  }

  const slide = slides[state.index];
  const next = slides[state.index + 1];
  const myNote = slide?.notes?.[speaker.id] || "";
  const otherNote = otherSpeaker ? slide?.notes?.[otherSpeaker.id] || "" : "";
  const currentSlideSpeaker = speakers.find((item) => item.id === slide?.speaker);

  return (
    <main className="min-h-screen flex flex-col bg-slate-950 text-slate-100" data-testid="remote-live">
      <header className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide opacity-60">
            <span data-testid="remote-counter">
            {COPY.remote.slideLabel} {state.index + 1} / {slides.length}
            </span>
          </div>
          <div className="text-base font-semibold">{slide?.title}</div>
        </div>
        {currentSlideSpeaker ? (
          <Badge
            className={`text-xs px-2 py-1 rounded-full ${
              currentSlideSpeaker.id === speaker.id
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-slate-700/40 text-slate-300"
            }`}
          >
            {currentSlideSpeaker.name} {COPY.remote.speakingSuffix}
          </Badge>
        ) : null}
      </header>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {transportError ? (
          <Alert
            variant="destructive"
            className="border-rose-500/40 bg-rose-500/10 text-rose-200"
            aria-live="polite"
          >
            <AlertDescription>{transportError}</AlertDescription>
          </Alert>
        ) : null}
        <section>
          <div className="text-xs uppercase tracking-wide opacity-60 mb-1">{COPY.remote.yourNotesLabel}</div>
          <div className="text-xl sm:text-2xl leading-snug whitespace-pre-wrap max-w-prose">
            {myNote || <span className="text-slate-500 italic">{COPY.remote.emptyCurrentNotes}</span>}
          </div>
        </section>

        {otherSpeaker ? (
          <section>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOtherExpanded((value) => !value)}
              className="w-full flex items-center justify-between text-xs uppercase tracking-wide opacity-60 py-2"
              aria-expanded={otherExpanded}
            >
              <span>{otherSpeaker.name}'s notes</span>
              <span aria-hidden="true">{otherExpanded ? "▾" : "▸"}</span>
            </Button>
            {otherExpanded ? (
              <div className="text-sm leading-relaxed whitespace-pre-wrap opacity-80">
                {otherNote || <span className="text-slate-500 italic">{COPY.remote.emptyOtherNotes}</span>}
              </div>
            ) : null}
          </section>
        ) : null}

        {next ? (
          <section className="pt-4 border-t border-slate-800 text-sm text-slate-300">
            {COPY.remote.upNextLabel}: {next.title}
          </section>
        ) : null}
      </div>

      <footer className="p-3 border-t border-slate-800 grid grid-cols-2 gap-3 bg-slate-900 sticky bottom-0">
        <Button
          type="button"
          onClick={() => void sendControl("prev")}
          data-testid="remote-prev"
          className="h-auto py-5 rounded-lg bg-slate-800 active:bg-slate-700 text-lg"
        >
          {COPY.remote.prevButton}
        </Button>
        <Button
          type="button"
          onClick={() => void sendControl("next")}
          data-testid="remote-next"
          className="h-auto py-5 rounded-lg bg-indigo-600 active:bg-indigo-500 text-lg"
        >
          {COPY.remote.nextButton}
        </Button>
      </footer>
    </main>
  );
}
