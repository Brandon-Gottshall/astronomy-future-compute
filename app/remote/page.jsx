import RemoteView from "../../components/RemoteView";
import { COPY } from "../../lib/copy.js";
import { parseSessionParams } from "../../lib/session.js";

export default async function RemotePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const speakers = COPY.speakers || [];
  const allowedSpeakers = speakers.map((speaker) => speaker.id);
  const params = parseSessionParams(
    new URLSearchParams(
      Object.entries(resolvedSearchParams || {}).flatMap(([key, value]) =>
        Array.isArray(value) ? value.map((item) => [key, item]) : [[key, value]]
      )
    ),
    allowedSpeakers
  );
  if (!params.s || !params.as) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8 text-center">
        <div className="max-w-sm space-y-3">
          <h1 className="text-2xl font-semibold">{COPY.remote.invalidTitle}</h1>
          <p className="opacity-80">{COPY.remote.invalidPageBody}</p>
        </div>
      </main>
    );
  }
  const speaker = speakers.find((item) => item.id === params.as);
  return (
    <RemoteView
      slides={COPY.slides || []}
      speaker={speaker}
      speakers={speakers}
      sessionId={params.s}
      pairTokenFromUrl={params.pt}
    />
  );
}
