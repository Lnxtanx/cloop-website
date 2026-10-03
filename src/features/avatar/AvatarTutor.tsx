import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Mic, VideoOff } from "lucide-react";
import { AvatarControls, type AvatarSettings } from "./components/AvatarControls";
import { AvatarStage } from "./components/AvatarStage";
import { AvatarStatus } from "./components/AvatarStatus";
import { useAvatarSession } from "./hooks/useAvatarSession";

const DEFAULT_SETTINGS: AvatarSettings = {
  faceId: "",
  languages: ["hi", "en"],
  greeting: "Namaste! Main Cloop hoon. Aaj hum Force ke baare mein baat karenge.",
  context:
    "Class 9 Physics, Force chapter. The student is stuck on Newton's second law and mixes up force with acceleration.",
  testMode: false,
};

export function AvatarTutor() {
  const { phase, config, session, elapsedSeconds, usage, error, start, stop, reset } =
    useAvatarSession();

  const [settings, setSettings] = useState<AvatarSettings>(DEFAULT_SETTINGS);

  // Seed the picker from the server catalogue once it arrives.
  useEffect(() => {
    if (!config) return;
    setSettings((prev) => ({
      ...prev,
      faceId: prev.faceId || config.defaultFaceId,
      languages: prev.languages.length ? prev.languages : config.defaultLanguages,
    }));
  }, [config]);

  // No orphaned Tavus conversation if the student navigates away mid-session.
  useEffect(() => {
    if (phase !== "live") return;
    return () => {
      void stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const live = phase === "live";
  const busy = phase === "connecting" || phase === "ending";
  const activeFace = config?.faces.find((face) => face.id === settings.faceId);

  return (
    <DashboardLayout
      title="AI Avatar"
      mainClassName="flex-1 min-h-0 overflow-y-auto"
    >
      <div className="mx-auto w-full max-w-6xl space-y-4 p-1">
        {config && !config.available && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-semibold">The AI avatar is not available yet.</p>
              <p>{config.reason || "Ask a teacher to switch it on."}</p>
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div className="flex-1 space-y-1">
              <p className="font-semibold">Something went wrong</p>
              <p>{error}</p>
            </div>
            <Button size="sm" variant="outline" onClick={reset}>
              Dismiss
            </Button>
          </div>
        )}

        <AvatarStatus
          phase={phase}
          elapsedSeconds={elapsedSeconds}
          maxCallSeconds={config?.maxCallSeconds ?? 300}
          usage={usage}
        />

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            <AvatarStage
              conversationUrl={session?.conversationUrl ?? null}
              connecting={phase === "connecting"}
              faceName={activeFace?.name}
            />

            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <VideoOff className="h-3.5 w-3.5" aria-hidden="true" />
                Camera is optional — the tutor works audio-only.
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                Interrupt the tutor any time by speaking.
              </span>
            </div>

            {phase === "ended" && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={reset}>
                  Back to setup
                </Button>
              </div>
            )}
          </div>

          <Card>
            <CardContent className="pt-6">
              {config ? (
                <AvatarControls
                  faces={config.faces}
                  languages={config.languages}
                  settings={settings}
                  onChange={setSettings}
                  onStart={() =>
                    void start({
                      faceId: settings.faceId || undefined,
                      languages: settings.languages,
                      greeting: settings.greeting || undefined,
                      context: settings.context || undefined,
                      testMode: settings.testMode,
                    })
                  }
                  onStop={() => void stop()}
                  live={live}
                  busy={busy}
                  disabled={!config.available}
                />
              ) : (
                <p className="py-8 text-center text-sm text-slate-500">
                  Loading avatars…
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AvatarTutor;