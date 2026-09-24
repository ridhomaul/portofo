"use client";

import { useState } from "react";
import { ConflictBanner } from "../components/ConflictBanner";
import type { useJsonResource } from "../lib/useJsonResource";
import type { SiteFile } from "./SitePanel";

type Props = {
  resource: ReturnType<typeof useJsonResource<SiteFile>>;
};

export function HeroIntroPanel({ resource }: Props) {
  const { data, loading, error, conflict, save, reloadAfterConflict } = resource;

  return (
    <div>
      <h2 className="text-lg font-medium">Hero intro</h2>
      <p className="mt-2 max-w-[60ch] text-sm text-text-secondary">
        Teks ini tampil di hero. Bungkus kata dengan <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">{"{kurung kurawal}"}</code>{" "}
        supaya kata itu dirender sebagai chip — contoh: <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">{"{Next.js}"}</code>.
      </p>

      {loading && <p className="mt-4 text-sm text-text-secondary">Memuat intro…</p>}
      {!loading && error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {conflict && <ConflictBanner onReload={reloadAfterConflict} />}

      {!loading && data && <IntroForm data={data} save={save} />}
    </div>
  );
}

function IntroForm({
  data,
  save,
}: {
  data: SiteFile;
  save: (next: SiteFile, message: string) => Promise<boolean>;
}) {
  const [intro, setIntro] = useState(data.site.intro);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSaveStatus(null);

    if (!intro.trim()) {
      setFormError("Intro tidak boleh kosong.");
      return;
    }

    setSaving(true);
    try {
      const saved = await save({ ...data, site: { ...data.site, intro } }, "admin: perbarui hero intro");
      if (saved) {
        setSaveStatus({ type: "success", message: "Hero intro diperbarui." });
      }
    } catch (err) {
      setSaveStatus({ type: "error", message: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 rounded-(--radius) border border-border p-6">
      <textarea
        value={intro}
        onChange={(e) => setIntro(e.target.value)}
        rows={5}
        className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-sm text-text-primary outline-none focus-visible:border-text-primary"
      />

      {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

      <div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </div>

      {saveStatus && (
        <p
          className={`text-sm ${saveStatus.type === "success" ? "text-text-primary" : "text-red-600 dark:text-red-400"}`}
        >
          {saveStatus.message}
        </p>
      )}
    </form>
  );
}
