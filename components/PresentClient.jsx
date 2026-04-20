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

export default function PresentClient({ initialSession }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem(PRESENTATION_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isStoredSession(parsed)) {
          setSession(parsed);
          setReady(true);
          return;
        }
      } catch (error) {
        /* ignore stale storage */
      }
    }
    setSession(initialSession);
    sessionStorage.setItem(PRESENTATION_STORAGE_KEY, JSON.stringify(initialSession));
    setReady(true);
  }, [initialSession]);

  useEffect(() => {
    if (typeof window === "undefined" || !isStoredSession(session)) return;
    sessionStorage.setItem(PRESENTATION_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const slides = useMemo(() => COPY.slides || [], []);
  const speakers = useMemo(() => COPY.speakers || [], []);

  if (!ready || !session) return null;

  return (
    <StageView
      slides={slides}
      speakers={speakers}
      session={session}
    />
  );
}
