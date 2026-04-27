import FollowView from "../../components/FollowView";
import { COPY } from "../../lib/copy.js";
import { parseSessionParams } from "../../lib/session.js";

export default async function FollowPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const params = parseSessionParams(
    new URLSearchParams(
      Object.entries(resolvedSearchParams || {}).flatMap(([key, value]) =>
        Array.isArray(value) ? value.map((item) => [key, item]) : [[key, value]]
      )
    )
  );
  if (!params.s) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8 text-center">
        <div className="max-w-sm space-y-3">
          <h1 className="text-2xl font-semibold">{COPY.follow.missingTitle}</h1>
          <p className="opacity-80">{COPY.follow.missingBody}</p>
        </div>
      </main>
    );
  }
  return <FollowView slides={COPY.slides || []} sessionId={params.s} />;
}
