import { getPresentationScopeFromRequest } from "../../../../lib/presentationChannel.js";
import { createPresentationSession } from "../../../../lib/presentationServer.js";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const scope = getPresentationScopeFromRequest(req);
    return Response.json({
      ok: true,
      ...createPresentationSession(scope),
    });
  } catch (error) {
    const code = error?.code === "presentation-secret-missing" ? 503 : 500;
    return Response.json(
      { ok: false, error: error?.code || "session-create-failed" },
      { status: code }
    );
  }
}
