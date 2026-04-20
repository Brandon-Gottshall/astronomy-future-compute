import { createPresenterToken, verifyPairToken } from "../../../../lib/presentationAuth.js";
import { getPresentationScopeFromRequest } from "../../../../lib/presentationChannel.js";
import { isKnownSpeakerId } from "../../../../lib/presentationServer.js";
import { isValidPin } from "../../../../lib/session.js";

export const runtime = "nodejs";

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (
    !body ||
    typeof body.sessionId !== "string" ||
    typeof body.speakerId !== "string" ||
    typeof body.pairToken !== "string" ||
    typeof body.pin !== "string"
  ) {
    return Response.json({ ok: false, error: "bad-request" }, { status: 400 });
  }
  if (!isKnownSpeakerId(body.speakerId)) {
    return Response.json({ ok: false, error: "unknown-speaker" }, { status: 400 });
  }
  if (!isValidPin(body.pin)) {
    return Response.json({ ok: false, error: "bad-pin" }, { status: 400 });
  }
  const scope = getPresentationScopeFromRequest(req);
  const verification = verifyPairToken({
    sessionId: body.sessionId,
    speakerId: body.speakerId,
    pairToken: body.pairToken,
    pin: body.pin,
    scope,
  });
  if (!verification.ok) {
    return Response.json({ ok: false, error: verification.error }, { status: 401 });
  }
  try {
    return Response.json({
      ok: true,
      presenterToken: createPresenterToken({
        sessionId: body.sessionId,
        speakerId: body.speakerId,
        scope,
      }),
    });
  } catch (error) {
    const status = error?.code === "presentation-secret-missing" ? 503 : 500;
    return Response.json({ ok: false, error: error?.code || "pair-failed" }, { status });
  }
}
