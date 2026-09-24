"use client";

import { useState } from "react";
import type { Site, Stack } from "@/content/site";
import { ConflictBanner } from "../components/ConflictBanner";
import { SocialsEditor } from "../components/SocialsEditor";
import type { useJsonResource } from "../lib/useJsonResource";

export type SiteFile = { site: Site; stack: Stack };

type Props = {
  resource: ReturnType<typeof useJsonResource<SiteFile>>;
};

export function SitePanel({ resource }: Props) {
  const { data, loading, error, conflict, save, reloadAfterConflict } = resource;

  return (
    <div>
      <h2 className="text-lg font-medium">Site</h2>

      {loading && <p className="mt-4 text-sm text-text-secondary">Memuat data situs…</p>}
      {!loading && error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {conflict && <ConflictBanner onReload={reloadAfterConflict} />}

      {!loading && data && <SiteForm data={data} save={save} />}
    </div>
  );
}

function SiteForm({
  data,
  save,
}: {
  data: SiteFile;
  save: (next: SiteFile, message: string) => Promise<boolean>;
}) {
  const [site, setSite] = useState<Site>(data.site);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSaveStatus(null);

    if (!site.name.trim() || !site.email.trim() || !site.url.trim()) {
      setFormError("Name, email, dan url wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      const saved = await save({ ...data, site }, "admin: perbarui site");
      if (saved) {
        setSaveStatus({ type: "success", message: "Data situs diperbarui." });
      }
    } catch (err) {
      setSaveStatus({ type: "error", message: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 rounded-(--radius) border border-border p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-secondary">Name</span>
          <input
            type="text"
            value={site.name}
            onChange={(e) => setSite({ ...site, name: e.target.value })}
            className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-secondary">Initials</span>
          <input
            type="text"
            value={site.initials}
            onChange={(e) => setSite({ ...site, initials: e.target.value })}
            className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-secondary">Location</span>
          <input
            type="text"
            value={site.location}
            onChange={(e) => setSite({ ...site, location: e.target.value })}
            className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-secondary">Status</span>
          <input
            type="text"
            value={site.status}
            onChange={(e) => setSite({ ...site, status: e.target.value })}
            className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
          <span className="text-text-secondary">Quote</span>
          <input
            type="text"
            value={site.quote}
            onChange={(e) => setSite({ ...site, quote: e.target.value })}
            className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-secondary">Email</span>
          <input
            type="text"
            value={site.email}
            onChange={(e) => setSite({ ...site, email: e.target.value })}
            className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-secondary">WhatsApp (format 62...)</span>
          <input
            type="text"
            value={site.whatsapp}
            onChange={(e) => setSite({ ...site, whatsapp: e.target.value })}
            className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-secondary">CV (path di public/)</span>
          <input
            type="text"
            value={site.cv}
            onChange={(e) => setSite({ ...site, cv: e.target.value })}
            className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-text-secondary">URL situs</span>
          <input
            type="text"
            value={site.url}
            onChange={(e) => setSite({ ...site, url: e.target.value })}
            className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
          />
        </label>

        <SocialsEditor items={site.socials} onChange={(socials) => setSite({ ...site, socials })} />
      </div>

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
