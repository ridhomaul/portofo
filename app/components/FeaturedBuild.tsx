import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { featured } from "@/content/projects";

export default function FeaturedBuild() {
  return (
    <section className="mx-auto max-w-270 px-6 pb-24 md:px-10 md:pb-32">
      <article className="grid overflow-hidden rounded-(--radius) border border-border md:grid-cols-2">
        <div className="relative aspect-4/3 bg-surface md:aspect-auto md:min-h-85">
          <Image src={featured.image} alt={`${featured.name} screenshot`} fill className="object-cover" />
        </div>

        <div className="flex flex-col justify-center gap-5 p-8 md:p-11">
          <p className="text-xs tracking-[0.14em] text-text-muted">Featured build</p>

          <h3 className="display text-3xl md:text-4xl">{featured.name}</h3>

          {/* Peran eksplisit. Ini yang bikin klaim terdengar jujur,
              dan justru menaikkan kepercayaan, bukan menurunkannya. */}
          <p className="text-sm text-text-secondary">{featured.role}</p>

          <p className="text-base leading-relaxed text-text-secondary">{featured.summary}</p>

          {featured.outcome && (
            <p className="border-l-2 border-border pl-4 text-base leading-relaxed text-text-primary">
              {featured.outcome}
            </p>
          )}

          <ul className="flex flex-wrap gap-2 pt-1">
            {featured.tech.map((t) => (
              <li key={t} className="rounded-full border border-border px-3.5 py-1.5 text-xs text-text-secondary">
                {t}
              </li>
            ))}
          </ul>

          {(featured.caseStudy || featured.href) && (
            <a
              href={featured.caseStudy ?? featured.href}
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-85"
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
