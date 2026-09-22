"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { site } from "@/content/site";

// Contact SENGAJA ada di navigasi. Itu tujuan akhir seluruh situs —
// jangan sampai orang harus scroll sampai habis untuk menemukannya.
const nav = [
  { label: "Projects", href: "/#work" },
  { label: "Experience", href: "/#experience" },
  { label: "Contact", href: "/#contact" },
];

const emptySubscribe = () => () => {};

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const toggleTheme = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!document.startViewTransition || prefersReducedMotion) {
      setTheme(next);
      return;
    }

    // next-themes menerapkan class lewat effect setelah render, jadi
    // kalau DOM belum berubah saat callback ini selesai, browser
    // memotret tampilan yang sama sebelum & sesudah — animasinya
    // tidak akan terlihat. Toggle class manual di sini memastikan
    // screenshot "before/after" View Transitions benar-benar berbeda.
    document.startViewTransition(() => {
      document.documentElement.classList.toggle("dark", next === "dark");
      setTheme(next);
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
        <a href="/#top" className="display text-lg tracking-tight" aria-label={site.name}>
          {site.initials}
        </a>

        <nav className="flex items-center gap-1 sm:gap-2">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-sm px-2.5 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary sm:px-3"
            >
              {item.label}
            </a>
          ))}

          <span className="mx-1 h-5 w-px bg-border sm:mx-2" aria-hidden />

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Switch theme"
            className="rounded-sm p-2 text-text-secondary transition-colors hover:text-text-primary"
          >
            {mounted && resolvedTheme === "dark"
              ? <Sun className="h-4.5 w-4.5" />
              : <Moon className="h-4.5 w-4.5" />}
          </button>
        </nav>
      </div>
    </header>
  );
}
