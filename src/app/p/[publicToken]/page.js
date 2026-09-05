"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  LoaderCircle,
  Send,
  UserRound,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { supabase } from "@/lib/supabase/client";

const PARTICIPANT_NAME_LIMIT = 40;

const reactions = [
  { score: 3, emoji: "😍", label: "Suka" },
  { score: 2, emoji: "🙂", label: "Boleh" },
  { score: 1, emoji: "😐", label: "Ikut saja" },
  { score: 0, emoji: "🙅", label: "Tak boleh" },
];

export default function PublicDecisionPage() {
  const params = useParams();
  const publicToken = params.publicToken;

  const [decision, setDecision] = useState(null);
  const [participantName, setParticipantName] = useState("");
  const [selectedResponses, setSelectedResponses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
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

  const isFinalized = decision?.status === "finalized";
  const isClosed = decision?.status !== "open";
  const answeredCount = decision
    ? decision.options.filter((option) =>
        Object.hasOwn(selectedResponses, option.id),
      ).length
    : 0;
  const allOptionsAnswered = decision
    ? answeredCount === decision.options.length
    : false;
  const isNameValid = participantName.trim().length > 0;
  const isFormValid = isNameValid && allOptionsAnswered && !isClosed;

  function selectReaction(optionId, score) {
    setSelectedResponses((currentResponses) => ({
      ...currentResponses,
      [optionId]: score,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isFormValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const responses = decision.options.map((option) => ({
      optionId: option.id,
      score: selectedResponses[option.id],
    }));

    const { data, error } = await supabase.rpc("submit_participant_response", {
      p_public_token: publicToken,
      p_participant_name: participantName.trim(),
      p_responses: responses,
    });

    if (error) {
      console.error("Unable to submit participant response:", error);
      setErrorMessage("Jawapan belum berjaya dihantar. Cuba sekali lagi.");
      setIsSubmitting(false);
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (result?.response_token) {
      window.localStorage.setItem(
        `pakatlah-response-${publicToken}`,
        result.response_token,
      );
    }

    setIsSubmitted(true);
    setIsSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
                <div className="h-24 animate-pulse rounded-2xl bg-muted" />
                <div className="h-24 animate-pulse rounded-2xl bg-muted" />
              </div>
            </div>
          </section>
        )}

        {!isLoading && errorMessage && !decision && (
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
            </div>
          </section>
        )}

        {!isLoading && decision && isSubmitted && (
          <section className="mt-7 sm:mt-10">
            <div className="glass-panel rounded-3xl p-6 text-center sm:p-8">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <CheckCircle2 aria-hidden="true" size={28} />
              </span>
              <p className="mt-5 text-sm font-semibold text-primary">
                Jawapan diterima
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.025em]">
                Terima kasih, {participantName.trim()}.
              </h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                Jawapan anda sudah disimpan. Organizer boleh melihat keputusan
                selepas lebih ramai peserta menjawab.
              </p>
            </div>
          </section>
        )}

        {!isLoading && decision && !isSubmitted && (
          <section className="mt-7 sm:mt-10">
            <span
              className={[
                "rounded-full px-3 py-1.5 text-xs font-semibold",
                isClosed
                  ? "bg-warning/10 text-warning"
                  : "bg-primary/10 text-primary",
              ].join(" ")}
            >
              {isFinalized
                ? "Keputusan dimuktamadkan"
                : isClosed
                  ? "Respons ditutup"
                  : "Respons dibuka"}
            </span>

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

            {isFinalized && decision.finalOption ? (
              <div className="glass-panel mt-7 rounded-3xl border-primary/30 bg-primary/10 p-6 text-center sm:mt-8 sm:p-8">
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <CheckCircle2 aria-hidden="true" size={28} />
                </span>

                <p className="mt-5 text-sm font-semibold text-primary">
                  Keputusan akhir
                </p>

                <h2 className="mt-2 break-words text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
                  {decision.finalOption.name}
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Pilihan ini telah dimuktamadkan oleh organizer berdasarkan
                  respons kumpulan.
                </p>
              </div>
            ) : isClosed ? (
              <div className="glass-panel mt-7 rounded-3xl p-6 text-center sm:mt-8">
                <h2 className="text-xl font-semibold">Respons sudah ditutup</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Jawapan baharu tidak lagi diterima untuk pilihan ini.
                </p>
              </div>
            ) : (
              <form className="mt-7 space-y-5 sm:mt-8" onSubmit={handleSubmit}>
                <div className="glass-panel rounded-3xl p-5 sm:p-6">
                  <label htmlFor="participant-name" className="text-sm font-semibold">
                    Nama
                  </label>
                  <input
                    id="participant-name"
                    type="text"
                    value={participantName}
                    maxLength={PARTICIPANT_NAME_LIMIT}
                    autoComplete="name"
                    placeholder="Masukkan nama anda"
                    className="focus-ring mt-3 h-12 w-full rounded-xl border border-input bg-background/80 px-4 text-base text-foreground placeholder:text-muted-foreground"
                    onChange={(event) => setParticipantName(event.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">Beri respons</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Pilih satu respons untuk setiap pilihan.
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
                      {answeredCount}/{decision.options.length}
                    </span>
                  </div>

                  {decision.options.map((option, index) => (
                    <fieldset
                      key={option.id}
                      className="glass-panel rounded-3xl p-4 sm:p-5"
                    >
                      <legend className="sr-only">
                        Respons untuk {option.name}
                      </legend>
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                          {index + 1}
                        </span>
                        <h3 className="min-w-0 break-words font-semibold">
                          {option.name}
                        </h3>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {reactions.map((reaction) => {
                          const isSelected =
                            selectedResponses[option.id] === reaction.score;

                          return (
                            <button
                              key={reaction.score}
                              type="button"
                              aria-pressed={isSelected}
                              className={[
                                "focus-ring flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-sm font-semibold transition duration-200 active:scale-[0.98]",
                                isSelected
                                  ? "border-primary bg-primary/15 text-foreground shadow-sm"
                                  : "border-border bg-background/65 text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
                              ].join(" ")}
                              onClick={() =>
                                selectReaction(option.id, reaction.score)
                              }
                            >
                              <span aria-hidden="true" className="text-2xl">
                                {reaction.emoji}
                              </span>
                              <span>{reaction.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                  ))}
                </div>

                {errorMessage && (
                  <p
                    role="alert"
                    className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive"
                  >
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="focus-ring inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none sm:ml-auto sm:w-auto"
                >
                  {isSubmitting ? (
                    <LoaderCircle
                      aria-hidden="true"
                      className="animate-spin"
                      size={18}
                    />
                  ) : (
                    <Send aria-hidden="true" size={18} />
                  )}
                  {isSubmitting ? "Menghantar..." : "Hantar jawapan"}
                </button>
              </form>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
