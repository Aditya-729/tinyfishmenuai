import clsx from "clsx";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        "h-4 w-full rounded-full bg-gradient-to-r from-white/5 via-white/20 to-white/5 bg-[length:200%_100%] animate-shimmer",
        className,
      )}
    />
  );
}
