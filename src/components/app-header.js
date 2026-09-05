import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="glass-panel mx-auto flex h-16 w-full max-w-6xl items-center justify-between rounded-2xl px-4 sm:px-5">
        <Link
          href="/"
          className="focus-ring rounded-lg text-xl font-bold tracking-[-0.04em]"
        >
          pakatlah
        </Link>

        <ThemeToggle />
      </div>
    </header>
  );
}
