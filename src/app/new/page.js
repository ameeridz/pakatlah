"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header";

const QUESTION_LIMIT = 120;
const OPTION_LIMIT = 60;
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;
const DRAFT_STORAGE_KEY = "pakatlah-decision-draft";

function createOption(id) {
  return { id, name: "" };
}

function createEmptyOptions() {
  return [createOption("option-1"), createOption("option-2")];
}

export default function NewDecisionPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(createEmptyOptions);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const savedDraft = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);

        if (!savedDraft) {
          return;
        }

        const parsedDraft = JSON.parse(savedDraft);
        const savedQuestion =
          typeof parsedDraft.question === "string" ? parsedDraft.question : "";
        const savedOptions = Array.isArray(parsedDraft.options)
          ? parsedDraft.options.filter(
              (option) =>
                option &&
                typeof option.id === "string" &&
                typeof option.name === "string",
            )
          : [];

        setQuestion(savedQuestion.slice(0, QUESTION_LIMIT));
        setOptions(
          savedOptions.length >= MIN_OPTIONS
            ? savedOptions.slice(0, MAX_OPTIONS)
            : createEmptyOptions(),
        );
      } catch {
        window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const normalizedQuestion = question.trim();
  const normalizedOptionNames = options.map((option) =>
    option.name.trim().toLocaleLowerCase("ms"),
  );

  const duplicateOptionNames = new Set(
    normalizedOptionNames.filter(
      (name, index) =>
        name && normalizedOptionNames.indexOf(name) !== index,
    ),
  );

  const isQuestionValid = normalizedQuestion.length > 0;
  const areOptionsComplete = options.every((option) => option.name.trim());
  const hasDuplicateOptions = duplicateOptionNames.size > 0;
  const isFormValid =
    isQuestionValid && areOptionsComplete && !hasDuplicateOptions;

  function handleOptionChange(optionId, value) {
    setOptions((currentOptions) =>
      currentOptions.map((option) =>
        option.id === optionId ? { ...option, name: value } : option,
      ),
    );
  }

  function addOption() {
    if (options.length >= MAX_OPTIONS) {
      return;
    }

    const nextOptionNumber =
      options.reduce((highestNumber, option) => {
        const optionNumber = Number(option.id.replace("option-", ""));
        return Math.max(highestNumber, optionNumber || 0);
      }, 0) + 1;

    setOptions((currentOptions) => [
      ...currentOptions,
      createOption(`option-${nextOptionNumber}`),
    ]);
  }

  function removeOption(optionId) {
    if (options.length <= MIN_OPTIONS) {
      return;
    }

    setOptions((currentOptions) =>
      currentOptions.filter((option) => option.id !== optionId),
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!isFormValid) {
      return;
    }

    const draft = {
      question: normalizedQuestion,
      options: options.map((option) => ({
        id: option.id,
        name: option.name.trim(),
      })),
      updatedAt: new Date().toISOString(),
    };

    window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    router.push("/preview");
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
            Tulis soalan dan masukkan pilihan yang boleh dipertimbangkan.
          </p>

          <form
            className="mt-7 space-y-5 sm:mt-8 sm:space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="glass-panel rounded-3xl p-5 sm:p-6">
              <div>
                <label
                  htmlFor="decision-question"
                  className="text-sm font-semibold"
                >
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
                  className="focus-ring mt-4 min-h-32 w-full resize-none rounded-2xl border border-input bg-background/80 px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground"
                  onChange={(event) => setQuestion(event.target.value)}
                />

                <div className="mt-3 flex items-start justify-between gap-3">
                  <p className="max-w-[75%] text-sm leading-relaxed text-muted-foreground sm:max-w-none">
                    Semua peserta akan melihat soalan ini.
                  </p>

                  <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                    {question.length}/{QUESTION_LIMIT}
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Pilihan</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Masukkan antara {MIN_OPTIONS} hingga {MAX_OPTIONS} pilihan.
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
                  {options.length}/{MAX_OPTIONS}
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {options.map((option, index) => {
                  const normalizedName = option.name
                    .trim()
                    .toLocaleLowerCase("ms");
                  const isDuplicate = duplicateOptionNames.has(normalizedName);
                  const inputId = `decision-${option.id}`;
                  const errorId = `${inputId}-error`;

                  return (
                    <div key={option.id} className="space-y-2">
                      <label htmlFor={inputId} className="text-sm font-semibold">
                        Pilihan {index + 1}
                      </label>

                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <input
                            id={inputId}
                            name={option.id}
                            type="text"
                            value={option.name}
                            maxLength={OPTION_LIMIT}
                            aria-invalid={isDuplicate}
                            aria-describedby={isDuplicate ? errorId : undefined}
                            placeholder={`Masukkan pilihan ${index + 1}`}
                            className="focus-ring h-12 w-full rounded-xl border border-input bg-background/80 px-4 text-base text-foreground placeholder:text-muted-foreground aria-invalid:border-destructive"
                            onChange={(event) =>
                              handleOptionChange(option.id, event.target.value)
                            }
                          />

                          <div className="mt-1.5 flex justify-between gap-3">
                            <div>
                              {isDuplicate && (
                                <p
                                  id={errorId}
                                  className="text-sm font-medium text-destructive"
                                >
                                  Pilihan ini sudah dimasukkan.
                                </p>
                              )}
                            </div>

                            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                              {option.name.length}/{OPTION_LIMIT}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          aria-label={`Buang pilihan ${index + 1}`}
                          disabled={options.length <= MIN_OPTIONS}
                          className="focus-ring flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card/70 text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-border disabled:hover:bg-card/70 disabled:hover:text-muted-foreground"
                          onClick={() => removeOption(option.id)}
                        >
                          <Trash2 aria-hidden="true" size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={options.length >= MAX_OPTIONS}
                className="focus-ring mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card/70 px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
                onClick={addOption}
              >
                <Plus aria-hidden="true" size={18} />
                Tambah pilihan
              </button>
            </div>

            <button
              type="submit"
              disabled={!isFormValid}
              className="focus-ring inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground shadow-sm transition duration-200 hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:hover:bg-muted sm:ml-auto sm:w-auto"
            >
              Semak pilihan
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
