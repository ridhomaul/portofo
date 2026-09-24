"use client";

import { ImageUploadField } from "./ImageUploadField";
import { StringListEditor } from "./StringListEditor";

export type ProjectFormState = {
  slug: string;
  name: string;
  role: string;
  summary: string;
  outcome: string;
  tech: string[];
  href: string;
  imageFit: "cover" | "contain";
  inProgress: boolean;
};

type Props = {
  form: ProjectFormState;
  onChange: (form: ProjectFormState) => void;
  currentImage: string | null;
  file: File | null;
  onFileChange: (file: File | null) => void;
  slugEditable?: boolean;
};

const inputClass =
  "rounded-(--radius-sm) border border-border bg-transparent px-3 py-2 text-text-primary outline-none focus-visible:border-text-primary disabled:opacity-50";

// Field yang sama dipakai untuk Projects (list) dan Featured project
// (satu entri) — beda cuma slugEditable dan tempat state-nya disimpan.
export function ProjectFieldsForm({ form, onChange, currentImage, file, onFileChange, slugEditable = true }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-text-secondary">Slug (dipakai untuk URL dan nama file gambar)</span>
        <input
          type="text"
          value={form.slug}
          disabled={!slugEditable}
          onChange={(e) => onChange({ ...form, slug: e.target.value })}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-text-secondary">Name</span>
        <input type="text" value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-text-secondary">Role</span>
        <input type="text" value={form.role} onChange={(e) => onChange({ ...form, role: e.target.value })} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
        <span className="text-text-secondary">Summary</span>
        <input type="text" value={form.summary} onChange={(e) => onChange({ ...form, summary: e.target.value })} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
        <span className="text-text-secondary">Outcome (opsional — hasil terukur, kosongkan kalau belum ada)</span>
        <input type="text" value={form.outcome} onChange={(e) => onChange({ ...form, outcome: e.target.value })} className={inputClass} />
      </label>

      <StringListEditor
        label="Tech"
        items={form.tech}
        onChange={(tech) => onChange({ ...form, tech })}
        placeholder="Contoh: Next.js"
      />

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-text-secondary">Href (opsional — link eksternal)</span>
        <input type="text" value={form.href} onChange={(e) => onChange({ ...form, href: e.target.value })} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-text-secondary">Image fit</span>
        <select
          value={form.imageFit}
          onChange={(e) => onChange({ ...form, imageFit: e.target.value as "cover" | "contain" })}
          className={inputClass}
        >
          <option value="cover">cover</option>
          <option value="contain">contain</option>
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input
          type="checkbox"
          checked={form.inProgress}
          onChange={(e) => onChange({ ...form, inProgress: e.target.checked })}
          className="h-4 w-4"
        />
        <span className="text-text-secondary">In progress</span>
      </label>

      <ImageUploadField
        label="Gambar (PNG/JPG/WEBP, maks 2 MB)"
        currentImage={currentImage}
        file={file}
        onChange={onFileChange}
      />
    </div>
  );
}
