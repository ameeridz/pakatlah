import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
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
        <div className="glass-header mx-auto flex h-14 w-full max-w-6xl items-center justify-between rounded-2xl px-3 sm:h-16 sm:px-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              href="/"
              aria-label="Pakatlah, halaman utama"
              className="focus-ring flex shrink-0 items-center gap-2 rounded-xl"
            >
              <Image
                src="/icons/icon-192x192.png"
                alt=""
                width={32}
                height={32}
                priority
                className="size-8 rounded-lg"
              />

              <span className="text-base font-bold tracking-[-0.04em] sm:text-xl">
                Pakatlah
              </span>
            </Link>

            <span
              aria-hidden="true"
              className="h-5 w-px shrink-0 bg-border/70"
            />

            <a
              href="https://ridzu.one"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Dibina oleh Ridzjuan, buka ridzu.one dalam tab baru"
              className="focus-ring group flex min-w-0 items-center gap-1 rounded-lg px-0.5 py-1 text-[11px] font-medium text-muted-foreground/55 transition-colors hover:text-muted-foreground sm:px-1 sm:text-sm"
            >
              <span className="truncate">by Ridzjuan</span>

              <ExternalLink
                aria-hidden="true"
                size={12}
                className="hidden shrink-0 opacity-50 transition-opacity group-hover:opacity-80 sm:block"
              />
            </a>
          </div>

          <div className="ml-2 shrink-0">
            <ThemeToggle />
          </div>
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
