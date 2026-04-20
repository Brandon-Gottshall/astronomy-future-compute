import Pusher from "pusher";
import { COPY } from "./copy.js";
import { createStageToken } from "./presentationAuth.js";
import { getPresentationChannelName } from "./presentationChannel.js";
import { generatePin, generateSessionId } from "./session.js";

let pusherInstance = null;

export function getPresentationSpeakers() {
  return COPY.speakers || [];
}

export function isKnownSpeakerId(speakerId) {
  return getPresentationSpeakers().some((speaker) => speaker.id === speakerId);
}

export function createPresentationSession(scope) {
  const sessionId = generateSessionId();
  const pin = generatePin();
  const stageToken = createStageToken({ sessionId, pin, scope });
  const speakerPaths = Object.fromEntries(
    getPresentationSpeakers().map((speaker) => [
      speaker.id,
      `/remote?s=${encodeURIComponent(sessionId)}&as=${encodeURIComponent(speaker.id)}`,
    ])
  );
  return {
    sessionId,
    pin,
    stageToken,
    followPath: `/follow?s=${encodeURIComponent(sessionId)}`,
    speakerPaths,
  };
}

export function getPusher() {
  if (pusherInstance) return pusherInstance;
  const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, NEXT_PUBLIC_PUSHER_CLUSTER } = process.env;
  if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !NEXT_PUBLIC_PUSHER_CLUSTER) {
    return null;
  }
  pusherInstance = new Pusher({
    appId: PUSHER_APP_ID,
    key: PUSHER_KEY,
    secret: PUSHER_SECRET,
    cluster: NEXT_PUBLIC_PUSHER_CLUSTER,
    useTLS: true,
  });
  return pusherInstance;
}

export async function triggerPresentationEvent({ sessionId, scope, event, payload }) {
  const pusher = getPusher();
  if (!pusher) {
    return { ok: false, error: "pusher-not-configured" };
  }
  await pusher.trigger(getPresentationChannelName(sessionId, scope), event, payload ?? {});
  return { ok: true };
}
