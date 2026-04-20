import { createPairToken, verifyStageToken } from "../../../../lib/presentationAuth.js";
import { getPresentationScopeFromRequest } from "../../../../lib/presentationChannel.js";
import { isKnownSpeakerId } from "../../../../lib/presentationServer.js";

export const runtime = "nodejs";

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.stageToken !== "string" || typeof body.speakerId !== "string") {
    return Response.json({ ok: false, error: "bad-request" }, { status: 400 });
  }
  if (!isKnownSpeakerId(body.speakerId)) {
    return Response.json({ ok: false, error: "unknown-speaker" }, { status: 400 });
  }
  const scope = getPresentationScopeFromRequest(req);
  try {
    const session = verifyStageToken(body.stageToken, { scope });
    const pair = createPairToken({
      sessionId: session.sessionId,
      speakerId: body.speakerId,
      pin: session.pin,
      scope,
    });
    return Response.json({ ok: true, ...pair });
  } catch (error) {
    const status =
      error?.code === "expired-token" || error?.code === "invalid-token" || error?.code === "scope-mismatch"
        ? 401
        : error?.code === "presentation-secret-missing"
          ? 503
          : 500;
    return Response.json({ ok: false, error: error?.code || "pair-token-failed" }, { status });
  }
}
