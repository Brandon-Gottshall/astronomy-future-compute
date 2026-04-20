"use client";
import { useEffect, useState } from "react";

function Qr({ url, label, paired }) {
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
  return (
    <div className="text-center">
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
      <div className="mt-2 text-xs opacity-60 break-all max-w-[280px] mx-auto">{url}</div>
    </div>
  );
}

export default function PairPanel({
  origin,
  sessionId,
  pin,
  speakers,
  pairedRemotes,
  compact = false,
  slideCount,
}) {
  const urlFor = (as) => `${origin}/remote?s=${sessionId}&p=${pin}&as=${as}`;
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((v) => v + 1), 2000);
    return () => clearInterval(t);
  }, []);
  const isPaired = (as) => {
    const last = pairedRemotes?.get?.(as);
    return typeof last === "number" && Date.now() - last < 30_000;
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
            Either speaker can tap "Begin presentation" on their remote to start.
          </p>
        </div>
      ) : null}
      <div className={`grid ${speakers.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-10`}>
        {speakers.map((s) => (
          <Qr key={s.id} url={urlFor(s.id)} label={s.name} paired={isPaired(s.id)} />
        ))}
      </div>
      {!compact ? (
        <div className="mt-10 text-center text-sm opacity-60">
          Session PIN: <span className="font-mono">{pin}</span>
          {typeof slideCount === "number" ? (
            <span className="ml-4">{slideCount} slides</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
