import { headers } from "next/headers";
import PresentClient from "../../components/PresentClient";
import { getPresentationScopeFromHeaders } from "../../lib/presentationChannel.js";
import { createPresentationSession } from "../../lib/presentationServer.js";
import { COPY } from "../../lib/copy.js";

export default async function PresentPage() {
  try {
    const scope = getPresentationScopeFromHeaders(await headers());
    const initialSession = createPresentationSession(scope);
    return <PresentClient initialSession={initialSession} />;
  } catch (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-3">
          <h1 className="text-2xl font-semibold">{COPY.presentation.setupFailedTitle}</h1>
          <p className="opacity-80">
            {COPY.presentation.setupFailedBody}
          </p>
          <p className="text-sm opacity-60">{COPY.presentation.setupFailedErrorLabel}: {error?.code || "session-create-failed"}</p>
        </div>
      </main>
    );
  }
}
