"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  CheckCircle2,
  Copy,
  ExternalLink,
  LockKeyhole,
  RefreshCw,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { supabase } from "@/lib/supabase/client";

const reactionLabels = {
  3: { emoji: "😍", label: "Suka" },
  2: { emoji: "🙂", label: "Boleh" },
  1: { emoji: "😐", label: "Ikut saja" },
  0: { emoji: "🙅", label: "Tak boleh" },
};

export default function ManageDashboardPage() {
  const params = useParams();
  const manageToken = params.manageToken;

  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDashboard({ refresh = false } = {}) {
    if (!manageToken || typeof manageToken !== "string") {
      setErrorMessage("Pautan urus ini tidak lengkap.");
      setIsLoading(false);
      return;
    }

    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setErrorMessage("");

    const { data, error } = await supabase.rpc("get_manage_dashboard", {
      p_manage_token: manageToken,
    });

    if (error) {
      console.error("Unable to load organizer dashboard:", error);
      setErrorMessage("Dashboard tidak dapat dimuatkan. Cuba sekali lagi.");
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (!data) {
      setDashboard(null);
      setErrorMessage("Pilihan ini tidak ditemui atau pautan urus tidak sah.");
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    setDashboard(data);
    setIsLoading(false);
    setIsRefreshing(false);
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      loadDashboard();
    });

    return () => window.cancelAnimationFrame(frame);
    // loadDashboard intentionally runs again only when manageToken changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manageToken]);

  async function copyParticipantLink() {
    if (!dashboard?.publicToken) {
      return;
    }

    const participantLink = `${window.location.origin}/p/${dashboard.publicToken}`;

    try {
      await navigator.clipboard.writeText(participantLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setErrorMessage("Pautan tidak dapat disalin. Cuba salin secara manual.");
    }
  }

  async function closeResponses() {
    if (!dashboard || dashboard.status !== "open" || isClosing) {
      return;
    }

    const shouldClose = window.confirm(
      "Tutup respons untuk pilihan ini? Peserta tidak lagi boleh menghantar jawapan baharu.",
    );

    if (!shouldClose) {
      return;
    }

    setIsClosing(true);
    setErrorMessage("");

    const { data, error } = await supabase.rpc("close_decision_responses", {
      p_manage_token: manageToken,
    });

    if (error) {
      console.error("Unable to close responses:", error);
      setErrorMessage("Respons belum berjaya ditutup. Cuba sekali lagi.");
      setIsClosing(false);
      return;
    }

    if (!data || data.status !== "closed") {
      setErrorMessage("Respons pangkalan data tidak lengkap. Cuba sekali lagi.");
      setIsClosing(false);
      return;
    }

    await loadDashboard({ refresh: true });
    setIsClosing(false);
  }

  const participantLink = dashboard?.publicToken
    ? `/p/${dashboard.publicToken}`
    : "/";
  const winner = dashboard?.participantCount > 0 ? dashboard.options[0] : null;

  return (
    <div className="app-background min-h-screen">
      <AppHeader />

      <main className="mx-auto w-full max-w-5xl px-5 pb-16 pt-5 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
        <Link
          href="/"
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl px-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" size={18} />
          Halaman utama
        </Link>

        {isLoading && (
          <section className="mt-7 sm:mt-10" aria-label="Memuatkan dashboard">
            <div className="h-4 w-32 animate-pulse rounded-full bg-muted" />
            <div className="mt-4 h-10 w-3/5 animate-pulse rounded-xl bg-muted" />
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              <div className="h-40 animate-pulse rounded-3xl bg-muted lg:col-span-2" />
              <div className="h-40 animate-pulse rounded-3xl bg-muted" />
            </div>
          </section>
        )}

        {!isLoading && errorMessage && !dashboard && (
          <section className="mt-7 sm:mt-10">
            <div className="glass-panel rounded-3xl p-6 text-center sm:p-8">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertCircle aria-hidden="true" size={26} />
              </span>
              <h1 className="mt-5 text-2xl font-bold">Dashboard tidak tersedia</h1>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                {errorMessage}
              </p>
            </div>
          </section>
        )}

        {!isLoading && dashboard && (
          <section className="mt-7 sm:mt-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-primary">
                  Dashboard organizer
                </p>
                <h1 className="mt-3 break-words text-3xl font-bold leading-tight tracking-[-0.025em] sm:text-4xl">
                  {dashboard.question}
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">
                  Disediakan oleh {dashboard.organizerName}
                </p>
              </div>

              <button
                type="button"
                disabled={isRefreshing}
                className="focus-ring inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-card/70 px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:cursor-wait disabled:opacity-60"
                onClick={() => loadDashboard({ refresh: true })}
              >
                <RefreshCw
                  aria-hidden="true"
                  className={isRefreshing ? "animate-spin" : ""}
                  size={17}
                />
                {isRefreshing ? "Memuat semula..." : "Muat semula"}
              </button>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article className="glass-panel rounded-3xl p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                    <Users aria-hidden="true" size={20} />
                  </span>
                  <div>
                    <p className="text-sm text-muted-foreground">Jumlah peserta</p>
                    <p className="text-2xl font-bold">{dashboard.participantCount}</p>
                  </div>
                </div>
              </article>

              <article className="glass-panel rounded-3xl p-5">
                <p className="text-sm text-muted-foreground">Status respons</p>
                <div className="mt-2 flex items-center gap-2">
                  {dashboard.status === "open" ? (
                    <CheckCircle2 className="text-primary" size={20} />
                  ) : (
                    <Ban className="text-warning" size={20} />
                  )}
                  <p className="text-xl font-bold">
                    {dashboard.status === "open" ? "Dibuka" : "Ditutup"}
                  </p>
                </div>
              </article>

              <article className="glass-panel rounded-3xl p-5 sm:col-span-2 lg:col-span-1">
                <p className="text-sm text-muted-foreground">Pilihan teratas</p>
                <p className="mt-2 break-words text-xl font-bold">
                  {winner ? winner.name : "Belum ada respons"}
                </p>
              </article>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
                onClick={copyParticipantLink}
              >
                {copied ? <CheckCircle2 size={17} /> : <Copy size={17} />}
                {copied ? "Pautan disalin" : "Salin pautan peserta"}
              </button>

              <a
                href={participantLink}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card/70 px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                <ExternalLink aria-hidden="true" size={17} />
                Buka halaman peserta
              </a>

              {dashboard.status === "open" && (
                <button
                  type="button"
                  disabled={isClosing}
                  className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-destructive/35 bg-destructive/10 px-4 text-sm font-semibold text-destructive transition-colors hover:bg-destructive hover:text-white disabled:cursor-wait disabled:opacity-60"
                  onClick={closeResponses}
                >
                  <LockKeyhole aria-hidden="true" size={17} />
                  {isClosing ? "Menutup..." : "Tutup respons"}
                </button>
              )}
            </div>

            {errorMessage && (
              <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                {errorMessage}
              </p>
            )}

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <section>
                <div>
                  <p className="text-sm font-semibold text-primary">Keputusan</p>
                  <h2 className="mt-2 text-2xl font-bold">Ranking pilihan</h2>
                </div>

                <div className="mt-4 space-y-4">
                  {dashboard.options.map((option, index) => (
                    <article
                      key={option.id}
                      className="glass-panel rounded-3xl p-5 sm:p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={[
                              "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                              index === 0 && dashboard.participantCount > 0
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground",
                            ].join(" ")}
                          >
                            {index + 1}
                          </span>
                          <h3 className="break-words text-lg font-semibold">
                            {option.name}
                          </h3>
                        </div>
                        <p className="shrink-0 text-2xl font-bold">
                          {option.consensusScore}%
                        </p>
                      </div>

                      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-300"
                          style={{ width: `${option.consensusScore}%` }}
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl bg-background/60 p-3">
                          <p className="text-muted-foreground">Respons</p>
                          <p className="mt-1 font-bold">{option.responseCount}</p>
                        </div>
                        <div className="rounded-2xl bg-background/60 p-3">
                          <p className="text-muted-foreground">Tak boleh</p>
                          <p
                            className={[
                              "mt-1 font-bold",
                              option.rejectionCount > 0 ? "text-destructive" : "",
                            ].join(" ")}
                          >
                            {option.rejectionCount} ({option.rejectionRate}%)
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section>
                <div>
                  <p className="text-sm font-semibold text-primary">Peserta</p>
                  <h2 className="mt-2 text-2xl font-bold">Respons individu</h2>
                </div>

                <div className="mt-4 space-y-4">
                  {dashboard.participants.length === 0 ? (
                    <div className="glass-panel rounded-3xl p-6 text-center">
                      <p className="font-semibold">Belum ada respons</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Kongsi pautan peserta untuk mula menerima jawapan.
                      </p>
                    </div>
                  ) : (
                    dashboard.participants.map((participant) => (
                      <article
                        key={participant.id}
                        className="glass-panel rounded-3xl p-5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                            {participant.name.trim().charAt(0).toUpperCase()}
                          </span>
                          <h3 className="font-semibold">{participant.name}</h3>
                        </div>

                        <ul className="mt-4 space-y-2">
                          {participant.responses.map((response) => {
                            const reaction = reactionLabels[response.score];

                            return (
                              <li
                                key={response.optionId}
                                className="flex items-center justify-between gap-3 rounded-2xl bg-background/60 p-3 text-sm"
                              >
                                <span className="min-w-0 break-words font-medium">
                                  {response.optionName}
                                </span>
                                <span className="shrink-0 text-muted-foreground">
                                  {reaction.emoji} {reaction.label}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
