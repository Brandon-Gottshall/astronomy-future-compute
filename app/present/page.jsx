import { headers } from "next/headers";
import PresentClient from "../../components/PresentClient";
import { getPresentationScopeFromHeaders } from "../../lib/presentationChannel.js";
import { createPresentationSession } from "../../lib/presentationServer.js";

export default function PresentPage() {
  try {
    const scope = getPresentationScopeFromHeaders(headers());
    const initialSession = createPresentationSession(scope);
    return <PresentClient initialSession={initialSession} />;
  } catch (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-3">
          <h1 className="text-2xl font-semibold">Presentation setup failed</h1>
          <p className="opacity-80">
            The stage session could not be created. Check `PRESENTATION_TOKEN_SECRET` and try
            again.
          </p>
          <p className="text-sm opacity-60">Error: {error?.code || "session-create-failed"}</p>
        </div>
      </main>
    );
  }
}
