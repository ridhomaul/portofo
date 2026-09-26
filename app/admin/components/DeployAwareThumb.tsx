"use client";

import { useState } from "react";

type Props = {
  src?: string | null;
  localPreviewUrl?: string | null;
  alt?: string;
  className?: string;
};

const DEFAULT_CLASS = "h-10 w-10 rounded-(--radius-sm) border border-border object-cover";

// Thumbnail gambar yang disimpan di repo. Kalau baru diupload di sesi
// ini, `localPreviewUrl` (blob lokal, dari useRecentUploads atau
// pratinjau file yang sedang dipilih) dipakai dulu supaya langsung
// tampil benar tanpa menunggu deploy. Kalau path repo gagal dimuat
// (situs belum sempat rebuild), tampilkan placeholder alih-alih ikon
// gambar patah.
export function DeployAwareThumb({ src, localPreviewUrl, alt = "", className }: Props) {
  // Menyimpan src yang gagal dimuat (bukan sekadar boolean) supaya
  // "gagal" otomatis batal begitu effectiveSrc berganti — tidak perlu
  // efek untuk mereset state saat prop berubah.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const effectiveSrc = localPreviewUrl ?? src ?? null;
  const failed = effectiveSrc !== null && failedSrc === effectiveSrc;

  if (!effectiveSrc) {
    return <span className="text-text-muted">—</span>;
  }

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center border border-dashed border-border bg-surface p-1 text-center text-[9px] leading-tight text-text-muted ${className ?? DEFAULT_CLASS}`}
      >
        Menunggu deploy
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={effectiveSrc} alt={alt} onError={() => setFailedSrc(effectiveSrc)} className={className ?? DEFAULT_CLASS} />
  );
}
