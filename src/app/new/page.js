"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";

const QUESTION_LIMIT = 120;

export default function NewDecisionPage() {
  const [question, setQuestion] = useState("");

  const normalizedQuestion = question.trim();
  const isQuestionValid = normalizedQuestion.length > 0;

  function handleSubmit(event) {
    event.preventDefault();

    if (!isQuestionValid) {
      return;
    }
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
          Kembali
        </Link>

        <section className="mt-7 sm:mt-10">
          <p className="text-sm font-semibold text-primary">
            Buat pilihan baharu
          </p>

          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.025em] sm:text-4xl">
            Apa yang mahu dipilih?
          </h1>

          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            Tulis satu soalan yang ringkas dan jelas.
          </p>

          <form className="mt-7 sm:mt-8" onSubmit={handleSubmit}>
            <div className="glass-panel rounded-3xl p-5 sm:p-6">
              <div className="space-y-3">
                <label htmlFor="decision-question" className="text-sm font-semibold">
                  Soalan
                </label>

                <textarea
                  id="decision-question"
                  name="question"
                  value={question}
                  maxLength={QUESTION_LIMIT}
                  rows={4}
                  autoFocus
                  placeholder="Contoh: Nak makan di mana malam ini?"
                  className="focus-ring min-h-32 w-full resize-none rounded-2xl border border-input bg-background/80 px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground"
                  onChange={(event) => setQuestion(event.target.value)}
                />

                <div className="flex items-start justify-between gap-3">
                  <p className="max-w-[75%] text-sm leading-relaxed text-muted-foreground sm:max-w-none">
                    Semua peserta akan melihat soalan ini.
                  </p>

                  <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                    {question.length}/{QUESTION_LIMIT}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isQuestionValid}
              className="focus-ring mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground shadow-sm transition duration-200 hover:bg-primary-hover active:scale-[0.98] disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:cursor-not-allowed disabled:hover:bg-muted sm:mt-6 sm:ml-auto sm:w-auto"
            >
              Teruskan
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
