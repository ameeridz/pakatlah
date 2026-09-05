"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const themes = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    icon: Monitor,
  },
];

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className="h-11 w-32 rounded-full border border-border bg-card/70"
      />
    );
  }

  return (
    <div
      aria-label="Pilihan tema"
      className="glass-panel flex items-center gap-1 rounded-full p-1"
      role="group"
    >
      {themes.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value;

        return (
          <button
            key={value}
            type="button"
            aria-label={`Gunakan tema ${label}`}
            aria-pressed={isActive}
            className={[
              "focus-ring flex size-9 cursor-pointer items-center justify-center",
              "rounded-full transition duration-200",
              "motion-safe:hover:-translate-y-0.5",
              "active:scale-95",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
            ].join(" ")}
            onClick={() => setTheme(value)}
            title={label}
          >
            <Icon aria-hidden="true" size={17} strokeWidth={2.25} />
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}