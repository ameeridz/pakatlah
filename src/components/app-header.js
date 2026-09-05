import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-3 sm:px-6 sm:pt-4">
      <div className="glass-panel mx-auto flex h-14 w-full max-w-6xl items-center justify-between rounded-2xl px-4 sm:h-16 sm:px-5">
        <Link
          href="/"
          className="focus-ring rounded-lg text-lg font-bold tracking-[-0.04em] sm:text-xl"
        >
          pakatlah
        </Link>

        <ThemeToggle />
      </div>
    </header>
  );
}
