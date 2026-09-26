"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

// Pagination client-side generik (halaman dimulai dari 1). Dipakai
// /projects; halaman daftar lain sebaiknya memakai komponen ini juga
// supaya polanya tetap satu.
export default function Pagination({ page, pageCount, onPageChange }: Props) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  const arrowClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:text-text-primary disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className={arrowClass}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onPageChange(n)}
          aria-current={n === page ? "page" : undefined}
          className={`h-9 min-w-9 rounded-full px-3 text-sm transition-colors ${
            n === page
              ? "bg-accent font-medium text-bg"
              : "border border-border text-text-secondary hover:text-text-primary"
          }`}
        >
          {n}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === pageCount}
        aria-label="Next page"
        className={arrowClass}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
