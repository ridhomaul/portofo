import type { IconType } from "react-icons";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiGreensock,
  SiPhp,
  SiLaravel,
  SiPython,
  SiPostgresql,
  SiMysql,
  SiSupabase,
  SiDocker,
  SiFigma,
} from "react-icons/si";
import { stack } from "@/content/site";

/**
 * "Premiere Pro" sengaja tidak dipetakan: react-icons/si (Simple Icons)
 * versi terpasang tidak punya ikon Adobe sama sekali. Jatuh ke fallback
 * titik di bawah, bukan crash seperti dulu waktu pakai lucide.
 */
const ICONS: Record<string, IconType> = {
  React: SiReact,
  "Next.js": SiNextdotjs,
  TypeScript: SiTypescript,
  "Tailwind CSS": SiTailwindcss,
  GSAP: SiGreensock,
  PHP: SiPhp,
  Laravel: SiLaravel,
  Python: SiPython,
  PostgreSQL: SiPostgresql,
  MySQL: SiMysql,
  Supabase: SiSupabase,
  Docker: SiDocker,
  Figma: SiFigma,
};

function Chip({ name }: { name: string }) {
  const Icon = ICONS[name];
  return (
    <span className="mx-2.5 inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-secondary">
      {Icon ? (
        <Icon className="h-4 w-4 text-text-secondary" aria-hidden="true" />
      ) : (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-text-secondary" aria-hidden="true" />
      )}
      {name}
    </span>
  );
}

function MarqueeRow({ items, direction }: { items: string[]; direction: "left" | "right" }) {
  // Track diduplikasi 2x supaya loop-nya mulus (animasi geser tepat 50%).
  const looped = [...items, ...items];
  return (
    <div className="overflow-hidden motion-reduce:overflow-x-auto motion-reduce:[scrollbar-width:thin]">
      <div
        className={`flex w-max py-1 ${
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        } hover:[animation-play-state:paused] motion-reduce:animate-none`}
      >
        {looped.map((name, i) => (
          <Chip key={`${name}-${i}`} name={name} />
        ))}
      </div>
    </div>
  );
}

export default function StackGrid() {
  const flat = Object.values(stack).flat();
  const mid = Math.ceil(flat.length / 2);
  const row1 = flat.slice(0, mid);
  const row2 = flat.slice(mid);

  return (
    <section className="pb-20">
      <h2 className="display mx-auto mb-10 max-w-3xl px-6 text-3xl">Stack</h2>

      <div className="relative left-1/2 w-screen -translate-x-1/2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex flex-col gap-4">
          <MarqueeRow items={row1} direction="left" />
          <MarqueeRow items={row2} direction="right" />
        </div>
      </div>
    </section>
  );
}
