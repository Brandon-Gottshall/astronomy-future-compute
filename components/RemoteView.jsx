"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "../lib/useSession.js";
import {
  formatPairToken,
  getRemoteStorageKey,
  isValidPin,
  sanitizePairToken,
  PHASE_SETUP,
} from "../lib/session.js";

const PAIR_ERROR_MESSAGES = {
  "pair-token-expired": "That pair token expired. Reveal a new token on the stage and try again.",
  "pair-token-invalid": "That pair token is invalid for this speaker link.",
  "bad-pin": "That PIN is incorrect.",
  "unknown-speaker": "This speaker link is not recognized.",
  "presentation-secret-missing": "Presentation secrets are not configured on this deployment.",
  "network-error": "Network error while pairing this remote.",
};

const TRANSPORT_ERROR_MESSAGES = {
  "expired-token": "This remote session expired. Enter a fresh pair token and PIN.",
  "invalid-token": "This remote session is invalid. Pair again from the stage.",
  "scope-mismatch": "This remote session belongs to another deployment host.",
  "pusher-not-configured": "Pusher is not configured. This remote cannot control the stage.",
  "network-error": "Network error while sending the presentation command.",
};

export default function RemoteView({ slides, speaker, speakers, sessionId }) {
  const storageKey = speaker ? getRemoteStorageKey(sessionId, speaker.id) : null;
  const [presenterToken, setPresenterToken] = useState(null);
  const [pairToken, setPairToken] = useState("");
  const [pin, setPin] = useState("");
  const [pairing, setPairing] = useState(false);
  const [pairError, setPairError] = useState(null);
  const [transportError, setTransportError] = useState(null);
  const [otherExpanded, setOtherExpanded] = useState(speaker?.role === "lead");

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
          "This remote lost control of the stage. Pair it again."
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
          <h1 className="text-2xl font-semibold">Invalid remote link</h1>
          <p className="opacity-80">This QR does not match a valid speaker in the presentation.</p>
        </div>
      </main>
    );
  }

  const pairRemote = async () => {
    setPairing(true);
    setPairError(null);
    setTransportError(null);

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
        pairToken: sanitizePairToken(pairToken),
        pin,
      }),
    });
    const data = await response.json().catch(() => null);
    setPairing(false);
    if (!response.ok || !data?.ok) {
      setPairError(
        PAIR_ERROR_MESSAGES[data?.error] || "Could not pair this remote with the stage."
      );
      return;
    }
    setPresenterToken(data.presenterToken);
    if (storageKey && typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, data.presenterToken);
    }
    setPairToken("");
  };

  if (!presenterToken) {
    return (
      <main className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <header className="p-6 text-center">
          <div className="text-xs uppercase tracking-wide opacity-60 mb-1">Presenter remote</div>
          <div className="text-2xl font-semibold">{speaker.name}</div>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div
            className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-6"
            data-testid="remote-pairing"
            role="form"
          >
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Pair this phone</h1>
              <p className="opacity-80">
                Scan the speaker QR, then enter the short-lived pair token shown on the stage and
                the session PIN.
              </p>
            </div>
            <label className="block space-y-2">
              <span className="text-sm opacity-80">Pair token</span>
              <input
                value={pairToken}
                onChange={(event) => setPairToken(formatPairToken(event.target.value))}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void pairRemote();
                  }
                }}
                data-testid="pair-token-input"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 font-mono tracking-wide outline-none focus:border-indigo-400"
                placeholder="XXXXXX-XXXXXX-XXXXXXXXXX"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck="false"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm opacity-80">Session PIN</span>
              <input
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void pairRemote();
                  }
                }}
                data-testid="session-pin-input"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 font-mono tracking-[0.35em] outline-none focus:border-indigo-400"
                placeholder="1234"
                inputMode="numeric"
              />
            </label>
            {pairError ? <div className="text-sm text-rose-300">{pairError}</div> : null}
            <button
              type="button"
              onClick={() => void pairRemote()}
              disabled={pairing}
              data-testid="pair-remote-button"
              className="w-full rounded-xl bg-indigo-600 py-4 text-lg font-semibold disabled:opacity-60"
            >
              {pairing ? "Pairing…" : "Pair remote"}
            </button>
            <p className="text-xs opacity-60">
              Need a new token? Ask the stage operator to press “Reveal pair token” again.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (state.phase === PHASE_SETUP) {
    return (
      <main className="min-h-screen flex flex-col bg-slate-950 text-slate-100" data-testid="remote-setup">
        <header className="p-6 text-center">
          <div className="text-xs uppercase tracking-wide opacity-60 mb-1">Paired as</div>
          <div className="text-2xl font-semibold">{speaker.name}</div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
          <div className="text-sm opacity-70">{slides.length} slides ready.</div>
          <div className="text-base opacity-80 max-w-sm">
            Tap when you and your co-presenter are ready. The stage and the audience follow-along
            will go live at slide 1.
          </div>
          {transportError ? <div className="max-w-sm text-sm text-rose-300">{transportError}</div> : null}
          <button
            onClick={() => void beginPresentation()}
            data-testid="begin-presentation"
            className="mt-4 w-full max-w-sm py-6 rounded-xl bg-emerald-600 active:bg-emerald-500 text-xl font-semibold"
          >
            Begin presentation
          </button>
          <button
            onClick={clearPresenterToken}
            className="text-sm opacity-70 underline underline-offset-4"
          >
            Re-pair this remote
          </button>
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
            Slide {state.index + 1} / {slides.length}
            </span>
          </div>
          <div className="text-sm font-medium">{slide?.title}</div>
        </div>
        {currentSlideSpeaker ? (
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              currentSlideSpeaker.id === speaker.id
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-slate-700/40 text-slate-300"
            }`}
          >
            {currentSlideSpeaker.name} speaking
          </span>
        ) : null}
      </header>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {transportError ? <div className="text-sm text-rose-300">{transportError}</div> : null}
        <section>
          <div className="text-xs uppercase tracking-wide opacity-60 mb-1">Your notes</div>
          <div className="text-lg leading-relaxed whitespace-pre-wrap">
            {myNote || <span className="opacity-40">(Nothing for this slide.)</span>}
          </div>
        </section>

        {otherSpeaker ? (
          <section>
            <button
              onClick={() => setOtherExpanded((value) => !value)}
              className="w-full flex items-center justify-between text-xs uppercase tracking-wide opacity-60 py-2"
            >
              <span>{otherSpeaker.name}'s notes</span>
              <span>{otherExpanded ? "▾" : "▸"}</span>
            </button>
            {otherExpanded ? (
              <div className="text-sm leading-relaxed whitespace-pre-wrap opacity-80">
                {otherNote || <span className="opacity-40">(Empty)</span>}
              </div>
            ) : null}
          </section>
        ) : null}

        {next ? (
          <section className="pt-4 border-t border-slate-800 text-xs opacity-60">
            Up next: {next.title}
          </section>
        ) : null}
      </div>

      <footer className="p-3 border-t border-slate-800 grid grid-cols-2 gap-3 bg-slate-900 sticky bottom-0">
        <button
          onClick={() => void sendControl("prev")}
          data-testid="remote-prev"
          className="py-5 rounded-lg bg-slate-800 active:bg-slate-700 text-lg"
        >
          ◀︎ Prev
        </button>
        <button
          onClick={() => void sendControl("next")}
          data-testid="remote-next"
          className="py-5 rounded-lg bg-indigo-600 active:bg-indigo-500 text-lg"
        >
          Next ▶︎
        </button>
      </footer>
    </main>
  );
}
