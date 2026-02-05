import clsx from "clsx";

type BadgeProps = {
  label: string;
  tone?: "strong" | "medium" | "weak";
};

export function Badge({ label, tone = "medium" }: BadgeProps) {
  return (
    <span
      className={clsx(
        "rounded-full px-3 py-1 text-xs font-semibold",
        tone === "strong" && "bg-emerald-400/20 text-emerald-200",
        tone === "medium" && "bg-amber-400/20 text-amber-200",
        tone === "weak" && "bg-rose-400/20 text-rose-200",
      )}
    >
      {label}
    </span>
  );
}
