"use client";

import Link from "next/link";
import { Home, Moon, Plus } from "lucide-react";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    href: "/",
    label: "Home",
    icon: Home,
  },
  {
    href: "/new",
    label: "Buat Pakat",
    icon: Plus,
    primary: true,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="glass-panel mx-auto flex min-h-18 w-full max-w-md items-center justify-around rounded-3xl px-2 py-2">
        {navigationItems.map(({ href, label, icon: Icon, primary }) => {
          const isActive =
            href === "/" ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "focus-ring group flex min-h-13 min-w-22 flex-col items-center justify-center gap-1 rounded-2xl px-3 text-xs font-semibold transition duration-200 active:scale-95",
                primary
                  ? "text-primary"
                  : isActive
                    ? "bg-secondary text-secondary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-secondary-foreground",
              ].join(" ")}
            >
              <span
                className={[
                  "flex size-8 items-center justify-center rounded-full transition duration-200",
                  primary
                    ? "bg-primary text-primary-foreground shadow-sm group-hover:bg-primary-hover"
                    : "bg-transparent",
                ].join(" ")}
              >
                <Icon
                  aria-hidden="true"
                  size={primary ? 20 : 19}
                  strokeWidth={primary ? 2.75 : 2.25}
                />
              </span>
              <span>{label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          aria-label="Buka pilihan tema"
          className="focus-ring flex min-h-13 min-w-22 flex-col items-center justify-center gap-1 rounded-2xl px-3 text-xs font-semibold text-muted-foreground transition duration-200 hover:bg-secondary/70 hover:text-secondary-foreground active:scale-95"
        >
          <span className="flex size-8 items-center justify-center rounded-full">
            <Moon aria-hidden="true" size={19} strokeWidth={2.25} />
          </span>
          <span>Tema</span>
        </button>
      </div>
    </nav>
  );
}
