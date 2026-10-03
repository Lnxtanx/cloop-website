import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { AvatarFace, AvatarLanguage } from "@/lib/api/avatar";

export type AvatarSettings = {
  faceId: string;
  languages: string[];
  greeting: string;
  context: string;
  testMode: boolean;
};

type AvatarControlsProps = {
  faces: AvatarFace[];
  languages: AvatarLanguage[];
  settings: AvatarSettings;
  onChange: (next: AvatarSettings) => void;
  onStart: () => void;
  onStop: () => void;
  live: boolean;
  busy: boolean;
  disabled: boolean;
};

export function AvatarControls({
  faces,
  languages,
  settings,
  onChange,
  onStart,
  onStop,
  live,
  busy,
  disabled,
}: AvatarControlsProps) {
  const toggleLanguage = (code: string) => {
    const active = settings.languages.includes(code);
    const next = active
      ? settings.languages.filter((c) => c !== code)
      : [...settings.languages, code];

    // Never let the student deselect everything.
    if (next.length === 0) return;

    onChange({ ...settings, languages: next });
  };

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <Label htmlFor="avatar-face">Avatar</Label>
        <Select
          value={settings.faceId}
          disabled={live}
          onValueChange={(value) => onChange({ ...settings, faceId: value })}
        >
          <SelectTrigger id="avatar-face">
            <SelectValue placeholder="Pick an avatar" />
          </SelectTrigger>
          <SelectContent>
            {faces.map((face) => (
              <SelectItem key={face.id} value={face.id}>
                {face.name} · {face.note}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-500">
          Locked while a session is live. Indian voices are the first three.
        </p>
      </section>

      <section className="space-y-2">
        <Label>Languages</Label>
        <p className="text-xs text-slate-500">
          The first language you pick is the one the tutor opens in, and it decides the
          voice. The tutor switches by itself when you change language.
        </p>
        <div className="flex flex-wrap gap-2">
          {languages.map((language) => {
            const index = settings.languages.indexOf(language.code);
            const selected = index >= 0;

            return (
              <button
                key={language.code}
                type="button"
                disabled={live}
                onClick={() => toggleLanguage(language.code)}
                title={selected ? `Opens in ${language.label}` : language.label}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  selected
                    ? "border-violet-500 bg-violet-50 text-violet-900"
                    : "border-slate-200 bg-white text-slate-700 hover:border-violet-300",
                )}
              >
                <span className="text-sm leading-none">{language.native}</span>
                <span className="text-slate-500">{language.label}</span>
                {selected && index === 0 && (
                  <span className="rounded-full bg-violet-500 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    start
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-2">
        <Label htmlFor="avatar-greeting">Opening line</Label>
        <Textarea
          id="avatar-greeting"
          rows={2}
          disabled={live}
          value={settings.greeting}
          placeholder="Namaste! Main Cloop hoon. Aaj hum Force ke baare mein baat karenge."
          onChange={(event) => onChange({ ...settings, greeting: event.target.value })}
        />
        <p className="text-xs text-slate-500">Spoken word for word once you join.</p>
      </section>

      <section className="space-y-2">
        <Label htmlFor="avatar-context">What to work on</Label>
        <Textarea
          id="avatar-context"
          rows={3}
          disabled={live}
          value={settings.context}
          placeholder="Class 9 Physics — Force chapter. The student mixes up force with acceleration."
          onChange={(event) => onChange({ ...settings, context: event.target.value })}
        />
      </section>

      <section className="space-y-3 border-t border-slate-200 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="avatar-testmode">Test mode</Label>
            <p className="text-xs text-slate-500">
              Creates the conversation without the tutor joining. Costs 0 minutes.
            </p>
          </div>
          <Switch
            id="avatar-testmode"
            checked={settings.testMode}
            disabled={live}
            onCheckedChange={(checked) => onChange({ ...settings, testMode: checked })}
          />
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={onStart} disabled={busy || live || disabled}>
            {busy ? "Connecting…" : "Start session"}
          </Button>
          <Button variant="outline" onClick={onStop} disabled={!live && !busy}>
            End session
          </Button>
        </div>
      </section>
    </div>
  );
}