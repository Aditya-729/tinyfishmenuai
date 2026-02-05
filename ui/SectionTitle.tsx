type SectionTitleProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="space-y-3 text-left">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
        {eyebrow}
      </p>
      <h2 className="font-[var(--font-space)] text-3xl font-semibold text-white md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-xl text-sm text-slate-300 md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
