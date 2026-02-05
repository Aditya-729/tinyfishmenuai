import Link from "next/link";
import { FocusModeProvider, useFocusMode } from "../hooks/useFocusMode";

function FocusModeToggle() {
  const { focusMode, toggleFocusMode } = useFocusMode();
  return (
    <button
      type="button"
      onClick={toggleFocusMode}
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-200 hover:border-cyan-300/40"
    >
      <span>Focus mode</span>
      <span
        className={`flex h-5 w-9 items-center rounded-full border border-white/10 px-1 transition-colors ${
          focusMode ? "bg-cyan-300/30" : "bg-white/10"
        }`}
      >
        <span
          className={`h-3 w-3 rounded-full bg-white transition-transform ${
            focusMode ? "translate-x-3" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <FocusModeProvider>
      <div className="min-h-screen bg-midnight-900 text-white">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-midnight-900/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/tinyfish-logo.png"
                alt="TinyFish Mino AI"
                width={36}
                height={36}
                className="h-9 w-9 rounded-xl object-contain"
              />
              <span className="text-sm font-semibold tracking-[0.2em] text-cyan-200">
                Research Claim Checker by TinyFish Mino AI
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <FocusModeToggle />
              <Link href="/app" className="text-xs uppercase tracking-[0.2em]">
                Claim checker
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-6 py-6">{children}</main>
      </div>
    </FocusModeProvider>
  );
}
