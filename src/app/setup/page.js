"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock3, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";

const DRAFT_STORAGE_KEY = "pakatlah-decision-draft";
const ORGANIZER_NAME_LIMIT = 40;

export default function SetupDecisionPage() {
  const router = useRouter();
  const [organizerName, setOrganizerName] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const savedDraft = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
        const parsedDraft = savedDraft ? JSON.parse(savedDraft) : null;

        if (typeof parsedDraft?.organizerName === "string") {
          setOrganizerName(
            parsedDraft.organizerName.slice(0, ORGANIZER_NAME_LIMIT),
          );
        }
      } catch {
        window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } finally {
        setIsReady(true);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const normalizedOrganizerName = organizerName.trim();
  const isFormValid = normalizedOrganizerName.length > 0;

  function handleSubmit(event) {
    event.preventDefault();

    if (!isFormValid) {
      return;
    }

    try {
      const savedDraft = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
      const currentDraft = savedDraft ? JSON.parse(savedDraft) : {};

      const updatedDraft = {
        ...currentDraft,
        organizerName: normalizedOrganizerName,
        updatedAt: new Date().toISOString(),
      };

      window.sessionStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify(updatedDraft),
      );

      router.push("/share");
    } catch {
      window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }

  return (
    <div className="app-background min-h-screen">
      <AppHeader />

      <main className="mx-auto w-full max-w-2xl px-5 pb-16 pt-5 sm:px-6 sm:pb-20 sm:pt-8">
        <Link
          href="/preview"
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl px-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" size={18} />
          Kembali
        </Link>

        <section className="mt-7 sm:mt-10">
          <p className="text-sm font-semibold text-primary">Tetapan akhir</p>

          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.025em] sm:text-4xl">
            Siapa yang membuat pilihan ini?
          </h1>

          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            Nama ini akan dipaparkan kepada peserta.
          </p>

          <form className="mt-7 sm:mt-8" onSubmit={handleSubmit}>
            <div className="glass-panel rounded-3xl p-5 sm:p-6">
              <label htmlFor="organizer-name" className="text-sm font-semibold">
                Nama organizer
              </label>

              <div className="relative mt-3">
                <UserRound
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={19}
                />

                <input
                  id="organizer-name"
                  name="organizerName"
                  type="text"
                  value={organizerName}
                  maxLength={ORGANIZER_NAME_LIMIT}
                  autoComplete="name"
                  autoFocus
                  placeholder="Contoh: Juan"
                  className="focus-ring h-12 w-full rounded-xl border border-input bg-background/80 pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground"
                  onChange={(event) => setOrganizerName(event.target.value)}
                />
              </div>

              <div className="mt-2 flex justify-end">
                <span className="text-xs tabular-nums text-muted-foreground">
                  {organizerName.length}/{ORGANIZER_NAME_LIMIT}
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-background/60 p-4">
                <div className="flex items-start gap-3">
                  <Clock3
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-muted-foreground"
                    size={19}
                  />

                  <div>
                    <p className="text-sm font-semibold">Tarikh tutup respons</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Tetapan ini boleh ditambah kemudian.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isReady || !isFormValid}
              className="focus-ring mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none sm:ml-auto sm:w-auto"
            >
              Simpan tetapan
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
