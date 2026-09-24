"use client";

type Props = {
  onReload: () => void;
};

// Ditampilkan saat PUT ditolak GitHub dengan 409 — data di repo sudah
// berubah sejak terakhir dimuat.
export function ConflictBanner({ onReload }: Props) {
  return (
    <div className="mt-4 rounded-(--radius) border border-border bg-black/5 p-4 text-sm dark:bg-white/8">
      <p className="text-text-primary">
        Data di repo sudah berubah sejak terakhir dimuat, jadi simpanan ini ditolak supaya tidak menimpa perubahan
        itu.
      </p>
      <button
        type="button"
        onClick={onReload}
        className="mt-3 rounded-full border border-border px-4 py-2 text-xs text-text-secondary transition-colors hover:text-text-primary"
      >
        Muat ulang data
      </button>
    </div>
  );
}
