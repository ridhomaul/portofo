import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { featured } from "@/content/projects";

export default function FeaturedBuild() {
  return (
    <section className="mx-auto max-w-3xl px-6 pb-20">
      <article className="grid overflow-hidden rounded-(--radius) border border-dashed border-border md:grid-cols-[5fr_7fr]">
        <div className="relative aspect-4/3 bg-surface md:aspect-auto">
          <Image src={featured.image} alt={`${featured.name} screenshot`} fill className="object-cover" />
        </div>

        <div className="flex flex-col justify-center gap-3 p-7 md:p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-text-muted">Featured build</p>

          <h3 className="display text-2xl md:text-3xl">{featured.name}</h3>

          {/* Peran eksplisit. Ini yang bikin klaim terdengar jujur,
              dan justru menaikkan kepercayaan, bukan menurunkannya. */}
          <p className="-mt-1 text-sm text-text-secondary">{featured.role}</p>

          <p className="text-[15px] leading-relaxed text-text-secondary">{featured.summary}</p>

          {featured.outcome && (
            <p className="text-sm text-text-primary">
              {featured.outcome}
            </p>
          )}

          <ul className="flex flex-wrap gap-2 pt-1">
            {featured.tech.map((t) => (
              <li key={t} className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary">
                {t}
              </li>
            ))}
          </ul>

          {(featured.caseStudy || featured.href) && (
            <a
              href={featured.caseStudy ?? featured.href}
              className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-85"
            >
              {featured.caseStudy ? "Read case study" : "Visit site"}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </article>
    </section>
  );
}
