"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  LoaderCircle,
  Pencil,
  RefreshCw,
  Send,
  UserRound,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { ScoringExplainer } from "@/components/scoring-explainer";
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
  const responseStorageKey = `pakatlah-response-${publicToken}`;

  const [decision, setDecision] = useState(null);
  const [participantName, setParticipantName] = useState("");
  const [selectedResponses, setSelectedResponses] = useState({});
  const [responseToken, setResponseToken] = useState("");
  const [participantResults, setParticipantResults] = useState(null);
  const [view, setView] = useState("form");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const frame = window.requestAnimationFrame(async () => {
      if (!publicToken || typeof publicToken !== "string") {
        if (isActive) {
          setErrorMessage("Pautan ini tidak lengkap.");
          setIsLoading(false);
        }
        return;
      }

      const { data: publicDecision, error: decisionError } = await supabase.rpc(
        "get_public_decision",
        { p_public_token: publicToken },
      );

      if (!isActive) return;

      if (decisionError || !publicDecision) {
        if (decisionError) {
          console.error("Unable to load public decision:", decisionError);
        }
        setErrorMessage(
          publicDecision
            ? "Pilihan ini tidak dapat dimuatkan. Cuba sekali lagi."
            : "Pilihan ini tidak ditemui atau pautannya tidak sah.",
        );
        setIsLoading(false);
        return;
      }

      setDecision(publicDecision);
      const savedToken = window.localStorage.getItem(responseStorageKey);

      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      const { data: savedResults, error: savedError } = await supabase.rpc(
        "get_participant_results",
        {
          p_public_token: publicToken,
          p_response_token: savedToken,
        },
      );

      if (!isActive) return;

      if (savedError || !savedResults) {
        if (savedError) {
          console.warn("Stored response token is invalid:", savedError);
        }
        window.localStorage.removeItem(responseStorageKey);
        setIsLoading(false);
        return;
      }

      setResponseToken(savedToken);
      setParticipantResults(savedResults);
      setParticipantName(savedResults.currentParticipant?.name || "");
      setView("submitted");
      setIsLoading(false);
    });

    return () => {
      isActive = false;
      window.cancelAnimationFrame(frame);
    };
  }, [publicToken, responseStorageKey]);

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
  const isFormValid =
    participantName.trim().length > 0 && allOptionsAnswered && !isClosed;

  function selectReaction(optionId, score) {
    setSelectedResponses((current) => ({ ...current, [optionId]: score }));
  }

  function clearStoredResponse() {
    window.localStorage.removeItem(responseStorageKey);
    setResponseToken("");
    setParticipantResults(null);
    setSelectedResponses({});
    setView("form");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isFormValid || isSubmitting || responseToken) return;

    setIsSubmitting(true);
    setErrorMessage("");

    const { data, error } = await supabase.rpc("submit_participant_response", {
      p_public_token: publicToken,
      p_participant_name: participantName.trim(),
      p_responses: decision.options.map((option) => ({
        optionId: option.id,
        score: selectedResponses[option.id],
      })),
    });

    const result = Array.isArray(data) ? data[0] : data;

    if (error || !result?.response_token) {
      if (error) console.error("Unable to submit response:", error);
      setErrorMessage("Jawapan belum berjaya dihantar. Cuba sekali lagi.");
      setIsSubmitting(false);
      return;
    }

    window.localStorage.setItem(responseStorageKey, result.response_token);
    setResponseToken(result.response_token);
    setView("success");
    setIsSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function loadParticipantResults() {
    if (!responseToken || isLoadingResults) return;

    setIsLoadingResults(true);
    setErrorMessage("");

    const { data, error } = await supabase.rpc("get_participant_results", {
      p_public_token: publicToken,
      p_response_token: responseToken,
    });

    if (error || !data) {
      if (error) console.error("Unable to load results:", error);
      if (!data) {
        clearStoredResponse();
        setErrorMessage(
          "Sesi jawapan pada device ini tidak lagi sah. Anda boleh hantar jawapan baharu.",
        );
      } else {
        setErrorMessage("Keputusan semasa tidak dapat dimuatkan. Cuba lagi.");
      }
      setIsLoadingResults(false);
      return;
    }

    setParticipantResults(data);
    setParticipantName(data.currentParticipant?.name || participantName);
    setView("results");
    setIsLoadingResults(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function openEditForm() {
    if (!responseToken || isLoadingEdit) return;

    setIsLoadingEdit(true);
    setErrorMessage("");

    const { data, error } = await supabase.rpc("get_participant_response", {
      p_public_token: publicToken,
      p_response_token: responseToken,
    });

    if (error || !data) {
      if (error) console.error("Unable to load saved response:", error);
      if (!data) clearStoredResponse();
      setErrorMessage("Jawapan anda tidak dapat dimuatkan. Cuba sekali lagi.");
      setIsLoadingEdit(false);
      return;
    }

    if (!data.canEdit) {
      setErrorMessage(
        "Jawapan tidak lagi boleh diedit kerana respons sudah ditutup.",
      );
      setIsLoadingEdit(false);
      return;
    }

    setParticipantName(data.participantName || "");
    setSelectedResponses(
      Object.fromEntries(
        data.responses.map((response) => [response.optionId, response.score]),
      ),
    );
    setView("edit");
    setIsLoadingEdit(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveEditedResponse(event) {
    event.preventDefault();
    if (!isFormValid || !responseToken || isSavingEdit) return;

    setIsSavingEdit(true);
    setErrorMessage("");

    const { data, error } = await supabase.rpc(
      "update_participant_response",
      {
        p_public_token: publicToken,
        p_response_token: responseToken,
        p_participant_name: participantName.trim(),
        p_responses: decision.options.map((option) => ({
          optionId: option.id,
          score: selectedResponses[option.id],
        })),
      },
    );

    if (error || !data) {
      if (error) console.error("Unable to update response:", error);
      setErrorMessage(
        "Perubahan belum berjaya disimpan. Pastikan respons masih dibuka.",
      );
      setIsSavingEdit(false);
      return;
    }

    setParticipantResults(null);
    setView("updated");
    setIsSavingEdit(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setSelectedResponses({});
    setErrorMessage("");
    setView("submitted");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function ResponseFields() {
    return (
      <>
        <div className="glass-panel rounded-3xl p-5 sm:p-6">
          <label htmlFor="participant-name" className="text-sm font-semibold">
            Nama
          </label>
          <input
            id="participant-name"
            type="text"
            value={participantName}
            maxLength={PARTICIPANT_NAME_LIMIT}
            placeholder="Masukkan nama anda"
            className="focus-ring mt-3 h-12 w-full rounded-xl border border-input bg-background/80 px-4 text-base placeholder:text-muted-foreground"
            onChange={(event) => setParticipantName(event.target.value)}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Respons anda</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pilih satu respons untuk setiap pilihan.
            </p>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
            {answeredCount}/{decision.options.length}
          </span>
        </div>

        {decision.options.map((option, index) => (
          <fieldset
            key={option.id}
            className="glass-panel rounded-3xl p-4 sm:p-5"
          >
            <legend className="sr-only">Respons untuk {option.name}</legend>
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                {index + 1}
              </span>
              <h3 className="font-semibold">{option.name}</h3>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {reactions.map((reaction) => {
                const selected =
                  selectedResponses[option.id] === reaction.score;

                return (
                  <button
                    key={reaction.score}
                    type="button"
                    aria-pressed={selected}
                    className={[
                      "focus-ring flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border p-2 text-sm font-semibold transition active:scale-[0.98]",
                      selected
                        ? "border-primary bg-primary/15 text-foreground"
                        : "border-border bg-background/65 text-muted-foreground hover:bg-secondary",
                    ].join(" ")}
                    onClick={() => selectReaction(option.id, reaction.score)}
                  >
                    <span className="text-2xl">{reaction.emoji}</span>
                    <span>{reaction.label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </>
    );
  }

  return (
    <div className="app-background min-h-screen">
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl px-5 pb-16 pt-5 sm:px-6 sm:pb-20 sm:pt-8">
        <Link
          href="/"
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl px-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" size={18} />
          Halaman utama
        </Link>

        {isLoading && (
          <section className="mt-7 space-y-4 sm:mt-10">
            <div className="h-5 w-28 animate-pulse rounded-full bg-muted" />
            <div className="h-10 w-4/5 animate-pulse rounded-xl bg-muted" />
            <div className="h-44 animate-pulse rounded-3xl bg-muted" />
          </section>
        )}

        {!isLoading && errorMessage && !decision && (
          <section className="mt-7 sm:mt-10">
            <div className="glass-panel rounded-3xl p-6 text-center sm:p-8">
              <AlertCircle className="mx-auto text-destructive" size={34} />
              <h1 className="mt-4 text-2xl font-bold">
                Pautan tidak dapat dibuka
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {errorMessage}
              </p>
            </div>
          </section>
        )}

        {!isLoading &&
          decision &&
          ["success", "submitted", "updated"].includes(view) && (
            <section className="mt-7 sm:mt-10">
              <div className="glass-panel rounded-3xl p-6 text-center sm:p-8">
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <CheckCircle2 aria-hidden="true" size={28} />
                </span>
                <p className="mt-5 text-sm font-semibold text-primary">
                  {view === "updated"
                    ? "Perubahan disimpan"
                    : view === "submitted"
                      ? "Jawapan sudah dihantar"
                      : "Jawapan diterima"}
                </p>
                <h1 className="mt-2 text-3xl font-bold">
                  {participantName.trim()
                    ? `Terima kasih, ${participantName.trim()}.`
                    : "Terima kasih."}
                </h1>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                  {view === "updated"
                    ? "Jawapan anda telah dikemas kini."
                    : view === "submitted"
                      ? "Device ini sudah digunakan untuk menghantar jawapan bagi pilihan ini."
                      : "Jawapan anda sudah disimpan."}{" "}
                  Anda boleh lihat keputusan atau edit semula selagi respons
                  masih dibuka.
                </p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    disabled={isLoadingResults}
                    className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-70"
                    onClick={loadParticipantResults}
                  >
                    {isLoadingResults ? (
                      <LoaderCircle className="animate-spin" size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                    {isLoadingResults ? "Memuatkan..." : "Lihat keputusan semasa"}
                  </button>

                  {decision.status === "open" && (
                    <button
                      type="button"
                      disabled={isLoadingEdit}
                      className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card/70 px-5 font-semibold hover:bg-secondary disabled:opacity-70"
                      onClick={openEditForm}
                    >
                      {isLoadingEdit ? (
                        <LoaderCircle className="animate-spin" size={18} />
                      ) : (
                        <Pencil size={18} />
                      )}
                      {isLoadingEdit ? "Memuatkan..." : "Edit jawapan"}
                    </button>
                  )}
                </div>
              </div>

              {errorMessage && (
                <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                  {errorMessage}
                </p>
              )}
            </section>
          )}

        {!isLoading && decision && view === "edit" && (
          <section className="mt-7 sm:mt-10">
            <p className="text-sm font-semibold text-primary">Edit jawapan</p>
            <h1 className="mt-3 break-words text-3xl font-bold sm:text-4xl">
              {decision.question}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Ubah jawapan sebelum organizer menutup respons.
            </p>

            <form className="mt-7 space-y-5" onSubmit={saveEditedResponse}>
              <ResponseFields />

              {errorMessage && (
                <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                  {errorMessage}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isSavingEdit}
                  className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card/70 px-5 font-semibold hover:bg-secondary"
                  onClick={cancelEdit}
                >
                  <X size={18} />
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid || isSavingEdit}
                  className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground disabled:bg-muted disabled:text-muted-foreground"
                >
                  {isSavingEdit && (
                    <LoaderCircle className="animate-spin" size={18} />
                  )}
                  {isSavingEdit ? "Menyimpan..." : "Simpan perubahan"}
                </button>
              </div>
            </form>
          </section>
        )}

        {!isLoading && decision && view === "results" && participantResults && (
          <section className="mt-7 sm:mt-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-primary">
                  {participantResults.status === "finalized"
                    ? "Keputusan akhir"
                    : "Keputusan semasa"}
                </p>
                <h1 className="mt-2 break-words text-3xl font-bold sm:text-4xl">
                  {participantResults.question}
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">
                  {participantResults.participantCount} peserta telah menjawab
                </p>
              </div>
              <button
                type="button"
                disabled={isLoadingResults}
                aria-label="Muat semula keputusan"
                className="focus-ring flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card/70 hover:bg-secondary"
                onClick={loadParticipantResults}
              >
                <RefreshCw
                  className={isLoadingResults ? "animate-spin" : ""}
                  size={18}
                />
              </button>
            </div>

            <ScoringExplainer className="mt-5" />

            {participantResults.status === "finalized" &&
              participantResults.finalOption && (
                <div className="glass-panel mt-7 rounded-3xl border-primary/30 bg-primary/10 p-6 text-center">
                  <p className="text-sm font-semibold text-primary">
                    Keputusan telah dimuktamadkan
                  </p>
                  <h2 className="mt-2 text-3xl font-bold">
                    {participantResults.finalOption.name}
                  </h2>
                </div>
              )}

            <div className="mt-7 space-y-4">
              {participantResults.options.map((option, index) => (
                <article key={option.id} className="glass-panel rounded-3xl p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold">
                        {index + 1}
                      </span>
                      <h2 className="break-words font-semibold">{option.name}</h2>
                    </div>
                    <span className="shrink-0 text-2xl font-bold">
                      {option.consensusScore}%
                    </span>
                  </div>
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${option.consensusScore}%` }}
                    />
                  </div>
                  <div className="mt-3 flex justify-between gap-4 text-sm text-muted-foreground">
                    <span>{option.responseCount} respons</span>
                    <span>
                      {option.rejectionCount} tak boleh ({option.rejectionRate}%)
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <p className="mt-5 rounded-2xl border border-border bg-card/70 p-4 text-sm text-muted-foreground">
              {participantResults.status === "open"
                ? "Ranking ini masih boleh berubah apabila peserta lain menghantar jawapan."
                : participantResults.status === "closed"
                  ? "Respons sudah ditutup. Organizer sedang memilih keputusan akhir."
                  : "Keputusan ini telah dimuktamadkan oleh organizer."}
            </p>

            {participantResults.status === "open" && (
              <button
                type="button"
                disabled={isLoadingEdit}
                className="focus-ring mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card/70 px-4 font-semibold hover:bg-secondary sm:w-auto"
                onClick={openEditForm}
              >
                <Pencil size={17} />
                Edit jawapan
              </button>
            )}
          </section>
        )}

        {!isLoading && decision && view === "form" && (
          <section className="mt-7 sm:mt-10">
            <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              {isFinalized
                ? "Keputusan dimuktamadkan"
                : isClosed
                  ? "Respons ditutup"
                  : "Respons dibuka"}
            </span>
            <h1 className="mt-4 break-words text-3xl font-bold sm:text-4xl">
              {decision.question}
            </h1>
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <UserRound size={17} />
              Disediakan oleh {decision.organizerName}
            </p>

            {isFinalized && decision.finalOption ? (
              <div className="glass-panel mt-7 rounded-3xl border-primary/30 bg-primary/10 p-6 text-center">
                <CheckCircle2 className="mx-auto text-primary" size={36} />
                <p className="mt-4 text-sm font-semibold text-primary">
                  Keputusan akhir
                </p>
                <h2 className="mt-2 text-3xl font-bold">
                  {decision.finalOption.name}
                </h2>
              </div>
            ) : isClosed ? (
              <div className="glass-panel mt-7 rounded-3xl p-6 text-center">
                <h2 className="text-xl font-semibold">Respons sudah ditutup</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Jawapan baharu tidak lagi diterima.
                </p>
              </div>
            ) : (
              <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
                <ResponseFields />

                {errorMessage && (
                  <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                    {errorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting || Boolean(responseToken)}
                  className="focus-ring inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground disabled:bg-muted disabled:text-muted-foreground sm:ml-auto sm:w-auto"
                >
                  {isSubmitting ? (
                    <LoaderCircle className="animate-spin" size={18} />
                  ) : (
                    <Send size={18} />
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
