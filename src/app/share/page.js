"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";

const DRAFT_STORAGE_KEY = "pakatlah-decision-draft";

export default function ShareDecisionPage() {
  const [draft, setDraft] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const savedDraft = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
        const parsedDraft = savedDraft ? JSON.parse(savedDraft) : null;

        if (
          parsedDraft &&
          typeof parsedDraft.question === "string" &&
          typeof parsedDraft.organizerName === "string" &&
          Array.isArray(parsedDraft.options)
        ) {
          setDraft(parsedDraft);
        }
      } catch {
        window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } finally {
        setIsReady(true);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="app-background min-h-screen">
      <AppHeader />

      <main className="mx-auto w-full max-w-2xl px-5 pb-16 pt-5 sm:px-6 sm:pb-20 sm:pt-8">
        <Link
          href="/setup"
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl px-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" size={18} />
          Kembali
        </Link>

        <section className="mt-7 sm:mt-10">
          <p className="text-sm font-semibold text-primary">Sedia dikongsi</p>

          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.025em] sm:text-4xl">
            Pilihan sudah disediakan
          </h1>

          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            Langkah seterusnya ialah menghasilkan pautan untuk peserta.
          </p>

          {isReady && draft ? (
            <div className="glass-panel mt-7 rounded-3xl p-5 sm:mt-8 sm:p-6">
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <CheckCircle2 aria-hidden="true" size={22} />
                </span>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">
                    Disediakan oleh {draft.organizerName}
                  </p>
                  <h2 className="mt-2 break-words text-xl font-bold leading-snug">
                    {draft.question}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {draft.options.length} pilihan
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-background/60 p-4">
                <div className="flex items-start gap-3">
                  <Link2
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-muted-foreground"
                    size={19}
                  />
                  <div>
                    <p className="text-sm font-semibold">Pautan peserta</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Pautan sebenar akan tersedia selepas integrasi pangkalan data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : isReady ? (
            <div className="glass-panel mt-7 rounded-3xl p-6 text-center sm:mt-8">
              <p className="font-semibold">Draf tidak ditemui.</p>
              <Link
                href="/new"
                className="focus-ring mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
              >
                Buat pilihan baharu
              </Link>
            </div>
          ) : (
            <div className="glass-panel mt-7 rounded-3xl p-6 sm:mt-8">
              <div className="h-6 w-2/3 animate-pulse rounded-lg bg-muted" />
              <div className="mt-4 h-20 animate-pulse rounded-2xl bg-muted" />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
