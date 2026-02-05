import { Button } from "../ui/Button";

type UploadPanelProps = {
  text: string;
  onTextChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
  onStop?: () => void;
  running: boolean;
};

export function UploadPanel({
  text,
  onTextChange,
  onFileChange,
  onSubmit,
  onStop,
  running,
}: UploadPanelProps) {
  return (
    <div className="neumorphic-card rounded-3xl border border-white/5 p-4 text-white">
      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200">
          Upload document
        </p>
        <textarea
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          placeholder="Paste a report, blog, or research note..."
          className="h-28 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none focus:border-cyan-300"
        />
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="file"
            accept=".txt,.md,.pdf"
            onChange={(event) =>
              onFileChange(event.target.files?.[0] ?? null)
            }
            className="text-xs text-slate-300"
          />
          <Button onClick={onSubmit} disabled={running}>
            {running ? "Analyzing..." : "Run analysis"}
          </Button>
          {running && onStop ? (
            <button
              type="button"
              onClick={onStop}
              className="text-xs text-rose-200 hover:text-rose-100"
            >
              Stop stream
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
