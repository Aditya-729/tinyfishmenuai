import clsx from "clsx";
import { ComponentProps } from "react";

type GlassCardProps = ComponentProps<"div">;

export function GlassCard({ className, ...props }: GlassCardProps) {
  return (
    <div
      className={clsx(
        "glass-panel rounded-3xl border border-white/10 p-6",
        className,
      )}
      {...props}
    />
  );
}
