"use client";
import { useEffect, useMemo, useState } from "react";
import StageView from "../../components/StageView";
import { COPY } from "../../lib/copy.js";
import { generateSessionId, generatePin } from "../../lib/session.js";

export default function PresentPage() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? sessionStorage.getItem("astro-present") : null;
    if (saved) {
      try {
        setSession(JSON.parse(saved));
        return;
      } catch (e) {}
    }
    const fresh = { id: generateSessionId(), pin: generatePin() };
    sessionStorage.setItem("astro-present", JSON.stringify(fresh));
    setSession(fresh);
  }, []);

  const slides = useMemo(() => COPY.slides || [], []);
  const speakers = useMemo(() => COPY.speakers || [], []);

  if (!session) return null;
  return (
    <StageView
      slides={slides}
      speakers={speakers}
      sessionId={session.id}
      pin={session.pin}
    />
  );
}
