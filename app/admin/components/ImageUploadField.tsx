"use client";

import { useEffect, useMemo, useState } from "react";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "../lib/github";

type Props = {
  label: string;
  currentImage?: string | null;
  file: File | null;
  onChange: (file: File | null) => void;
  className?: string;
};

// Input file + validasi (tipe, ukuran) + pratinjau, dipakai di semua
// panel yang punya field gambar tunggal (Certifications, Projects,
// Featured project). Upload sebenarnya (PUT ke GitHub) terjadi di
// handleSubmit masing-masing panel, bukan di sini — komponen ini cuma
// menyiapkan File-nya.
export function ImageUploadField({ label, currentImage, file, onChange, className }: Props) {
  const [fileError, setFileError] = useState<string | null>(null);

  // Turunan dari `file`, bukan state — revoke dilakukan sebagai efek
  // samping (bukan setState) saat url berganti atau saat unmount.
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFileError(null);

    if (!selected) {
      onChange(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(selected.type)) {
      setFileError("Format gambar harus PNG, JPG, atau WEBP.");
      e.target.value = "";
      onChange(null);
      return;
    }

    if (selected.size > MAX_IMAGE_BYTES) {
      setFileError(`File ${(selected.size / (1024 * 1024)).toFixed(1)} MB, maksimal 2 MB.`);
      e.target.value = "";
      onChange(null);
      return;
    }

    onChange(selected);
  };

  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className ?? "sm:col-span-2"}`}>
      <span className="text-text-secondary">{label}</span>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        className="text-sm text-text-secondary file:mr-3 file:rounded-full file:border file:border-border file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:text-text-primary"
      />

      {fileError && <p className="text-sm text-red-600 dark:text-red-400">{fileError}</p>}

      {(previewUrl || currentImage) && (
        <div>
          <p className="mb-1.5 text-xs text-text-secondary">
            {previewUrl ? "Pratinjau gambar baru:" : "Gambar saat ini — biarkan kosong kalau tidak mau diganti:"}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl ?? currentImage ?? undefined}
            alt=""
            className="h-24 w-24 rounded-(--radius-sm) border border-border object-cover"
          />
        </div>
      )}
    </label>
  );
}
