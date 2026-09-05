import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="app-background flex min-h-screen items-center justify-center px-5">
      <section className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xl font-bold tracking-[-0.04em]">
            pakatlah
          </span>

          <ThemeToggle />
        </div>

        <div className="mt-10 space-y-4">
          <p className="text-sm font-semibold text-primary">
            Mula pakat
          </p>

          <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] sm:text-4xl">
            Bila semua kata “mana-mana”, Pakatlah.
          </h1>

          <p className="text-base leading-relaxed text-muted-foreground">
            Cari pilihan yang paling ramai boleh ikut, bukan sekadar yang
            mendapat undi terbanyak.
          </p>
        </div>
      </section>
    </main>
  );
}