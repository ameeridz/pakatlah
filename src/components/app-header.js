import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader() {
  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-[100] px-4 sm:px-6"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)",
        }}
      >
        <div className="glass-header mx-auto flex h-14 w-full max-w-6xl items-center justify-between rounded-2xl px-4 sm:h-16 sm:px-5">
          <Link
            href="/"
            className="focus-ring rounded-lg text-lg font-bold tracking-[-0.04em] sm:text-xl"
          >
            pakatlah
          </Link>

          <ThemeToggle />
        </div>
      </header>

      <div
        aria-hidden="true"
        className="sm:hidden"
        style={{
          height: "calc(env(safe-area-inset-top) + 4.25rem)",
        }}
      />

      <div aria-hidden="true" className="hidden h-20 sm:block" />
    </>
  );
}
