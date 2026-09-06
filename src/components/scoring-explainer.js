"use client";

import { Calculator, ChevronDown } from "lucide-react";
import { useState } from "react";

const scoringItems = [
  { emoji: "😍", label: "Suka", score: 3 },
  { emoji: "🙂", label: "Boleh", score: 2 },
  { emoji: "😐", label: "Ikut saja", score: 1 },
  { emoji: "🙅", label: "Tak boleh", score: 0 },
];

export function ScoringExplainer({ className = "" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="scoring-explainer-panel"
        className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card/70 px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <Calculator aria-hidden="true" size={17} />
        Cara skor dikira
        <ChevronDown
          aria-hidden="true"
          size={16}
          className={[
            "transition-transform duration-200",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {isOpen && (
        <div
          id="scoring-explainer-panel"
          className="glass-panel mt-3 rounded-3xl p-5 sm:p-6"
        >
          <h2 className="text-lg font-semibold">Setiap respons ada mata</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Skor persetujuan menunjukkan sejauh mana sesuatu pilihan boleh
            diterima oleh group.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {scoringItems.map((item) => (
              <div
                key={item.score}
                className="rounded-2xl border border-border bg-background/65 p-3 text-center"
              >
                <span aria-hidden="true" className="text-2xl">
                  {item.emoji}
                </span>
                <p className="mt-1 text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.score} {item.score === 1 ? "mata" : "mata"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
            <p className="text-sm font-semibold text-foreground">
              Lagi tinggi skor, lagi ramai boleh terima pilihan itu.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Pilihan disusun ikut skor persetujuan tertinggi. Jika skornya
              sama, pilihan dengan respons “Tak boleh” paling rendah akan berada
              di atas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
