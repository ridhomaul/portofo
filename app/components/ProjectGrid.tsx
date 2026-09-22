import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/content/projects";

export default function ProjectGrid() {
  return (
    <section id="work" className="mx-auto max-w-3xl px-6 pb-20">
      <h2 className="display mb-10 text-3xl">Projects</h2>

      <div className="grid gap-5 sm:grid-cols-2">
        {projects.map((p) => (
          <article
            key={p.slug}
            className="group flex flex-col overflow-hidden rounded-(--radius) border border-dashed border-border"
          >
            <div className="p-2">
              <div className="relative aspect-2/1 overflow-hidden rounded-[10px] bg-surface">
                <Image
                  src={p.image}
                  alt={`${p.name} screenshot`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-1.5 px-5 pt-3 pb-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold">{p.name}</h3>
                {p.inProgress && (
                  <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-[10px] tracking-wider text-text-muted">
                    IN PROGRESS
                  </span>
                )}
              </div>

              <p className="text-xs font-medium text-text-primary">{p.role}</p>
              <p className="line-clamp-3 text-[13px] leading-relaxed text-text-secondary">{p.summary}</p>

              {p.outcome && <p className="text-[13px] leading-relaxed text-text-primary">{p.outcome}</p>}

              <ul className="mt-auto flex flex-wrap gap-1.5 pt-3">
                {p.tech.map((t) => (
                  <li key={t} className="rounded-full border border-border px-2.5 py-0.5 text-[10px] text-text-muted">
                    {t}
                  </li>
                ))}
              </ul>

              {(p.caseStudy || p.href) && (
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4">
                  {p.caseStudy && (
                    <Link
                      href={`/projects/${p.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs tracking-wider text-text-secondary transition-colors hover:text-text-primary"
                    >
                      READ CASE STUDY <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                  {p.href && (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs tracking-wider text-text-secondary transition-colors hover:text-text-primary"
                    >
                      VISIT SITE <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
