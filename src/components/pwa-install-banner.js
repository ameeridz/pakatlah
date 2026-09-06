"use client";

import Image from "next/image";
import { Download, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";

const DISMISSED_KEY = "pakatlah-install-banner-dismissed";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000;

function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function PwaInstallBanner() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    if (isStandaloneMode()) {
      return undefined;
    }

    const dismissedAt = Number(
      window.localStorage.getItem(DISMISSED_KEY) || 0,
    );

    if (Date.now() - dismissedAt < DISMISS_DURATION) {
      return undefined;
    }

    const ios = isIosDevice();

    const showTimer = window.setTimeout(() => {
      setIsIos(ios);

      if (ios) {
        setIsVisible(true);
      }
    }, 1800);

    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
      setIsVisible(true);
    }

    function handleInstalled() {
      setIsVisible(false);
      setInstallPrompt(null);
      window.localStorage.removeItem(DISMISSED_KEY);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.clearTimeout(showTimer);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  function dismissBanner() {
    window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setIsVisible(false);
    setShowIosGuide(false);
  }

  async function handleInstall() {
    if (isIos) {
      setShowIosGuide((currentValue) => !currentValue);
      return;
    }

    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setIsVisible(false);
    }

    setInstallPrompt(null);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      aria-label="Install aplikasi Pakatlah"
      className="fixed inset-x-4 z-[90] mx-auto max-w-md sm:inset-x-auto sm:right-6 sm:mx-0"
      style={{
        bottom: "calc(env(safe-area-inset-bottom) + 1rem)",
      }}
    >
      <div className="glass-header rounded-3xl p-3 shadow-2xl sm:p-4">
        <div className="flex items-start gap-3">
          <Image
            src="/icons/icon-192x192.png"
            alt=""
            width={48}
            height={48}
            className="size-12 shrink-0 rounded-xl"
          />

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">Install Pakatlah</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Akses lebih cepat terus dari Home Screen.
            </p>
          </div>

          <button
            type="button"
            aria-label="Tutup cadangan install"
            className="focus-ring flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            onClick={dismissBanner}
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        {showIosGuide && (
          <div className="mt-3 rounded-2xl border border-border bg-background/70 p-3 text-sm leading-relaxed text-muted-foreground">
            Tap <strong className="text-foreground">Share</strong> dalam Safari,
            kemudian pilih{" "}
            <strong className="text-foreground">Add to Home Screen</strong>.
          </div>
        )}

        <button
          type="button"
          className="focus-ring mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
          onClick={handleInstall}
        >
          {isIos ? (
            <Share2 aria-hidden="true" size={18} />
          ) : (
            <Download aria-hidden="true" size={18} />
          )}

          {isIos
            ? showIosGuide
              ? "Tutup panduan"
              : "Cara install"
            : "Install app"}
        </button>
      </div>
    </aside>
  );
}
