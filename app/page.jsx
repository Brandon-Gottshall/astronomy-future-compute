"use client";
import { useEffect, useState } from "react";
import { AtlasApp, LiveApp } from "../components/SiteApp";

function getAppMode() {
  if (typeof window === "undefined") return "live";
  try {
    const params = new URLSearchParams(window.location.search);
    const paramMode = (params.get("mode") || "").toLowerCase();
    if (paramMode === "atlas" || paramMode === "live") return paramMode;
    const hash = (window.location.hash || "").toLowerCase();
    if (hash === "#live") return "live";
  } catch (e) {}
  return "live";
}

export default function Page() {
  const [mode, setMode] = useState(null);
  useEffect(() => {
    setMode(getAppMode());
  }, []);
  if (!mode) return null;
  return mode === "live" ? <LiveApp /> : <AtlasApp />;
}
