import Pusher from "pusher";
import { CHANNEL_PREFIX } from "../../../lib/session.js";

export const runtime = "nodejs";

let pusherInstance = null;
function getPusher() {
  if (pusherInstance) return pusherInstance;
  const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, NEXT_PUBLIC_PUSHER_CLUSTER } = process.env;
  if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !NEXT_PUBLIC_PUSHER_CLUSTER) return null;
  pusherInstance = new Pusher({
    appId: PUSHER_APP_ID,
    key: PUSHER_KEY,
    secret: PUSHER_SECRET,
    cluster: NEXT_PUBLIC_PUSHER_CLUSTER,
    useTLS: true,
  });
  return pusherInstance;
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.session !== "string" || typeof body.event !== "string") {
    return Response.json({ ok: false, error: "bad-request" }, { status: 400 });
  }
  const pusher = getPusher();
  if (!pusher) {
    return Response.json({ ok: false, error: "pusher-not-configured" }, { status: 503 });
  }
  await pusher.trigger(`${CHANNEL_PREFIX}${body.session}`, body.event, body.payload ?? {});
  return Response.json({ ok: true });
}
