"use client";

import Link from "next/link";
import { ArrowLeft, Check, FileQuestion, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";

const DRAFT_STORAGE_KEY = "pakatlah-decision-draft";

export default function PreviewDecisionPage() {
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
          href="/new"
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl px-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" size={18} />
          Kembali
        </Link>

        <section className="mt-7 sm:mt-10">
          <p className="text-sm font-semibold text-primary">Semak pilihan</p>

          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.025em] sm:text-4xl">
            Semak sebelum dikongsi
          </h1>

          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            Pastikan soalan dan semua pilihan sudah betul.
          </p>

          {!isReady && (
            <div className="glass-panel mt-7 rounded-3xl p-6 sm:mt-8">
              <div className="h-7 w-2/3 animate-pulse rounded-lg bg-muted" />
              <div className="mt-6 space-y-3">
                <div className="h-14 animate-pulse rounded-2xl bg-muted" />
                <div className="h-14 animate-pulse rounded-2xl bg-muted" />
              </div>
            </div>
          )}

          {isReady && !draft && (
            <div className="glass-panel mt-7 rounded-3xl p-5 sm:mt-8 sm:p-6">
              <div className="flex flex-col items-center px-3 py-10 text-center sm:py-12">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                  <FileQuestion aria-hidden="true" size={26} strokeWidth={2} />
                </span>

                <h2 className="mt-5 text-xl font-semibold">
                  Belum ada pilihan untuk disemak
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Isi soalan dan pilihan dahulu. Selepas itu, kandungan akan
                  dipaparkan di sini.
                </p>

                <Link
                  href="/new"
                  className="focus-ring mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
                >
                  Kembali ke borang
                </Link>
              </div>
            </div>
          )}

          {isReady && draft && (
            <>
              <div className="glass-panel mt-7 rounded-3xl p-5 sm:mt-8 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-primary">Soalan</p>
                    <h2 className="mt-2 text-2xl font-bold leading-snug tracking-[-0.02em]">
                      {draft.question}
                    </h2>
                  </div>

                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check aria-hidden="true" size={18} strokeWidth={2.75} />
                  </span>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-semibold text-muted-foreground">
                    {draft.options.length} pilihan
                  </p>

                  <ol className="mt-3 space-y-3">
                    {draft.options.map((option, index) => (
                      <li
                        key={option.id}
                        className="flex items-center gap-3 rounded-2xl border border-border bg-background/70 p-4"
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                          {index + 1}
                        </span>
                        <span className="min-w-0 break-words font-semibold">
                          {option.name}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Link
                  href="/new"
                  className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card/70 px-5 text-base font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  <Pencil aria-hidden="true" size={17} />
                  Edit
                </Link>

                <Link
                  href="/setup"
                  className="focus-ring inline-flex h-12 items-center justify-center rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
                >
                  Seterusnya
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
