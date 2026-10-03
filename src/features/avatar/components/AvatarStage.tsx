import { cn } from "@/lib/utils";

type AvatarStageProps = {
  conversationUrl: string | null;
  connecting: boolean;
  faceName?: string;
};

export function AvatarStage({ conversationUrl, connecting, faceName }: AvatarStageProps) {
  if (conversationUrl) {
    return (
      <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-sm">
        <iframe
          className="h-[min(62vh,620px)] w-full border-0"
          src={conversationUrl}
          title={`Cloop AI tutor${faceName ? ` — ${faceName}` : ""}`}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-[min(62vh,620px)] w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <div
          className={cn(
            "h-20 w-20 rounded-full bg-gradient-to-br from-violet-400 to-violet-700 shadow-lg shadow-violet-500/30",
            connecting && "animate-pulse",
          )}
          aria-hidden="true"
        />
        <p className="text-base font-semibold text-slate-800">
          {connecting ? "Connecting to the tutor…" : "Tutor not connected"}
        </p>
        <p className="max-w-sm text-sm text-slate-500">
          {connecting
            ? "Setting up a private conversation. This takes a few seconds."
            : "Choose an avatar and a language, then press Start session."}
        </p>
      </div>
    </div>
  );
}