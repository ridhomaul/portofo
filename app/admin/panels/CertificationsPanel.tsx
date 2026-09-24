"use client";

import { useState } from "react";
import type { Certification } from "@/content/certifications";
import { ConflictBanner } from "../components/ConflictBanner";
import { ImageUploadField } from "../components/ImageUploadField";
import { getFileExtension, slugify, uploadImage } from "../lib/github";
import type { useJsonResource } from "../lib/useJsonResource";

export type CertificationsFile = { certifications: Certification[] };

type Props = {
  token: string;
  resource: ReturnType<typeof useJsonResource<CertificationsFile>>;
};

type CertificationForm = {
  date: string;
  title: string;
  issuer: string;
  credentialId: string;
  url: string;
};

const EMPTY_FORM: CertificationForm = { date: "", title: "", issuer: "", credentialId: "", url: "" };

// `base` (kalau ada, saat edit) dipertahankan supaya field yang tidak
// dikelola form ini — mis. `image`, kalau entri itu sudah punya —
// tidak ikut hilang.
function buildCertificationFromForm(form: CertificationForm, base?: Certification): Certification {
  const result: Certification = {
    ...base,
    date: form.date.trim(),
    title: form.title.trim(),
    issuer: form.issuer.trim(),
  };

  const credentialId = form.credentialId.trim();
  if (credentialId) {
    result.credentialId = credentialId;
  } else {
    delete result.credentialId;
  }

  const url = form.url.trim();
  if (url) {
    result.url = url;
  } else {
    delete result.url;
  }

  return result;
}

export function CertificationsPanel({ token, resource }: Props) {
  const { data, loading, error, conflict, save, reloadAfterConflict } = resource;
  const certifications = data?.certifications ?? null;

  const [form, setForm] = useState<CertificationForm>(EMPTY_FORM);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const busy = saving || deletingIndex !== null;

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingIndex(null);
    setSelectedFile(null);
    setCurrentImage(null);
  };

  const handleEditClick = (index: number) => {
    const cert = certifications?.[index];
    if (!cert) return;
    setEditingIndex(index);
    setForm({
      date: cert.date,
      title: cert.title,
      issuer: cert.issuer,
      credentialId: cert.credentialId ?? "",
      url: cert.url ?? "",
    });
    setSelectedFile(null);
    setCurrentImage(cert.image ?? null);
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

    if (!form.date.trim() || !form.title.trim() || !form.issuer.trim()) {
      setFormError("Date, title, dan issuer wajib diisi.");
      return;
    }

    if (!certifications) {
      setFormError("Data sertifikat belum siap — coba muat ulang.");
      return;
    }

    const isEditing = editingIndex !== null;
    const base = isEditing ? certifications[editingIndex] : undefined;
    let entry = buildCertificationFromForm(form, base);

    setSaving(true);

    // Urutan wajib: gambar dulu, JSON baru disimpan kalau gambar
    // berhasil (atau tidak ada gambar baru sama sekali). Kalau upload
    // gagal, berhenti di sini — JSON tidak disentuh.
    if (selectedFile) {
      const fileName = `${slugify(entry.title)}.${getFileExtension(selectedFile.name)}`;
      const imagePath = `public/certificates/${fileName}`;
      try {
        await uploadImage(token, selectedFile, imagePath, `admin: upload gambar sertifikat ${entry.title}`);
      } catch (err) {
        setSaveStatus({
          type: "error",
          message: `Upload gambar gagal, JSON tidak disimpan. ${err instanceof Error ? err.message : ""}`.trim(),
        });
        setSaving(false);
        return;
      }
      entry = { ...entry, image: `/certificates/${fileName}` };
    }

    const nextList = isEditing
      ? certifications.map((c, i) => (i === editingIndex ? entry : c))
      : [...certifications, entry];

    const message = isEditing
      ? `admin: perbarui sertifikat ${entry.title}`
      : `admin: tambah sertifikat ${entry.title}`;

    try {
      const saved = await save({ certifications: nextList }, message);
      if (saved) {
        setSaveStatus({ type: "success", message: isEditing ? "Sertifikat diperbarui." : "Sertifikat ditambahkan." });
        resetForm();
      }
    } catch (err) {
      setSaveStatus({ type: "error", message: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!certifications) return;
    const target = certifications[index];
    const confirmed = window.confirm(
      `Hapus sertifikat "${target.title}"? Ini langsung commit ke repo dan tidak bisa dibatalkan dari sini.`
    );
    if (!confirmed) return;

    const nextList = certifications.filter((_, i) => i !== index);
    const message = `admin: hapus sertifikat ${target.title}`;

    setDeletingIndex(index);
    setSaveStatus(null);
    try {
      const saved = await save({ certifications: nextList }, message);
      if (saved) {
        setSaveStatus({ type: "success", message: "Sertifikat dihapus." });
        if (editingIndex === index) {
          resetForm();
        }
      }
    } catch (err) {
      setSaveStatus({ type: "error", message: err instanceof Error ? err.message : "Gagal menghapus." });
    } finally {
      setDeletingIndex(null);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium">Certifications</h2>

      {loading && <p className="mt-4 text-sm text-text-secondary">Memuat sertifikat…</p>}

      {!loading && error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {!loading && !error && certifications && certifications.length === 0 && (
        <p className="mt-4 text-sm text-text-secondary">Belum ada sertifikat.</p>
      )}

      {!loading && !error && certifications && certifications.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-(--radius) border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Issuer</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {certifications.map((cert, i) => (
                <tr key={`${cert.title}-${i}`} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    {cert.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cert.image}
                        alt=""
                        className="h-10 w-10 rounded-(--radius-sm) border border-border object-cover"
                      />
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{cert.date}</td>
                  <td className="px-4 py-3 text-text-primary">{cert.title}</td>
                  <td className="px-4 py-3 text-text-secondary">{cert.issuer}</td>
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

      {certifications && (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 rounded-(--radius) border border-dashed border-border p-6">
          <h3 className="text-sm font-medium text-text-primary">
            {editingIndex !== null ? "Edit sertifikat" : "Tambah sertifikat"}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-text-secondary">Date</span>
              <input
                type="text"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="Contoh: Mar 2026"
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
              <span className="text-text-secondary">Issuer</span>
              <input
                type="text"
                value={form.issuer}
                onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-text-secondary">Credential ID (opsional)</span>
              <input
                type="text"
                value={form.credentialId}
                onChange={(e) => setForm({ ...form, credentialId: e.target.value })}
                className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
              <span className="text-text-secondary">Verification URL (opsional)</span>
              <input
                type="text"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary"
              />
            </label>

            <ImageUploadField
              label="Gambar (opsional, PNG/JPG/WEBP, maks 2 MB)"
              currentImage={currentImage}
              file={selectedFile}
              onChange={setSelectedFile}
            />
          </div>

          {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {saving ? "Menyimpan…" : editingIndex !== null ? "Simpan perubahan" : "Tambah sertifikat"}
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
