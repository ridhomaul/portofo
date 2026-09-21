import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/content/projects";

export default function ProjectGrid() {
  return (
    <section id="work" className="mx-auto max-w-[1080px] px-6 pb-24 md:px-10 md:pb-32">
      <h2 className="display mb-12 text-3xl md:text-4xl">Projects</h2>

      <div className="grid gap-6 sm:grid-cols-2">
        {projects.map((p) => (
          <article
            key={p.slug}
            className="group flex flex-col overflow-hidden rounded-[var(--radius)] border border-border"
          >
            <div className="relative aspect-[16/10] bg-surface">
              <Image
                src={p.image}
                alt={`${p.name} screenshot`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>

            <div className="flex flex-1 flex-col gap-3 p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-medium">{p.name}</h3>
                {p.inProgress && (
                  <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-[10px] tracking-wider text-text-muted">
                    IN PROGRESS
                  </span>
                )}
              </div>

              <p className="text-sm text-text-secondary">{p.role}</p>
              <p className="text-sm leading-relaxed text-text-secondary">{p.summary}</p>

              {p.outcome && <p className="text-sm leading-relaxed text-text-primary">{p.outcome}</p>}

              <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
                {p.tech.map((t) => (
                  <li key={t} className="rounded-full border border-border px-3 py-1 text-[11px] text-text-muted">
                    {t}
                  </li>
                ))}
              </ul>

              {p.href && (
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 border-t border-border pt-4 text-xs tracking-wider text-text-secondary transition-colors hover:text-text-primary"
                >
                  VISIT SITE <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
