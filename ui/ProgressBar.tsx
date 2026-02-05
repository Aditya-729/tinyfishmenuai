type ProgressBarProps = {
  value: number;
};

export function ProgressBar({ value }: ProgressBarProps) {
  const percent = Math.round(value * 100);
  return (
    <div className="h-2 w-full rounded-full bg-white/10">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400 transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
