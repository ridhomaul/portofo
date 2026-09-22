import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { featured } from "@/content/projects";

export default function FeaturedBuild() {
  return (
    <section className="mx-auto max-w-3xl px-6 pb-20">
      <article className="grid overflow-hidden rounded-(--radius) border border-dashed border-border md:grid-cols-[5fr_7fr]">
        <div className="flex items-center justify-center bg-black/3 p-5 dark:bg-white/4 md:p-6">
          <div className="w-full overflow-hidden rounded-lg border border-border shadow-sm">
            <Image
              src={featured.image}
              alt={`${featured.name} screenshot`}
              width={1252}
              height={600}
              className="h-auto w-full"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 px-7 py-6 md:px-8 md:py-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-text-muted">Featured build</p>

          <h3 className="display text-2xl">{featured.name}</h3>

          {/* Peran eksplisit. Ini yang bikin klaim terdengar jujur,
              dan justru menaikkan kepercayaan, bukan menurunkannya. */}
          <p className="-mt-1 text-sm text-text-secondary">{featured.role}</p>

          <p className="line-clamp-2 text-[15px] leading-relaxed text-text-secondary">{featured.summary}</p>

          {featured.outcome && (
            <p className="line-clamp-2 text-sm text-text-primary">
              {featured.outcome}
            </p>
          )}

          <ul className="mt-1 flex flex-wrap gap-2">
            {featured.tech.map((t) => (
              <li key={t} className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary">
                {t}
              </li>
            ))}
          </ul>

          {(featured.caseStudy || featured.href) && (
            <a
              href={featured.caseStudy ? `/projects/${featured.slug}` : featured.href}
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
