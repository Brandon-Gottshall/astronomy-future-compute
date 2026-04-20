"use client";
import { useEffect, useState } from "react";

function Qr({ speakerId, url, label, paired, pairState, onRevealPairToken }) {
  const [dataUrl, setDataUrl] = useState(null);
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    (async () => {
      const QR = (await import("qrcode")).default;
      const png = await QR.toDataURL(url, { margin: 1, width: 320 });
      if (!cancelled) setDataUrl(png);
    })();
    return () => { cancelled = true; };
  }, [url]);
  const expiresAt = pairState?.expiresAt ? new Date(pairState.expiresAt).getTime() : 0;
  const secondsLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)) : 0;
  const hasActivePairToken = Boolean(pairState?.token) && secondsLeft > 0;
  return (
    <div
      className="text-center rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
      data-testid={`speaker-card-${speakerId}`}
    >
      <div className="mb-2 text-lg font-medium flex items-center justify-center gap-2">
        <span>{label}</span>
        {paired ? (
          <span className="text-xs bg-emerald-500/20 text-emerald-300 rounded-full px-2 py-0.5">
            paired
          </span>
        ) : null}
      </div>
      {dataUrl ? (
        <img
          alt={`Pair ${label}`}
          src={dataUrl}
          width="280"
          height="280"
          className="mx-auto rounded bg-white p-2"
        />
        ) : (
        <div className="h-[280px] w-[280px] mx-auto bg-slate-800 rounded" />
      )}
      <div
        className="mt-2 text-xs opacity-60 break-all max-w-[280px] mx-auto"
        data-testid={`speaker-url-${speakerId}`}
      >
        {url}
      </div>
      <div className="mt-4 space-y-3 text-left">
        <button
          type="button"
          onClick={onRevealPairToken}
          data-testid={`reveal-pair-token-${speakerId}`}
          className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium hover:border-slate-500"
        >
          {hasActivePairToken ? "Refresh pair token" : "Reveal pair token"}
        </button>
        {pairState?.loading ? (
          <div className="text-sm opacity-70">Generating a short-lived pair token…</div>
        ) : null}
        {pairState?.error ? (
          <div className="text-sm text-rose-300">{pairState.error}</div>
        ) : null}
        {hasActivePairToken ? (
          <div
            className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3"
            data-testid={`pair-token-${speakerId}`}
          >
            <div className="text-xs uppercase tracking-wide opacity-70">Pair token</div>
            <div
              className="mt-1 font-mono text-lg tracking-wide"
              data-testid={`pair-token-value-${speakerId}`}
            >
              {pairState.token}
            </div>
            <div className="mt-2 text-xs opacity-70">
              Enter this token and the session PIN on the phone. Expires in {secondsLeft}s.
            </div>
          </div>
        ) : null}
      </div>
    </div>
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
}) {
  const [pairStates, setPairStates] = useState({});
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);
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
          ? "The stage session expired. Reload /present."
          : data?.error === "pusher-not-configured"
            ? "Pusher is not configured for this deployment."
            : "Could not reveal a pair token.";
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
  const urlFor = (speakerId) => {
    const path = speakerPaths?.[speakerId];
    return path ? `${origin}${path}` : "";
  };
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
          <div className="text-sm uppercase tracking-wide opacity-60 mb-2">Pair to begin</div>
          <h1 className="text-3xl font-semibold mb-2">Scan your speaker's QR</h1>
          <p className="opacity-70">
            Scan the public remote QR, then reveal a pair token for that speaker and enter it
            with the session PIN on the phone.
          </p>
        </div>
      ) : null}
      <div className={`grid ${speakers.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-10`}>
        {speakers.map((s) => (
          <Qr
            key={s.id}
            speakerId={s.id}
            url={urlFor(s.id)}
            label={s.name}
            paired={isPaired(s.id)}
            pairState={pairStates[s.id]}
            onRevealPairToken={() => revealPairToken(s.id)}
          />
        ))}
      </div>
      {!compact ? (
        <div className="mt-10 text-center text-sm opacity-60">
          Session PIN: <span className="font-mono" data-testid="session-pin-value">{pin}</span>
          {typeof slideCount === "number" ? (
            <span className="ml-4">{slideCount} slides</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
