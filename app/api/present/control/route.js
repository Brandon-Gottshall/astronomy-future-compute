import { verifyPresenterToken } from "../../../../lib/presentationAuth.js";
import { getPresentationScopeFromRequest } from "../../../../lib/presentationChannel.js";
import { triggerPresentationEvent } from "../../../../lib/presentationServer.js";
import { EVENT_CONTROL } from "../../../../lib/session.js";

export const runtime = "nodejs";

const ACTIONS = new Set(["begin", "next", "prev", "jump"]);

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.presenterToken !== "string" || typeof body.action !== "string") {
    return Response.json({ ok: false, error: "bad-request" }, { status: 400 });
  }
  if (!ACTIONS.has(body.action)) {
    return Response.json({ ok: false, error: "bad-action" }, { status: 400 });
  }
  if (
    body.action === "jump" &&
    (!Number.isInteger(body.to) || body.to < 0)
  ) {
    return Response.json({ ok: false, error: "bad-jump-index" }, { status: 400 });
  }
  const scope = getPresentationScopeFromRequest(req);
  try {
    const presenter = verifyPresenterToken(body.presenterToken, { scope });
    const result = await triggerPresentationEvent({
      sessionId: presenter.sessionId,
      scope: presenter.scope,
      event: EVENT_CONTROL,
      payload: {
        action: body.action,
        as: presenter.speakerId,
        ...(body.action === "jump" ? { to: body.to } : {}),
      },
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
    return Response.json({ ok: false, error: error?.code || "control-failed" }, { status });
  }
}
