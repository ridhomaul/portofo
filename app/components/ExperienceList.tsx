import { experience } from "@/content/experience";

export default function ExperienceList() {
  return (
    <section id="experience" className="mx-auto max-w-[1080px] px-6 pb-24 md:px-10 md:pb-32">
      <h2 className="display mb-12 text-3xl md:text-4xl">Experience</h2>

      <ol className="flex flex-col gap-11">
        {experience.map((r) => (
          <li key={`${r.org}-${r.period}`} className="grid gap-2 sm:grid-cols-[170px_1fr] sm:gap-8">
            <p className="pt-0.5 text-sm text-text-muted">{r.period}</p>

            <div>
              <h3 className="text-lg font-medium">{r.title}</h3>
              <p className="mt-1 text-sm text-text-secondary">{r.org}</p>
              <p className="text-sm text-text-muted">{r.place}</p>

              {/* Baris inilah pembeda antara CV dan portfolio yang meyakinkan. */}
              {r.note && <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-text-secondary">{r.note}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
