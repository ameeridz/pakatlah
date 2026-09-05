"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, CalendarClock, UserRound } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { supabase } from "@/lib/supabase/client";

export default function PublicDecisionPage() {
  const params = useParams();
  const publicToken = params.publicToken;

  const [decision, setDecision] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadDecision() {
      if (!publicToken || typeof publicToken !== "string") {
        if (isActive) {
          setErrorMessage("Pautan ini tidak lengkap.");
          setIsLoading(false);
        }
        return;
      }

      const { data, error } = await supabase.rpc("get_public_decision", {
        p_public_token: publicToken,
      });

      if (!isActive) {
        return;
      }

      if (error) {
        console.error("Unable to load public decision:", error);
        setErrorMessage("Pilihan ini tidak dapat dimuatkan. Cuba sekali lagi.");
        setIsLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage("Pilihan ini tidak ditemui atau pautannya tidak sah.");
        setIsLoading(false);
        return;
      }

      setDecision(data);
      setIsLoading(false);
    }

    loadDecision();

    return () => {
      isActive = false;
    };
  }, [publicToken]);

  const isClosed = decision?.status !== "open";

  return (
    <div className="app-background min-h-screen">
      <AppHeader />

      <main className="mx-auto w-full max-w-2xl px-5 pb-16 pt-5 sm:px-6 sm:pb-20 sm:pt-8">
        <Link
          href="/"
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl px-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" size={18} />
          Halaman utama
        </Link>

        {isLoading && (
          <section className="mt-7 sm:mt-10" aria-label="Memuatkan pilihan">
            <div className="h-4 w-28 animate-pulse rounded-full bg-muted" />
            <div className="mt-4 h-10 w-4/5 animate-pulse rounded-xl bg-muted" />
            <div className="glass-panel mt-7 rounded-3xl p-5 sm:mt-8 sm:p-6">
              <div className="h-5 w-40 animate-pulse rounded-lg bg-muted" />
              <div className="mt-6 space-y-3">
                <div className="h-16 animate-pulse rounded-2xl bg-muted" />
                <div className="h-16 animate-pulse rounded-2xl bg-muted" />
              </div>
            </div>
          </section>
        )}

        {!isLoading && errorMessage && (
          <section className="mt-7 sm:mt-10">
            <div className="glass-panel rounded-3xl p-6 text-center sm:p-8">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertCircle aria-hidden="true" size={26} />
              </span>

              <h1 className="mt-5 text-2xl font-bold tracking-[-0.02em]">
                Pautan tidak dapat dibuka
              </h1>

              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                {errorMessage}
              </p>

              <Link
                href="/"
                className="focus-ring mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
              >
                Ke halaman utama
              </Link>
            </div>
          </section>
        )}

        {!isLoading && decision && (
          <section className="mt-7 sm:mt-10">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-semibold",
                  isClosed
                    ? "bg-warning/10 text-warning"
                    : "bg-primary/10 text-primary",
                ].join(" ")}
              >
                {isClosed ? "Respons ditutup" : "Respons dibuka"}
              </span>
            </div>

            <h1 className="mt-4 break-words text-3xl font-bold leading-tight tracking-[-0.025em] sm:text-4xl">
              {decision.question}
            </h1>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <UserRound aria-hidden="true" size={17} />
                Disediakan oleh {decision.organizerName}
              </span>

              {decision.closesAt && (
                <span className="inline-flex items-center gap-2">
                  <CalendarClock aria-hidden="true" size={17} />
                  Ada tarikh tutup
                </span>
              )}
            </div>

            <div className="glass-panel mt-7 rounded-3xl p-5 sm:mt-8 sm:p-6">
              <div>
                <h2 className="text-lg font-semibold">Pilihan yang tersedia</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Lihat semua pilihan sebelum memberi respons.
                </p>
              </div>

              <ol className="mt-5 space-y-3">
                {decision.options.map((option, index) => (
                  <li
                    key={option.id}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-background/70 p-4"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                      {index + 1}
                    </span>
                    <span className="min-w-0 break-words font-semibold">
                      {option.name}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-5 rounded-2xl border border-border bg-card/70 p-4 text-sm leading-relaxed text-muted-foreground">
              {isClosed
                ? "Respons untuk pilihan ini sudah ditutup."
                : "Langkah seterusnya ialah masukkan nama dan beri respons untuk setiap pilihan."}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
