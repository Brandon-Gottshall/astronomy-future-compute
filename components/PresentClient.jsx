"use client";
import { useEffect, useMemo, useState } from "react";
import StageView from "./StageView";
import { COPY } from "../lib/copy.js";
import { PRESENTATION_STORAGE_KEY } from "../lib/session.js";

function isStoredSession(value) {
  return Boolean(
    value &&
      typeof value.sessionId === "string" &&
      typeof value.pin === "string" &&
      typeof value.stageToken === "string" &&
      typeof value.followPath === "string" &&
      value.speakerPaths &&
      typeof value.speakerPaths === "object"
  );
}

function storageArea(name) {
  if (typeof window === "undefined") return null;
  try {
    return window[name] || null;
  } catch (error) {
    return null;
  }
}

function readStoredSession() {
  const local = storageArea("localStorage");
  const session = storageArea("sessionStorage");
  const stores = [local, session].filter(Boolean);
  for (const store of stores) {
    try {
      const saved = store.getItem(PRESENTATION_STORAGE_KEY);
      if (!saved) continue;
      const parsed = JSON.parse(saved);
      if (isStoredSession(parsed)) {
        return parsed;
      }
    } catch (error) {
      /* ignore stale storage */
    }
  }
  return null;
}

function writeStoredSession(session) {
  const local = storageArea("localStorage");
  const fallback = storageArea("sessionStorage");
  const serialized = JSON.stringify(session);
  try {
    if (local) {
      local.setItem(PRESENTATION_STORAGE_KEY, serialized);
      fallback?.removeItem(PRESENTATION_STORAGE_KEY);
      return;
    }
    fallback?.setItem(PRESENTATION_STORAGE_KEY, serialized);
  } catch (error) {
    try {
      fallback?.setItem(PRESENTATION_STORAGE_KEY, serialized);
    } catch (fallbackError) {
      /* storage unavailable */
    }
  }
}

export default function PresentClient({ initialSession }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = readStoredSession();
    if (saved) {
      setSession(saved);
      writeStoredSession(saved);
      setReady(true);
      return;
    }
    setSession(initialSession);
    writeStoredSession(initialSession);
    setReady(true);
  }, [initialSession]);

  useEffect(() => {
    if (typeof window === "undefined" || !isStoredSession(session)) return;
    writeStoredSession(session);
  }, [session]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onStorage = (event) => {
      if (event.key !== PRESENTATION_STORAGE_KEY || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue);
        if (isStoredSession(parsed)) {
          setResetError(null);
          setSession(parsed);
        }
      } catch (error) {
        /* ignore stale storage */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const slides = useMemo(() => COPY.slides || [], []);
  const speakers = useMemo(() => COPY.speakers || [], []);

  if (!ready || !session) return null;

  const resetSession = async () => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        "Create a new presentation session and PIN? Current remotes and follow links will need to pair again."
      );
      if (!confirmed) return;
    }
    setResetting(true);
    setResetError(null);
    try {
      const response = await fetch("/api/present/session", { method: "POST" });
      const data = await response.json().catch(() => null);
      if (!response.ok || !isStoredSession(data)) {
        throw new Error(data?.error || "session-create-failed");
      }
      setSession(data);
      writeStoredSession(data);
    } catch (error) {
      setResetError(error?.message || "Could not reset the presentation session.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <StageView
      key={session.sessionId}
      slides={slides}
      speakers={speakers}
      session={session}
      onResetSession={resetSession}
      resettingSession={resetting}
      resetSessionError={resetError}
    />
  );
}
