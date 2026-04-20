import { verifyStageToken } from "../../../../lib/presentationAuth.js";
import { getPresentationScopeFromRequest } from "../../../../lib/presentationChannel.js";
import { triggerPresentationEvent } from "../../../../lib/presentationServer.js";
import { EVENT_STATE_CHANGED, PHASE_LIVE, PHASE_SETUP } from "../../../../lib/session.js";

export const runtime = "nodejs";

const VALID_PHASES = new Set([PHASE_SETUP, PHASE_LIVE]);

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (
    !body ||
    typeof body.stageToken !== "string" ||
    typeof body.phase !== "string" ||
    !Number.isInteger(body.index) ||
    body.index < 0
  ) {
    return Response.json({ ok: false, error: "bad-request" }, { status: 400 });
  }
  if (!VALID_PHASES.has(body.phase)) {
    return Response.json({ ok: false, error: "bad-phase" }, { status: 400 });
  }
  const scope = getPresentationScopeFromRequest(req);
  try {
    const stage = verifyStageToken(body.stageToken, { scope });
    const result = await triggerPresentationEvent({
      sessionId: stage.sessionId,
      scope: stage.scope,
      event: EVENT_STATE_CHANGED,
      payload: { phase: body.phase, index: body.index },
    });
    if (!result.ok) {
      return Response.json(result, { status: 503 });
    }
    return Response.json({ ok: true });
  } catch (error) {
    const status =
      error?.code === "expired-token" || error?.code === "invalid-token" || error?.code === "scope-mismatch"
        ? 401
        : error?.code === "presentation-secret-missing"
          ? 503
          : 500;
    return Response.json({ ok: false, error: error?.code || "state-failed" }, { status });
  }
}
