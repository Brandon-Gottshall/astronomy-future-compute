"use client";

import { useEffect, useState } from "react";

export function useSectionObserver(dispatch, sections) {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting)
            dispatch({ type: "SET_ACTIVE_SECTION", value: e.target.id });
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections, dispatch]);
}

export function useQrDataUrl(url) {
  const [dataUrl, setDataUrl] = useState(null);
  useEffect(() => {
    if (!url) return;
    (async () => {
      const QR = (await import("qrcode")).default;
      const result = await QR.toDataURL(url, {
        width: 200,
        margin: 1,
        color: { dark: "#e2e8f0", light: "#00000000" },
      });
      setDataUrl(result);
    })();
  }, [url]);
  return dataUrl;
}

export function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    function handler() {
      const s = window.scrollY;
      const d = document.documentElement.scrollHeight - window.innerHeight;
      setP(d > 0 ? Math.min((s / d) * 100, 100) : 0);
    }
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return p;
}

export function useFadeIn() {
  useEffect(() => {
    const t = setTimeout(() => {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("visible");
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      document.querySelectorAll(".fade-in").forEach((el) => obs.observe(el));
    }, 120);
    return () => clearTimeout(t);
  }, []);
}

export function useDraftMode() {
  const [draft, setDraft] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const v = (params.get("draft") || "").toLowerCase();
    setDraft(v === "1" || v === "true");
  }, []);
  return draft;
}
