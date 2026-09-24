"use client";

import { useState } from "react";
import type { Role } from "@/content/experience";
import { ConflictBanner } from "../components/ConflictBanner";
import type { useJsonResource } from "../lib/useJsonResource";

export type ExperienceFile = { experience: Role[] };

type Props = {
  resource: ReturnType<typeof useJsonResource<ExperienceFile>>;
};

type RoleForm = {
  period: string;
  title: string;
  org: string;
  place: string;
  note: string;
};

const EMPTY_FORM: RoleForm = { period: "", title: "", org: "", place: "", note: "" };

function buildRoleFromForm(form: RoleForm): Role {
  const result: Role = {
    period: form.period.trim(),
    title: form.title.trim(),
    org: form.org.trim(),
    place: form.place.trim(),
  };
  const note = form.note.trim();
  if (note) result.note = note;
  return result;
}

export function ExperiencePanel({ resource }: Props) {
  const { data, loading, error, conflict, save, reloadAfterConflict } = resource;
  const experience = data?.experience ?? null;

  const [form, setForm] = useState<RoleForm>(EMPTY_FORM);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const busy = saving || deletingIndex !== null;

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingIndex(null);
  };

  const handleEditClick = (index: number) => {
    const role = experience?.[index];
    if (!role) return;
    setEditingIndex(index);
    setForm({ period: role.period, title: role.title, org: role.org, place: role.place, note: role.note ?? "" });
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

    if (!form.period.trim() || !form.title.trim() || !form.org.trim() || !form.place.trim()) {
      setFormError("Period, title, org, dan place wajib diisi.");
      return;
    }

    if (!experience) {
      setFormError("Data experience belum siap — coba muat ulang.");
      return;
    }

    const isEditing = editingIndex !== null;
    const entry = buildRoleFromForm(form);

    const nextList = isEditing
      ? experience.map((r, i) => (i === editingIndex ? entry : r))
      : [...experience, entry];

    const message = isEditing ? `admin: perbarui experience ${entry.title}` : `admin: tambah experience ${entry.title}`;

    setSaving(true);
    try {
      const saved = await save({ experience: nextList }, message);
      if (saved) {
        setSaveStatus({ type: "success", message: isEditing ? "Experience diperbarui." : "Experience ditambahkan." });
        resetForm();
      }
    } catch (err) {
      setSaveStatus({ type: "error", message: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!experience) return;
    const target = experience[index];
    const confirmed = window.confirm(
      `Hapus experience "${target.title}"? Ini langsung commit ke repo dan tidak bisa dibatalkan dari sini.`
    );
    if (!confirmed) return;

    const nextList = experience.filter((_, i) => i !== index);
    const message = `admin: hapus experience ${target.title}`;

    setDeletingIndex(index);
    setSaveStatus(null);
    try {
      const saved = await save({ experience: nextList }, message);
      if (saved) {
        setSaveStatus({ type: "success", message: "Experience dihapus." });
        if (editingIndex === index) resetForm();
      }
    } catch (err) {
      setSaveStatus({ type: "error", message: err instanceof Error ? err.message : "Gagal menghapus." });
    } finally {
      setDeletingIndex(null);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium">Experience</h2>

      {loading && <p className="mt-4 text-sm text-text-secondary">Memuat experience…</p>}
      {!loading && error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {!loading && !error && experience && experience.length === 0 && (
        <p className="mt-4 text-sm text-text-secondary">Belum ada experience.</p>
      )}

      {!loading && !error && experience && experience.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-(--radius) border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="px-4 py-3 font-medium">Period</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Org</th>
                <th className="px-4 py-3 font-medium">Place</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {experience.map((role, i) => (
                <tr key={`${role.title}-${i}`} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-text-secondary">{role.period}</td>
                  <td className="px-4 py-3 text-text-primary">{role.title}</td>
                  <td className="px-4 py-3 text-text-secondary">{role.org}</td>
                  <td className="px-4 py-3 text-text-secondary">{role.place}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleEditClick(i)}
                      disabled={busy}
                      className="text-xs text-text-secondary transition-colors hover:text-text-primary disabled:opacity-50"
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

      {experience && (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 rounded-(--radius) border border-dashed border-border p-6">
          <h3 className="text-sm font-medium text-text-primary">
            {editingIndex !== null ? "Edit experience" : "Tambah experience"}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-text-secondary">Period</span>
              <input
                type="text"
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                placeholder="Contoh: 2024 — Present"
                className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-text-secondary">Title</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-text-secondary">Org</span>
              <input
                type="text"
                value={form.org}
                onChange={(e) => setForm({ ...form, org: e.target.value })}
                className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-text-secondary">Place</span>
              <input
                type="text"
                value={form.place}
                onChange={(e) => setForm({ ...form, place: e.target.value })}
                className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
              <span className="text-text-secondary">Note (opsional — satu baris pencapaian terukur)</span>
              <input
                type="text"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Contoh: Led production of 2,000+ pieces over two years."
                className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
              />
            </label>
          </div>

          {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {saving ? "Menyimpan…" : editingIndex !== null ? "Simpan perubahan" : "Tambah experience"}
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
