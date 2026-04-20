"use client";
import { useEffect, useReducer, useRef, useCallback } from "react";
import Pusher from "pusher-js";
import {
  CHANNEL_PREFIX,
  EVENT_STATE_CHANGED,
  EVENT_REMOTE_HEARTBEAT,
  EVENT_CONTROL,
  isAuthorizedControl,
} from "./session.js";
import { slideReducer, INITIAL_STATE } from "./slides.js";

async function post(sessionId, event, payload) {
  try {
    await fetch("/api/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session: sessionId, event, payload }),
    });
  } catch (e) {
    /* best-effort */
  }
}

// role: "stage" | "remote" | "follow"
export function useSession({ sessionId, role, pin, as, total }) {
  const [state, dispatch] = useReducer(slideReducer, { ...INITIAL_STATE, total });
  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  const expectedPinRef = useRef(pin);
  const pairedRemotesRef = useRef(new Map());

  useEffect(() => {
    expectedPinRef.current = pin;
  }, [pin]);

  useEffect(() => {
    dispatch({ type: "setTotal", total });
  }, [total]);

  useEffect(() => {
    if (!sessionId) return undefined;
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key) {
      console.warn("NEXT_PUBLIC_PUSHER_KEY missing; presentation realtime is offline");
      return undefined;
    }
    const pusher = new Pusher(key, { cluster });
    const channel = pusher.subscribe(`${CHANNEL_PREFIX}${sessionId}`);
    pusherRef.current = pusher;
    channelRef.current = channel;

    channel.bind(EVENT_STATE_CHANGED, (msg) => {
      if (role === "stage") return;
      if (msg && typeof msg.index === "number" && typeof msg.phase === "string") {
        dispatch({ type: "syncFromStage", phase: msg.phase, index: msg.index });
      }
    });

    channel.bind(EVENT_REMOTE_HEARTBEAT, (msg) => {
      if (role !== "stage" || !msg?.as) return;
      pairedRemotesRef.current.set(msg.as, msg.t || Date.now());
    });

    if (role === "stage") {
      channel.bind(EVENT_CONTROL, (msg) => {
        if (!isAuthorizedControl(msg, { expected: expectedPinRef.current })) return;
        if (msg.action === "begin") dispatch({ type: "beginPresentation" });
        else if (msg.action === "next") dispatch({ type: "next" });
        else if (msg.action === "prev") dispatch({ type: "prev" });
        else if (msg.action === "jump" && typeof msg.to === "number") {
          dispatch({ type: "jump", to: msg.to });
        }
      });
    }

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channel.name);
      pusher.disconnect();
    };
  }, [sessionId, role]);

  useEffect(() => {
    if (role !== "stage" || !sessionId) return;
    post(sessionId, EVENT_STATE_CHANGED, { phase: state.phase, index: state.index });
  }, [state.phase, state.index, role, sessionId]);

  const sendControl = useCallback(
    (action, extra = {}) => {
      if (role !== "remote" || !sessionId) return;
      post(sessionId, EVENT_CONTROL, {
        action,
        pin: expectedPinRef.current,
        as,
        ...extra,
      });
    },
    [role, as, sessionId]
  );

  const beginPresentation = useCallback(() => sendControl("begin"), [sendControl]);

  const sendHeartbeat = useCallback(() => {
    if (role !== "remote" || !sessionId) return;
    post(sessionId, EVENT_REMOTE_HEARTBEAT, { as, t: Date.now() });
  }, [role, as, sessionId]);

  return {
    state,
    dispatch,
    sendControl,
    beginPresentation,
    sendHeartbeat,
    pairedRemotes: pairedRemotesRef.current,
  };
}
