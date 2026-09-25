"use client";

import { useState } from "react";
import type { Project } from "@/content/projects";
import { ConflictBanner } from "../components/ConflictBanner";
import { ProjectFieldsForm, type ProjectFormState } from "../components/ProjectFieldsForm";
import { getFileExtension, uploadImage } from "../lib/github";
import type { useJsonResource } from "../lib/useJsonResource";

export type ProjectsFile = { featured: Project; projects: Project[] };

type Props = {
  token: string;
  resource: ReturnType<typeof useJsonResource<ProjectsFile>>;
};

const EMPTY_FORM: ProjectFormState = {
  slug: "",
  name: "",
  role: "",
  summary: "",
  outcome: "",
  tech: [],
  href: "",
  imageFit: "cover",
  inProgress: false,
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

// `base` dipertahankan supaya field yang tidak dikelola form ini —
// `image` (kalau tidak diganti) dan `caseStudy` — tidak ikut hilang.
function buildProjectFromForm(form: ProjectFormState, base?: Project): Project {
  const result: Project = {
    ...base,
    slug: form.slug.trim(),
    name: form.name.trim(),
    role: form.role.trim(),
    summary: form.summary.trim(),
    tech: form.tech.map((t) => t.trim()).filter(Boolean),
    image: base?.image ?? "",
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

export function ProjectsPanel({ token, resource }: Props) {
  const { data, loading, error, conflict, save, reloadAfterConflict } = resource;
  const projects = data?.projects ?? null;

  const [form, setForm] = useState<ProjectFormState>(EMPTY_FORM);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [reorderingIndex, setReorderingIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const busy = saving || deletingIndex !== null || reorderingIndex !== null;

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingIndex(null);
    setSelectedFile(null);
    setCurrentImage(null);
  };

  const handleEditClick = (index: number) => {
    const project = projects?.[index];
    if (!project) return;
    setEditingIndex(index);
    setForm(projectToForm(project));
    setSelectedFile(null);
    setCurrentImage(project.image || null);
    setFormError(null);
    setSaveStatus(null);
  };

  const handleCancelEdit = () => {
    resetForm();
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSaveStatus(null);

    if (!form.slug.trim() || !form.name.trim() || !form.role.trim() || !form.summary.trim()) {
      setFormError("Slug, name, role, dan summary wajib diisi.");
      return;
    }

    if (!projects || !data) {
      setFormError("Data projects belum siap — coba muat ulang.");
      return;
    }

    const isEditing = editingIndex !== null;
    const base = isEditing ? projects[editingIndex] : undefined;

    if (!isEditing && !selectedFile) {
      setFormError("Gambar wajib diisi untuk project baru.");
      return;
    }

    const duplicateSlug = projects.some(
      (p, i) => p.slug === form.slug.trim() && i !== editingIndex
    );
    if (duplicateSlug || form.slug.trim() === data.featured.slug) {
      setFormError("Slug sudah dipakai project lain.");
      return;
    }

    let entry = buildProjectFromForm(form, base);

    setSaving(true);

    if (selectedFile) {
      const fileName = `${entry.slug}.${getFileExtension(selectedFile.name)}`;
      const imagePath = `public/projects/${fileName}`;
      try {
        await uploadImage(token, selectedFile, imagePath, `admin: upload gambar project ${entry.name}`);
      } catch (err) {
        setSaveStatus({
          type: "error",
          message: `Upload gambar gagal, data tidak disimpan. ${err instanceof Error ? err.message : ""}`.trim(),
        });
        setSaving(false);
        return;
      }
      entry = { ...entry, image: `/projects/${fileName}` };
    }

    const nextList = isEditing ? projects.map((p, i) => (i === editingIndex ? entry : p)) : [...projects, entry];

    const message = isEditing ? `admin: perbarui project ${entry.name}` : `admin: tambah project ${entry.name}`;

    try {
      const saved = await save({ ...data, projects: nextList }, message);
      if (saved) {
        setSaveStatus({ type: "success", message: isEditing ? "Project diperbarui." : "Project ditambahkan." });
        resetForm();
      }
    } catch (err) {
      setSaveStatus({ type: "error", message: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!projects || !data) return;
    const target = projects[index];
    const confirmed = window.confirm(
      `Hapus project "${target.name}"? Ini langsung commit ke repo dan tidak bisa dibatalkan dari sini.`
    );
    if (!confirmed) return;

    const nextList = projects.filter((_, i) => i !== index);
    const message = `admin: hapus project ${target.name}`;

    setDeletingIndex(index);
    setSaveStatus(null);
    try {
      const saved = await save({ ...data, projects: nextList }, message);
      if (saved) {
        setSaveStatus({ type: "success", message: "Project dihapus." });
        if (editingIndex === index) resetForm();
      }
    } catch (err) {
      setSaveStatus({ type: "error", message: err instanceof Error ? err.message : "Gagal menghapus." });
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    if (!projects || !data) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const nextList = [...projects];
    [nextList[index], nextList[targetIndex]] = [nextList[targetIndex], nextList[index]];

    setReorderingIndex(index);
    setSaveStatus(null);
    try {
      const saved = await save({ ...data, projects: nextList }, "admin: ubah urutan project");
      if (!saved) return;
      if (editingIndex === index) setEditingIndex(targetIndex);
      else if (editingIndex === targetIndex) setEditingIndex(index);
    } catch (err) {
      setSaveStatus({ type: "error", message: err instanceof Error ? err.message : "Gagal mengubah urutan." });
    } finally {
      setReorderingIndex(null);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium">Projects</h2>

      {loading && <p className="mt-4 text-sm text-text-secondary">Memuat projects…</p>}
      {!loading && error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {!loading && !error && projects && projects.length === 0 && (
        <p className="mt-4 text-sm text-text-secondary">Belum ada project.</p>
      )}

      {!loading && !error && projects && projects.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-(--radius) border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Case study</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {projects.map((project, i) => (
                <tr key={`${project.slug}-${i}`} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    {project.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.image}
                        alt=""
                        className="h-10 w-10 rounded-(--radius-sm) border border-border object-cover"
                      />
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-primary">{project.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{project.slug}</td>
                  <td className="px-4 py-3 text-text-secondary">{project.caseStudy ? "Ya" : "—"}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleMove(i, -1)}
                      disabled={busy || i === 0}
                      className="text-xs text-text-secondary transition-colors hover:text-text-primary disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(i, 1)}
                      disabled={busy || i === projects.length - 1}
                      className="ml-2 text-xs text-text-secondary transition-colors hover:text-text-primary disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditClick(i)}
                      disabled={busy}
                      className="ml-3 text-xs text-text-secondary transition-colors hover:text-text-primary disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(i)}
                      disabled={busy}
                      className="ml-3 text-xs text-red-600 transition-opacity hover:opacity-70 disabled:opacity-50 dark:text-red-400"
                    >
                      {deletingIndex === i ? "Menghapus…" : "Hapus"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {conflict && <ConflictBanner onReload={reloadAfterConflict} />}

      {projects && (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 rounded-(--radius) border border-dashed border-border p-6">
          <h3 className="text-sm font-medium text-text-primary">
            {editingIndex !== null ? "Edit project" : "Tambah project"}
          </h3>

          <ProjectFieldsForm
            form={form}
            onChange={setForm}
            currentImage={currentImage}
            file={selectedFile}
            onFileChange={setSelectedFile}
          />

          {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {saving ? "Menyimpan…" : editingIndex !== null ? "Simpan perubahan" : "Tambah project"}
            </button>

            {editingIndex !== null && (
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={busy}
                className="rounded-full border border-border px-5 py-2.5 text-sm text-text-secondary transition-colors hover:text-text-primary disabled:opacity-50"
              >
                Batal
              </button>
            )}
          </div>

          {saveStatus && (
            <p
              className={`text-sm ${saveStatus.type === "success" ? "text-text-primary" : "text-red-600 dark:text-red-400"}`}
            >
              {saveStatus.message}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
