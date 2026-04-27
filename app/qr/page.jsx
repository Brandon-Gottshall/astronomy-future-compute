"use client";
import { useEffect, useState } from "react";
import { COPY } from "../../lib/copy.js";

export default function QRPage() {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [atlasUrl, setAtlasUrl] = useState("");

  useEffect(() => {
    const url = window.location.origin + "/?mode=atlas";
    setAtlasUrl(url);
    (async () => {
      const QR = (await import("qrcode")).default;
      const dataUrl = await QR.toDataURL(url, {
        width: 400,
        margin: 2,
        color: { dark: "#e2e8f0", light: "#00000000" },
      });
      setQrDataUrl(dataUrl);
    })();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-900 p-8">
      {qrDataUrl ? (
        <img
          alt={COPY.site.qr.alt}
          src={qrDataUrl}
          width={400}
          height={400}
          className="[image-rendering:pixelated]"
        />
      ) : (
        <div className="size-[400px] rounded-2xl bg-slate-400/5" />
      )}
      <p className="text-center text-lg text-slate-400">
        {COPY.site.qr.prompt}
      </p>
      {atlasUrl && (
        <a
          href={atlasUrl}
          className="text-sm text-slate-500 no-underline"
        >
          {atlasUrl}
        </a>
      )}
    </div>
  );
}
