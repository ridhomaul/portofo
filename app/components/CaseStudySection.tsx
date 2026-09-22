import { Newspaper, Mic, LayoutGrid, Check, type LucideIcon } from "lucide-react";
import type { CaseStudySection as CaseStudySectionData } from "@/content/projects";
import CaseStudyCarousel from "./CaseStudyCarousel";

// Map kecil nama ikon (string di content/) -> komponen lucide. Nama yang
// tidak ada di sini (atau tidak diisi) jatuh ke LayoutGrid.
const ICONS: Record<string, LucideIcon> = {
  Newspaper,
  Mic,
};

export default function CaseStudySection({ section }: { section: CaseStudySectionData }) {
  const Icon = (section.icon && ICONS[section.icon]) || LayoutGrid;

  return (
    <section className="rounded-(--radius) border border-dashed border-border p-6 md:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/5 dark:bg-white/8">
          <Icon className="h-4.5 w-4.5 text-text-primary" aria-hidden="true" />
        </span>
        <h2 className="text-lg font-medium">{section.title}</h2>
      </div>

      <div className="mt-6">
        <CaseStudyCarousel images={section.images} />
      </div>

      <p className="mt-6 text-[15px] leading-relaxed text-text-secondary">{section.description}</p>

      <ul className="mt-4 flex flex-col gap-2">
        {section.points.map((point) => (
          <li key={point} className="flex items-start gap-2.5 text-sm text-text-secondary">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-500" aria-hidden="true" />
            {point}
          </li>
        ))}
      </ul>
    </section>
  );
}
