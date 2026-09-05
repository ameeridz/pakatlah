"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Link2,
  LoaderCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { supabase } from "@/lib/supabase/client";

const DRAFT_STORAGE_KEY = "pakatlah-decision-draft";
const PUBLISHED_STORAGE_KEY = "pakatlah-published-decision";

export default function ShareDecisionPage() {
  const [draft, setDraft] = useState(null);
  const [publishedDecision, setPublishedDecision] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const savedDraft = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
        const savedPublishedDecision = window.sessionStorage.getItem(
          PUBLISHED_STORAGE_KEY,
        );
        const parsedDraft = savedDraft ? JSON.parse(savedDraft) : null;
        const parsedPublishedDecision = savedPublishedDecision
          ? JSON.parse(savedPublishedDecision)
          : null;

        if (
          parsedDraft &&
          typeof parsedDraft.question === "string" &&
          typeof parsedDraft.organizerName === "string" &&
          Array.isArray(parsedDraft.options)
        ) {
          setDraft(parsedDraft);
        }

        if (
          parsedPublishedDecision &&
          typeof parsedPublishedDecision.publicToken === "string" &&
          typeof parsedPublishedDecision.manageToken === "string"
        ) {
          setPublishedDecision(parsedPublishedDecision);
        }
      } catch {
        window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
        window.sessionStorage.removeItem(PUBLISHED_STORAGE_KEY);
      } finally {
        setIsReady(true);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  async function publishDecision() {
    if (!draft || isPublishing || publishedDecision) {
      return;
    }

    setIsPublishing(true);
    setErrorMessage("");

    const { data, error } = await supabase.rpc("create_decision", {
      p_question: draft.question,
      p_organizer_name: draft.organizerName,
      p_options: draft.options.map((option) => option.name),
      p_closes_at: null,
    });

    if (error) {
      console.error("Unable to create decision:", error);
      setErrorMessage(
        "Pautan belum berjaya dihasilkan. Cuba sekali lagi.",
      );
      setIsPublishing(false);
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (!result?.public_token || !result?.manage_token) {
      setErrorMessage(
        "Respons daripada pangkalan data tidak lengkap. Cuba sekali lagi.",
      );
      setIsPublishing(false);
      return;
    }

    const nextPublishedDecision = {
      decisionId: result.decision_id,
      publicToken: result.public_token,
      manageToken: result.manage_token,
    };

    window.sessionStorage.setItem(
      PUBLISHED_STORAGE_KEY,
      JSON.stringify(nextPublishedDecision),
    );
    setPublishedDecision(nextPublishedDecision);
    setIsPublishing(false);
  }

  async function copyText(value, field) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);

      window.setTimeout(() => {
        setCopiedField(null);
      }, 1800);
    } catch {
      setErrorMessage("Pautan tidak dapat disalin. Salin secara manual.");
    }
  }

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const participantLink = publishedDecision
    ? `${origin}/p/${publishedDecision.publicToken}`
    : "";
  const manageLink = publishedDecision
    ? `${origin}/manage/${publishedDecision.manageToken}`
    : "";

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
            Hasilkan pautan peserta
          </h1>

          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            Selepas diterbitkan, pilihan ini boleh dibuka pada peranti lain.
          </p>

          {!isReady && (
            <div className="glass-panel mt-7 rounded-3xl p-6 sm:mt-8">
              <div className="h-6 w-2/3 animate-pulse rounded-lg bg-muted" />
              <div className="mt-4 h-24 animate-pulse rounded-2xl bg-muted" />
            </div>
          )}

          {isReady && !draft && (
            <div className="glass-panel mt-7 rounded-3xl p-6 text-center sm:mt-8">
              <p className="font-semibold">Draf tidak ditemui.</p>
              <Link
                href="/new"
                className="focus-ring mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
              >
                Buat pilihan baharu
              </Link>
            </div>
          )}

          {isReady && draft && (
            <>
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
              </div>

              {!publishedDecision && (
                <button
                  type="button"
                  disabled={isPublishing}
                  className="focus-ring mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-70 sm:ml-auto sm:w-auto"
                  onClick={publishDecision}
                >
                  {isPublishing ? (
                    <LoaderCircle
                      aria-hidden="true"
                      className="animate-spin"
                      size={18}
                    />
                  ) : (
                    <Link2 aria-hidden="true" size={18} />
                  )}
                  {isPublishing ? "Menghasilkan pautan..." : "Hasilkan pautan"}
                </button>
              )}

              {publishedDecision && (
                <div className="glass-panel mt-5 rounded-3xl p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check aria-hidden="true" size={19} strokeWidth={2.75} />
                    </span>
                    <div>
                      <h2 className="font-semibold">Pautan sudah tersedia</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Kongsi pautan peserta. Simpan pautan urus untuk diri sendiri.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">
                        Pautan peserta
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={participantLink}
                          className="h-12 min-w-0 flex-1 rounded-xl border border-input bg-background/80 px-4 text-sm text-foreground"
                        />
                        <button
                          type="button"
                          aria-label="Salin pautan peserta"
                          className="focus-ring flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card/70 text-foreground transition-colors hover:bg-secondary"
                          onClick={() => copyText(participantLink, "participant")}
                        >
                          {copiedField === "participant" ? (
                            <Check aria-hidden="true" size={18} />
                          ) : (
                            <Copy aria-hidden="true" size={18} />
                          )}
                        </button>
                        <a
                          href={participantLink}
                          aria-label="Buka pautan peserta"
                          className="focus-ring flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card/70 text-foreground transition-colors hover:bg-secondary"
                        >
                          <ExternalLink aria-hidden="true" size={18} />
                        </a>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Pautan urus</label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          readOnly
                          value={manageLink}
                          className="h-12 min-w-0 flex-1 rounded-xl border border-input bg-background/80 px-4 text-sm text-foreground"
                        />
                        <button
                          type="button"
                          aria-label="Salin pautan urus"
                          className="focus-ring flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card/70 text-foreground transition-colors hover:bg-secondary"
                          onClick={() => copyText(manageLink, "manage")}
                        >
                          {copiedField === "manage" ? (
                            <Check aria-hidden="true" size={18} />
                          ) : (
                            <Copy aria-hidden="true" size={18} />
                          )}
                        </button>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Jangan kongsi pautan urus. Sesiapa yang memilikinya boleh
                        mengurus pilihan ini.
                      </p>
                      <a
  href={manageLink}
  target="_blank"
  rel="noopener noreferrer"
  className="focus-ring mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
>
  <ExternalLink aria-hidden="true" size={18} />
  Buka dashboard organizer
</a>

                    </div>
                  </div>
                </div>
              )}

              {errorMessage && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive"
                >
                  {errorMessage}
                </p>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
