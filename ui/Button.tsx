import { ComponentProps } from "react";
import clsx from "clsx";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "ghost";
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200",
        variant === "primary" &&
          "bg-gradient-to-r from-cyan-400/80 via-sky-400/80 to-fuchsia-400/80 text-slate-900 shadow-lg hover:shadow-xl active:scale-95",
        variant === "ghost" &&
          "border border-white/20 bg-white/10 text-white hover:bg-white/20",
        props.disabled && "cursor-not-allowed opacity-60",
        className,
      )}
      {...props}
    />
  );
}
