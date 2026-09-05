"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [activeTheme, setActiveTheme] = useState(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const currentTheme = document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";

      setActiveTheme(currentTheme);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function toggleTheme(event) {
    event.preventDefault();

    const root = document.documentElement;
    const currentTheme = root.classList.contains("dark") ? "dark" : "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    root.classList.toggle("dark", nextTheme === "dark");
    root.style.colorScheme = nextTheme;
    window.localStorage.setItem("pakatlah-theme", nextTheme);
    setActiveTheme(nextTheme);
  }

  const isDark = activeTheme === "dark";
  const label = isDark
    ? "Tukar kepada tema cerah"
    : "Tukar kepada tema gelap";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      aria-label={label}
      className="focus-ring pointer-events-auto relative z-20 flex size-11 shrink-0 touch-manipulation cursor-pointer select-none items-center justify-center rounded-full border border-border bg-card/80 text-foreground shadow-sm backdrop-blur-md transition-colors duration-200 hover:bg-secondary active:bg-secondary"
      onPointerUp={toggleTheme}
      title={label}
    >
      <Icon
        aria-hidden="true"
        className="pointer-events-none"
        size={19}
        strokeWidth={2.25}
      />
      <span className="sr-only">{label}</span>
    </button>
  );
}
