"use client";
import { useEffect, useState } from "react";

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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        gap: "2rem",
        padding: "2rem",
      }}
    >
      {qrDataUrl ? (
        <img
          alt="QR code linking to research atlas"
          src={qrDataUrl}
          width={400}
          height={400}
          style={{ imageRendering: "pixelated" }}
        />
      ) : (
        <div style={{ width: 400, height: 400, background: "rgba(148,163,184,0.05)", borderRadius: "1rem" }} />
      )}
      <p style={{ color: "#94a3b8", fontSize: "1.125rem", textAlign: "center" }}>
        Scan to open the research atlas
      </p>
      {atlasUrl && (
        <a
          href={atlasUrl}
          style={{ color: "#64748b", fontSize: "0.875rem", textDecoration: "none" }}
        >
          {atlasUrl}
        </a>
      )}
    </div>
  );
}
