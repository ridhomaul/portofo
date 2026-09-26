"use client";

import { useEffect, useMemo, useState } from "react";
import { DeployAwareThumb } from "./DeployAwareThumb";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "../lib/github";
import type { RecentUploads } from "../lib/useRecentUploads";

// `file` = gambar baru yang belum diupload, menggantikan `src` saat
// disimpan. `src` kosong berarti belum pernah ada gambar untuk baris
// ini — wajib pilih file sebelum submit.
export type ImageEntry = { src: string; alt: string; file?: File | null };

type RowProps = {
  item: ImageEntry;
  onUpdate: (patch: Partial<ImageEntry>) => void;
  onRemove: () => void;
  recentUploads?: RecentUploads;
};

function ImageEntryRow({ item, onUpdate, onRemove, recentUploads }: RowProps) {
  const [fileError, setFileError] = useState<string | null>(null);

  // Turunan dari `item.file`, bukan state — revoke dilakukan sebagai
  // efek samping (bukan setState) saat url berganti atau saat unmount.
  const previewUrl = useMemo(() => (item.file ? URL.createObjectURL(item.file) : null), [item.file]);
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFileError(null);

    if (!file) {
      onUpdate({ file: null });
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFileError("Format gambar harus PNG, JPG, atau WEBP.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setFileError(`File ${(file.size / (1024 * 1024)).toFixed(1)} MB, maksimal 2 MB.`);
      e.target.value = "";
      return;
    }

    onUpdate({ file });
  };

  return (
    <div className="flex flex-col gap-2 rounded-(--radius) border border-border p-3 sm:flex-row sm:items-start">
      <DeployAwareThumb
        src={item.src}
        localPreviewUrl={previewUrl ?? recentUploads?.get(item.src)}
        className="h-16 w-16 flex-shrink-0 rounded-(--radius-sm) border border-border object-cover"
      />

      <div className="flex flex-1 flex-col gap-2">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="text-xs text-text-secondary file:mr-3 file:rounded-full file:border file:border-border file:bg-transparent file:px-3 file:py-1 file:text-xs file:text-text-primary"
        />
        {fileError && <p className="text-xs text-red-600 dark:text-red-400">{fileError}</p>}
        <input
          type="text"
          value={item.alt}
          onChange={(e) => onUpdate({ alt: e.target.value })}
          placeholder="Alt text"
          className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-sm text-text-primary outline-none focus-visible:border-text-primary"
        />
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="self-start text-xs text-red-600 transition-opacity hover:opacity-70 dark:text-red-400"
      >
        Hapus
      </button>
    </div>
  );
}

type Props = {
  label: string;
  items: ImageEntry[];
  onChange: (items: ImageEntry[]) => void;
  recentUploads?: RecentUploads;
};

export function ImagesEditor({ label, items, onChange, recentUploads }: Props) {
  const update = (i: number, patch: Partial<ImageEntry>) => {
    onChange(items.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { src: "", alt: "", file: null }]);

  return (
    <div className="flex flex-col gap-2 text-sm sm:col-span-2">
      <span className="text-text-secondary">{label}</span>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <ImageEntryRow
            key={i}
            item={item}
            onUpdate={(patch) => update(i, patch)}
            onRemove={() => remove(i)}
            recentUploads={recentUploads}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="self-start rounded-full border border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
      >
        + Tambah gambar
      </button>
    </div>
  );
}
