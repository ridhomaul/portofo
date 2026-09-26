"use client";

import { useState } from "react";
import { ConflictBanner } from "../components/ConflictBanner";
import { StackEditor } from "../components/StackEditor";
import type { useJsonResource } from "../lib/useJsonResource";
import type { SiteFile } from "./SitePanel";

type Props = {
  resource: ReturnType<typeof useJsonResource<SiteFile>>;
};

export function StackPanel({ resource }: Props) {
  const { data, loading, error, conflict, save, reloadAfterConflict } = resource;

  return (
    <div>
      <h2 className="text-lg font-medium">Stack</h2>

      {loading && <p className="mt-4 text-sm text-text-secondary">Memuat stack…</p>}
      {!loading && error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {conflict && <ConflictBanner onReload={reloadAfterConflict} />}

      {!loading && data && <StackForm data={data} save={save} />}
    </div>
  );
}

function StackForm({
  data,
  save,
}: {
  data: SiteFile;
  save: (next: SiteFile, message: string) => Promise<boolean>;
}) {
  const [stack, setStack] = useState(data.stack);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSave = async () => {
    setSaveStatus(null);
    setSaving(true);
    try {
      const saved = await save({ ...data, stack }, "admin: perbarui stack");
      if (saved) {
        setSaveStatus({ type: "success", message: "Stack diperbarui." });
      }
    } catch (err) {
      setSaveStatus({ type: "error", message: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-4 rounded-(--radius) border border-border p-6">
      <StackEditor stack={stack} onChange={setStack} />

      <div>
        <button
          type="button"
          onClick={handleSave}
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
    </div>
  );
}
