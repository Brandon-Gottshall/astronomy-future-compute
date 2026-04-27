"use client";
import { useEffect, useState } from "react";
import { COPY } from "../lib/copy.js";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

function Qr({ speakerId, tokenUrl, label, paired, pairState, onRevealPairToken }) {
  const [dataUrl, setDataUrl] = useState(null);
  const expiresAt = pairState?.expiresAt ? new Date(pairState.expiresAt).getTime() : 0;
  const secondsLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)) : 0;
  const hasActivePairToken = Boolean(pairState?.token) && secondsLeft > 0;
  const activeUrl = hasActivePairToken ? tokenUrl : "";

  useEffect(() => {
    if (!activeUrl) {
      setDataUrl(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const QR = (await import("qrcode")).default;
      const png = await QR.toDataURL(activeUrl, { margin: 1, width: 320 });
      if (!cancelled) setDataUrl(png);
    })();
    return () => { cancelled = true; };
  }, [activeUrl]);

  return (
    <Card
      className="border-slate-800 bg-slate-900/60 text-center text-slate-100"
      data-testid={`speaker-card-${speakerId}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center justify-center gap-2">
          <span>{label}</span>
          {paired ? (
            <Badge className="text-xs bg-emerald-500/20 text-emerald-300 rounded-full px-2 py-0.5">
              {COPY.stage.pairedBadge}
            </Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {dataUrl ? (
          <img
            alt={`${COPY.stage.pairAltPrefix} ${label}`}
            src={dataUrl}
            width="280"
            height="280"
            className="mx-auto rounded bg-white p-2"
          />
        ) : (
          <div className="h-[280px] w-[280px] mx-auto rounded border border-dashed border-slate-700 bg-slate-950/70 flex items-center justify-center px-6 text-sm opacity-70">
            {COPY.stage.inactiveQrPrompt}
          </div>
        )}
        <div
          className="mt-2 text-xs opacity-60 break-all max-w-[280px] mx-auto"
          data-testid={`speaker-url-${speakerId}`}
        >
          {activeUrl || COPY.stage.inactiveUrlPrompt}
        </div>
        <div className="mt-4 space-y-3 text-left">
          <Button
            type="button"
            onClick={onRevealPairToken}
            data-testid={`reveal-pair-token-${speakerId}`}
            className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium hover:border-slate-500"
          >
            {hasActivePairToken ? COPY.stage.refreshPairTokenButton : COPY.stage.revealPairTokenButton}
          </Button>
          {pairState?.loading ? (
            <div className="text-sm opacity-70" aria-live="polite">{COPY.stage.generatingPairToken}</div>
          ) : null}
          {pairState?.error ? (
            <Alert
              variant="destructive"
              className="border-rose-500/40 bg-rose-500/10 text-rose-200"
              aria-live="polite"
            >
              <AlertDescription>{pairState.error}</AlertDescription>
            </Alert>
          ) : null}
          {hasActivePairToken ? (
            <Alert
              className="border-indigo-500/30 bg-indigo-500/10 text-slate-100"
              data-testid={`pair-token-${speakerId}`}
              role="status"
              aria-live="polite"
            >
              <div className="text-xs uppercase tracking-wide opacity-70">{COPY.stage.qrUnlockedLabel}</div>
              <AlertDescription className="mt-2 text-xs opacity-70">
                {COPY.stage.qrUnlockedBody}
                {" "}{COPY.stage.expiresInPrefix} {secondsLeft}s.
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PairPanel({
  origin,
  speakers,
  speakerPaths,
  stageToken,
  pin,
  pairedRemotes,
  compact = false,
  slideCount,
  onResetSession,
  resettingSession = false,
  resetSessionError = null,
}) {
  const [pairStates, setPairStates] = useState({});
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    setPairStates({});
  }, [stageToken]);
  const revealPairToken = async (speakerId) => {
    setPairStates((current) => ({
      ...current,
      [speakerId]: { ...current[speakerId], loading: true, error: null },
    }));
    const response = await fetch("/api/present/pair-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stageToken, speakerId }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.ok) {
      const error =
        data?.error === "expired-token"
          ? COPY.errors.pairToken["expired-token"]
          : data?.error === "pusher-not-configured"
            ? COPY.errors.pairToken["pusher-not-configured"]
            : COPY.errors.pairToken.fallback;
      setPairStates((current) => ({
        ...current,
        [speakerId]: { ...current[speakerId], loading: false, error },
      }));
      return;
    }
    setPairStates((current) => ({
      ...current,
      [speakerId]: {
        loading: false,
        error: null,
        token: data.pairToken,
        expiresAt: data.expiresAt,
      },
    }));
  };
  const isPaired = (as) => {
    const last = pairedRemotes?.get?.(as);
    return typeof last === "number" && Date.now() - last < 30_000;
  };
  const urlFor = (speakerId, pairToken = null) => {
    const path = speakerPaths?.[speakerId];
    if (!path) return "";
    const url = new URL(path, origin);
    if (pairToken) {
      url.searchParams.set("pt", pairToken);
    }
    return url.toString();
  };

  const pinPanel = (
    <Card className="mb-6 w-full max-w-xl border-indigo-500/30 bg-indigo-500/10 px-5 py-4 text-center text-slate-100">
      <div className="text-xs uppercase tracking-[0.2em] opacity-70">
        {COPY.stage.sessionPinLabel}
      </div>
      <div className="mt-2 font-mono text-4xl font-semibold tracking-[0.4em]" data-testid="session-pin-value">
        {pin}
      </div>
      {typeof slideCount === "number" ? (
        <div className="mt-2 text-sm opacity-70">{slideCount} {COPY.stage.slidesReadySuffix}</div>
      ) : null}
      {onResetSession ? (
        <div className="mt-4 space-y-2">
          <Button
            type="button"
            onClick={onResetSession}
            disabled={resettingSession}
            data-testid="reset-presentation-session"
            className="rounded-lg border border-indigo-300/40 px-3 py-2 text-sm font-medium hover:border-indigo-200 disabled:opacity-60"
          >
            {resettingSession ? COPY.stage.resettingSessionButton : COPY.stage.resetSessionButton}
          </Button>
          {resetSessionError ? (
            <Alert
              variant="destructive"
              className="border-rose-500/40 bg-rose-500/10 text-rose-200"
              aria-live="polite"
            >
              <AlertDescription>{resetSessionError}</AlertDescription>
            </Alert>
          ) : null}
        </div>
      ) : null}
    </Card>
  );

  return (
    <div
      className={
        compact
          ? "w-full"
          : "min-h-screen w-full flex flex-col items-center justify-center p-8"
      }
    >
      {!compact ? (
        <div className="text-center mb-8">
          <div className="text-sm uppercase tracking-wide opacity-60 mb-2">{COPY.stage.pairIntroLabel}</div>
          <h1 className="text-3xl font-semibold mb-2">{COPY.stage.pairIntroTitle}</h1>
          <p className="opacity-70">
            {COPY.stage.pairIntroBody}
          </p>
        </div>
      ) : null}
      {pinPanel}
      <div className={`grid ${speakers.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-10`}>
        {speakers.map((s) => (
          <Qr
            key={s.id}
            speakerId={s.id}
            tokenUrl={urlFor(s.id, pairStates[s.id]?.token)}
            label={s.name}
            paired={isPaired(s.id)}
            pairState={pairStates[s.id]}
            onRevealPairToken={() => revealPairToken(s.id)}
          />
        ))}
      </div>
    </div>
  );
}
