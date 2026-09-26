"use client";

import { useState } from "react";
import type { Project } from "@/content/projects";
import { ConflictBanner } from "../components/ConflictBanner";
import { ProjectFieldsForm, type ProjectFormState } from "../components/ProjectFieldsForm";
import { DEPLOY_NOTE, getFileExtension, uploadImage } from "../lib/github";
import type { useJsonResource } from "../lib/useJsonResource";
import type { RecentUploads } from "../lib/useRecentUploads";
import type { ProjectsFile } from "./ProjectsPanel";

type Props = {
  token: string;
  resource: ReturnType<typeof useJsonResource<ProjectsFile>>;
  recentUploads: RecentUploads;
};

function projectToForm(p: Project): ProjectFormState {
  return {
    slug: p.slug,
    name: p.name,
    role: p.role,
    summary: p.summary,
    outcome: p.outcome ?? "",
    tech: p.tech,
    href: p.href ?? "",
    imageFit: p.imageFit ?? "cover",
    inProgress: p.inProgress ?? false,
  };
}

function buildProjectFromForm(form: ProjectFormState, base: Project): Project {
  const result: Project = {
    ...base,
    slug: form.slug.trim(),
    name: form.name.trim(),
    role: form.role.trim(),
    summary: form.summary.trim(),
    tech: form.tech.map((t) => t.trim()).filter(Boolean),
  };

  const outcome = form.outcome.trim();
  if (outcome) result.outcome = outcome;
  else delete result.outcome;

  const href = form.href.trim();
  if (href) result.href = href;
  else delete result.href;

  if (form.imageFit === "contain") result.imageFit = "contain";
  else delete result.imageFit;

  if (form.inProgress) result.inProgress = true;
  else delete result.inProgress;

  return result;
}

export function FeaturedProjectPanel({ token, resource, recentUploads }: Props) {
  const { data, loading, error, conflict, save, reloadAfterConflict } = resource;

  return (
    <div>
      <h2 className="text-lg font-medium">Featured project</h2>
      <p className="mt-2 max-w-[60ch] text-sm text-text-secondary">
        Project unggulan yang diberi panggung penuh di atas grid — satu entri saja.
      </p>

      {loading && <p className="mt-4 text-sm text-text-secondary">Memuat featured project…</p>}
      {!loading && error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {conflict && <ConflictBanner onReload={reloadAfterConflict} />}

      {!loading && data && <FeaturedForm token={token} data={data} save={save} recentUploads={recentUploads} />}
    </div>
  );
}

function FeaturedForm({
  token,
  data,
  save,
  recentUploads,
}: {
  token: string;
  data: ProjectsFile;
  save: (next: ProjectsFile, message: string) => Promise<boolean>;
  recentUploads: RecentUploads;
}) {
  const [form, setForm] = useState<ProjectFormState>(projectToForm(data.featured));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSaveStatus(null);

    if (!form.slug.trim() || !form.name.trim() || !form.role.trim() || !form.summary.trim()) {
      setFormError("Slug, name, role, dan summary wajib diisi.");
      return;
    }

    if (data.projects.some((p) => p.slug === form.slug.trim())) {
      setFormError("Slug sudah dipakai project lain.");
      return;
    }

    let entry = buildProjectFromForm(form, data.featured);
    setSaving(true);

    if (selectedFile) {
      const fileName = `${entry.slug}.${getFileExtension(selectedFile.name)}`;
      const finalImagePath = `/projects/${fileName}`;
      try {
        await uploadImage(token, selectedFile, `public${finalImagePath}`, `admin: upload gambar featured project ${entry.name}`);
      } catch (err) {
        setSaveStatus({
          type: "error",
          message: `Upload gambar gagal, data tidak disimpan. ${err instanceof Error ? err.message : ""}`.trim(),
        });
        setSaving(false);
        return;
      }
      recentUploads.remember(finalImagePath, selectedFile);
      entry = { ...entry, image: finalImagePath };
    }

    try {
      const saved = await save({ ...data, featured: entry }, "admin: perbarui featured project");
      if (saved) {
        setSaveStatus({ type: "success", message: "Featured project diperbarui." + DEPLOY_NOTE });
        setSelectedFile(null);
      }
    } catch (err) {
      setSaveStatus({ type: "error", message: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 rounded-(--radius) border border-border p-6">
      <ProjectFieldsForm
        form={form}
        onChange={setForm}
        currentImage={recentUploads.get(data.featured.image) ?? (data.featured.image || null)}
        file={selectedFile}
        onFileChange={setSelectedFile}
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
