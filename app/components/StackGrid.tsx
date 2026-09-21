import { stack } from "@/content/site";

/**
 * Grid statis berkelompok, bukan marquee berjalan.
 * Marquee membuat nama tool tidak sempat terbaca, dan ikon tanpa label
 * tidak menyampaikan informasi apa pun — hanya dekorasi yang makan tempat.
 */
export default function StackGrid() {
  return (
    <section className="mx-auto max-w-270 px-6 pb-24 md:px-10 md:pb-32">
      <h2 className="display mb-12 text-3xl md:text-4xl">Stack</h2>

      <dl className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(stack).map(([group, items]) => (
          <div key={group}>
            <dt className="mb-4 border-b border-border pb-3 text-sm text-text-muted">{group}</dt>
            <dd>
              <ul className="flex flex-col gap-2.5">
                {items.map((t) => (
                  <li key={t} className="text-sm text-text-secondary">{t}</li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
