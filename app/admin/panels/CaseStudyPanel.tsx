"use client";

import { useState } from "react";
import type { CaseStudy, CaseStudySection, Project } from "@/content/projects";
import { ConflictBanner } from "../components/ConflictBanner";
import { ImagesEditor, type ImageEntry } from "../components/ImagesEditor";
import { StringListEditor } from "../components/StringListEditor";
import { DEPLOY_NOTE, getFileExtension, slugify, uploadImage } from "../lib/github";
import type { useJsonResource } from "../lib/useJsonResource";
import type { RecentUploads } from "../lib/useRecentUploads";
import type { ProjectsFile } from "./ProjectsPanel";

type Props = {
  token: string;
  resource: ReturnType<typeof useJsonResource<ProjectsFile>>;
  recentUploads: RecentUploads;
};

type SectionForm = {
  title: string;
  icon: string;
  images: ImageEntry[];
  description: string;
  points: string[];
};

const inputClass =
  "rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary";

function caseStudyToSections(cs: CaseStudy): SectionForm[] {
  return cs.sections.map((s) => ({
    title: s.title,
    icon: s.icon ?? "",
    images: s.images.map((img) => ({ src: img.src, alt: img.alt, file: null })),
    description: s.description,
    points: s.points,
  }));
}

const EMPTY_SECTION: SectionForm = { title: "", icon: "", images: [], description: "", points: [] };

export function CaseStudyPanel({ token, resource, recentUploads }: Props) {
  const { data, loading, error, conflict, save, reloadAfterConflict } = resource;
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const options: Project[] = data ? [data.featured, ...data.projects] : [];
  const activeSlug = selectedSlug ?? options[0]?.slug ?? null;
  const activeProject = options.find((p) => p.slug === activeSlug) ?? null;

  return (
    <div>
      <h2 className="text-lg font-medium">Case study</h2>
      <p className="mt-2 max-w-[60ch] text-sm text-text-secondary">
        Intro dan sections halaman detail project. Setiap gambar section wajib diupload (bukan link eksternal).
      </p>

      {loading && <p className="mt-4 text-sm text-text-secondary">Memuat projects…</p>}
      {!loading && error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {conflict && <ConflictBanner onReload={reloadAfterConflict} />}

      {!loading && data && options.length > 0 && (
        <>
          <label className="mt-4 flex max-w-sm flex-col gap-1.5 text-sm">
            <span className="text-text-secondary">Project</span>
            <select
              value={activeSlug ?? ""}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className={inputClass}
            >
              {options.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name} ({p.slug})
                </option>
              ))}
            </select>
          </label>

          {activeProject && (
            <CaseStudyForm
              key={activeProject.slug}
              token={token}
              project={activeProject}
              data={data}
              save={save}
              recentUploads={recentUploads}
            />
          )}
        </>
      )}
    </div>
  );
}

function CaseStudyForm({
  token,
  project,
  data,
  save,
  recentUploads,
}: {
  token: string;
  project: Project;
  data: ProjectsFile;
  save: (next: ProjectsFile, message: string) => Promise<boolean>;
  recentUploads: RecentUploads;
}) {
  const [enabled, setEnabled] = useState(Boolean(project.caseStudy));
  const [intro, setIntro] = useState(project.caseStudy?.intro ?? "");
  const [sections, setSections] = useState<SectionForm[]>(
    project.caseStudy ? caseStudyToSections(project.caseStudy) : []
  );
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const updateSection = (i: number, patch: Partial<SectionForm>) => {
    setSections(sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };
  const removeSection = (i: number) => setSections(sections.filter((_, idx) => idx !== i));
  const addSection = () => setSections([...sections, { ...EMPTY_SECTION }]);

  const applyEntry = (nextProject: Project): ProjectsFile => {
    if (nextProject.slug === data.featured.slug) {
      return { ...data, featured: nextProject };
    }
    return { ...data, projects: data.projects.map((p) => (p.slug === project.slug ? nextProject : p)) };
  };

  const handleDisable = async () => {
    const confirmed = window.confirm(
      `Hapus case study "${project.name}"? Ini langsung commit ke repo dan tidak bisa dibatalkan dari sini.`
    );
    if (!confirmed) return;

    const nextProject = { ...project };
    delete nextProject.caseStudy;

    setSaving(true);
    setSaveStatus(null);
    try {
      const saved = await save(applyEntry(nextProject), `admin: hapus case study ${project.name}`);
      if (saved) {
        setEnabled(false);
        setSaveStatus({ type: "success", message: "Case study dihapus." + DEPLOY_NOTE });
      }
    } catch (err) {
      setSaveStatus({ type: "error", message: err instanceof Error ? err.message : "Gagal menghapus." });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSaveStatus(null);

    if (!intro.trim()) {
      setFormError("Intro wajib diisi.");
      return;
    }
    for (const section of sections) {
      if (!section.title.trim() || !section.description.trim()) {
        setFormError("Setiap section wajib punya title dan description.");
        return;
      }
      for (const img of section.images) {
        if (!img.file && !img.src) {
          setFormError(`Section "${section.title}" punya baris gambar yang belum diupload.`);
          return;
        }
      }
    }

    setSaving(true);

    // Upload semua gambar baru dulu (berurutan), baru bangun sections
    // final. Kalau ada satu saja yang gagal, berhenti — JSON tidak disentuh.
    const finalSections: CaseStudySection[] = [];
    try {
      for (const section of sections) {
        const finalImages: { src: string; alt: string }[] = [];
        for (let i = 0; i < section.images.length; i++) {
          const img = section.images[i];
          if (img.file) {
            const ext = getFileExtension(img.file.name);
            const fileName = `${slugify(section.title)}-${i + 1}.${ext}`;
            const finalImagePath = `/projects/${project.slug}/${fileName}`;
            await uploadImage(token, img.file, `public${finalImagePath}`, `admin: upload gambar case study ${project.name}`);
            recentUploads.remember(finalImagePath, img.file);
            finalImages.push({ src: finalImagePath, alt: img.alt });
          } else {
            finalImages.push({ src: img.src, alt: img.alt });
          }
        }
        finalSections.push({
          title: section.title.trim(),
          ...(section.icon.trim() ? { icon: section.icon.trim() } : {}),
          images: finalImages,
          description: section.description.trim(),
          points: section.points.map((p) => p.trim()).filter(Boolean),
        });
      }
    } catch (err) {
      setSaveStatus({
        type: "error",
        message: `Upload gambar gagal, data tidak disimpan. ${err instanceof Error ? err.message : ""}`.trim(),
      });
      setSaving(false);
      return;
    }

    const nextProject: Project = { ...project, caseStudy: { intro: intro.trim(), sections: finalSections } };

    try {
      const saved = await save(applyEntry(nextProject), `admin: perbarui case study ${project.name}`);
      if (saved) {
        setEnabled(true);
        setSaveStatus({ type: "success", message: "Case study disimpan." + DEPLOY_NOTE });
      }
    } catch (err) {
      setSaveStatus({ type: "error", message: err instanceof Error ? err.message : "Gagal menyimpan." });
    } finally {
      setSaving(false);
    }
  };

  if (!enabled) {
    return (
      <div className="mt-4 flex flex-col items-start gap-3 rounded-(--radius) border border-dashed border-border p-6">
        <p className="text-sm text-text-secondary">Project ini belum punya case study.</p>
        <button
          type="button"
          onClick={() => setEnabled(true)}
          className="rounded-full border border-border px-4 py-2 text-xs text-text-secondary transition-colors hover:text-text-primary"
        >
          + Aktifkan case study
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-5 rounded-(--radius) border border-border p-6">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-text-secondary">Intro</span>
        <textarea value={intro} onChange={(e) => setIntro(e.target.value)} rows={3} className={inputClass} />
      </label>

      <div className="flex flex-col gap-4">
        {sections.map((section, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-(--radius) border border-border p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-text-primary">Section {i + 1}</h4>
              <button
                type="button"
                onClick={() => removeSection(i)}
                className="text-xs text-red-600 transition-opacity hover:opacity-70 dark:text-red-400"
              >
                Hapus section
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-text-secondary">Title</span>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(i, { title: e.target.value })}
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-text-secondary">Icon (nama ikon Lucide, opsional)</span>
                <input
                  type="text"
                  value={section.icon}
                  onChange={(e) => updateSection(i, { icon: e.target.value })}
                  placeholder="Contoh: Newspaper"
                  className={inputClass}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="text-text-secondary">Description</span>
              <textarea
                value={section.description}
                onChange={(e) => updateSection(i, { description: e.target.value })}
                rows={3}
                className={inputClass}
              />
            </label>

            <StringListEditor
              label="Points"
              items={section.points}
              onChange={(points) => updateSection(i, { points })}
            />

            <ImagesEditor
              label="Images"
              items={section.images}
              onChange={(images) => updateSection(i, { images })}
              recentUploads={recentUploads}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addSection}
        className="self-start rounded-full border border-border px-4 py-2 text-xs text-text-secondary transition-colors hover:text-text-primary"
      >
        + Tambah section
      </button>

      {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {saving ? "Menyimpan…" : "Simpan case study"}
        </button>

        {project.caseStudy && (
          <button
            type="button"
            onClick={handleDisable}
            disabled={saving}
            className="rounded-full border border-border px-5 py-2.5 text-sm text-red-600 transition-opacity hover:opacity-70 disabled:opacity-50 dark:text-red-400"
          >
            Hapus case study
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
  );
}
