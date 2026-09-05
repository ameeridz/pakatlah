import Link from "next/link";
import { ArrowRight, Check, MessageCircle, Users } from "lucide-react";
import { AppHeader } from "@/components/app-header";

const previewOptions = [
  {
    name: "Tomyam Kak Mah",
    score: "86%",
    status: "Paling sekata",
  },
  {
    name: "Nasi Kandar",
    score: "71%",
    status: "Ramai boleh ikut",
  },
  {
    name: "Food Court",
    score: "64%",
    status: "Masih dipertimbang",
  },
];

export default function Home() {
  return (
    <div className="app-background min-h-screen overflow-x-hidden">
      <AppHeader />

      <main className="mx-auto w-full max-w-6xl px-5 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 md:pt-16 lg:px-8 lg:pb-24 lg:pt-20">
        <section className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-sm font-semibold text-primary shadow-sm backdrop-blur">
              <MessageCircle aria-hidden="true" size={16} />
              Bincang kurang, pakat cepat
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-6xl">
              Bila semua kata
              <span className="block text-primary">“mana-mana”,</span>
              Pakatlah.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Cari pilihan yang paling ramai boleh ikut, bukan sekadar yang
              mendapat undi terbanyak.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/new"
                className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground shadow-sm transition duration-200 hover:bg-primary-hover active:scale-[0.98]"
              >
                Mula Pakat
                <ArrowRight aria-hidden="true" size={18} />
              </Link>

              <a
                href="#cara-ia-berfungsi"
                className="focus-ring inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card/70 px-5 text-base font-semibold text-foreground transition duration-200 hover:bg-secondary hover:text-secondary-foreground active:scale-[0.98]"
              >
                Tengok cara dia jalan
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Check aria-hidden="true" className="text-primary" size={16} />
                Tak perlu daftar
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check aria-hidden="true" className="text-primary" size={16} />
                Mesra semua device
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check aria-hidden="true" className="text-primary" size={16} />
                Share terus dengan geng
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:justify-self-end">
            <div
              aria-hidden="true"
              className="absolute -left-10 top-8 size-32 rounded-full bg-primary/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-10 right-0 size-40 rounded-full bg-warning/10 blur-3xl"
            />

            <div className="glass-panel relative rounded-3xl p-4 sm:p-5">
              <div className="rounded-2xl border border-border bg-card/85 p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      Keputusan sementara
                    </p>
                    <h2 className="mt-2 text-xl font-bold tracking-[-0.02em] sm:text-2xl">
                      Nak makan dekat mana malam ni?
                    </h2>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
                    <Users aria-hidden="true" size={14} />
                    8 jawab
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {previewOptions.map((option, index) => (
                    <div
                      key={option.name}
                      className={[
                        "rounded-2xl border p-4 transition",
                        index === 0
                          ? "border-primary/40 bg-secondary/80"
                          : "border-border bg-background/60",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {index === 0 && (
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Check aria-hidden="true" size={14} strokeWidth={3} />
                              </span>
                            )}
                            <p className="truncate font-semibold">{option.name}</p>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {option.status}
                          </p>
                        </div>

                        <p className="shrink-0 text-xl font-bold tracking-tight">
                          {option.score}
                        </p>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={[
                            "h-full rounded-full",
                            index === 0 ? "bg-primary" : "bg-muted-foreground/35",
                          ].join(" ")}
                          style={{ width: option.score }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Tomyam Kak Mah paling ramai boleh ikut.
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Persetujuan paling tinggi dengan respons “Tak boleh” paling
                    rendah.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="cara-ia-berfungsi"
          className="scroll-mt-28 pt-24 sm:pt-28"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-primary">Mudah saja</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
              Daripada “mana-mana” kepada keputusan.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Buat pilihan, share dengan geng, dan lihat mana yang paling sekata.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Buat pilihan",
                description:
                  "Tulis soalan dan masukkan pilihan yang geng kau boleh pertimbangkan.",
              },
              {
                number: "02",
                title: "Share dengan geng",
                description:
                  "Semua orang beri reaksi kepada setiap pilihan tanpa perlu daftar.",
              },
              {
                number: "03",
                title: "Terus pakat",
                description:
                  "Pakatlah tunjuk pilihan yang paling ramai boleh terima dan ikut.",
              },
            ].map((step) => (
              <article
                key={step.number}
                className="rounded-2xl border border-border bg-card/75 p-5 shadow-sm backdrop-blur-sm sm:p-6"
              >
                <span className="text-sm font-bold text-primary">
                  {step.number}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
