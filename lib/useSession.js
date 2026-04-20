"use client";
import { useEffect, useReducer, useRef, useCallback } from "react";
import Pusher from "pusher-js";
import {
  EVENT_STATE_CHANGED,
  EVENT_REMOTE_HEARTBEAT,
  EVENT_CONTROL,
} from "./session.js";
import { getClientPresentationScope, getPresentationChannelName } from "./presentationChannel.js";
import { slideReducer, INITIAL_STATE } from "./slides.js";

async function postJson(path, payload) {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, data };
  } catch (e) {
    return { ok: false, status: 0, data: { error: "network-error" } };
  }
}

// role: "stage" | "remote" | "follow"
export function useSession({
  sessionId,
  role,
  as,
  total,
  stageToken,
  presenterToken,
  onTransportError,
  onStageState,
}) {
  const [state, dispatch] = useReducer(slideReducer, { ...INITIAL_STATE, total });
  const pairedRemotesRef = useRef(new Map());
  const lastTransportErrorRef = useRef(null);

  useEffect(() => {
    dispatch({ type: "setTotal", total });
  }, [total]);

  const reportTransportError = useCallback(
    (error) => {
      if (!error) return;
      const key = `${error.status || 0}:${error.code || error.error || "unknown"}`;
      if (lastTransportErrorRef.current === key) return;
      lastTransportErrorRef.current = key;
      onTransportError?.(error);
    },
    [onTransportError]
  );

  useEffect(() => {
    if (!sessionId) return undefined;
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key) {
      console.warn("NEXT_PUBLIC_PUSHER_KEY missing; presentation realtime is offline");
      return undefined;
    }
    const scope = getClientPresentationScope();
    const pusher = new Pusher(key, { cluster });
    const channel = pusher.subscribe(getPresentationChannelName(sessionId, scope));

    channel.bind(EVENT_STATE_CHANGED, (msg) => {
      if (role === "stage") return;
      if (msg && typeof msg.index === "number" && typeof msg.phase === "string") {
        onStageState?.(msg);
        dispatch({ type: "syncFromStage", phase: msg.phase, index: msg.index });
      }
    });

    channel.bind(EVENT_REMOTE_HEARTBEAT, (msg) => {
      if (role !== "stage" || !msg?.as) return;
      pairedRemotesRef.current.set(msg.as, msg.t || Date.now());
    });

    if (role === "stage") {
      channel.bind(EVENT_CONTROL, (msg) => {
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
  }, [sessionId, role, onStageState]);

  useEffect(() => {
    if (role !== "stage" || !sessionId || !stageToken) return;
    let cancelled = false;
    (async () => {
      const response = await postJson("/api/present/state", {
        stageToken,
        phase: state.phase,
        index: state.index,
      });
      if (!cancelled && !response.ok) {
        reportTransportError({
          status: response.status,
          code: response.data?.error || "state-failed",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stageToken, state.phase, state.index, role, sessionId, reportTransportError]);

  const sendControl = useCallback(
    async (action, extra = {}) => {
      if (role !== "remote" || !sessionId || !presenterToken) {
        return { ok: false, error: "not-paired" };
      }
      const response = await postJson("/api/present/control", {
        presenterToken,
        action,
        ...extra,
      });
      if (!response.ok) {
        reportTransportError({
          status: response.status,
          code: response.data?.error || "control-failed",
        });
      }
      return response.ok ? { ok: true } : { ok: false, error: response.data?.error || "control-failed" };
    },
    [role, presenterToken, sessionId, reportTransportError]
  );

  const beginPresentation = useCallback(() => sendControl("begin"), [sendControl]);

  const sendHeartbeat = useCallback(() => {
    if (role !== "remote" || !sessionId || !presenterToken) {
      return Promise.resolve({ ok: false, error: "not-paired" });
    }
    return postJson("/api/present/heartbeat", { presenterToken }).then((response) => {
      if (!response.ok) {
        reportTransportError({
          status: response.status,
          code: response.data?.error || "heartbeat-failed",
        });
        return { ok: false, error: response.data?.error || "heartbeat-failed" };
      }
      return { ok: true };
    });
  }, [role, presenterToken, sessionId, reportTransportError]);

  return {
    state,
    dispatch,
    sendControl,
    beginPresentation,
    sendHeartbeat,
    pairedRemotes: pairedRemotesRef.current,
  };
}
