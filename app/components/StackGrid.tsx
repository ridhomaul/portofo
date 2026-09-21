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
 * Warna merek asli lewat prop `color`. Next.js dikecualikan (logonya
 * hitam) — tanpa `color` di sini, jadi jatuh ke class text-text-primary
 * di Chip supaya tetap kelihatan di dark mode.
 */
const ICONS: Record<string, { Icon: IconType; color?: string }> = {
  React: { Icon: SiReact, color: "#61DAFB" },
  "Next.js": { Icon: SiNextdotjs },
  TypeScript: { Icon: SiTypescript, color: "#3178C6" },
  "Tailwind CSS": { Icon: SiTailwindcss, color: "#06B6D4" },
  GSAP: { Icon: SiGreensock, color: "#88CE02" },
  PHP: { Icon: SiPhp, color: "#777BB4" },
  Laravel: { Icon: SiLaravel, color: "#FF2D20" },
  Python: { Icon: SiPython, color: "#3776AB" },
  PostgreSQL: { Icon: SiPostgresql, color: "#4169E1" },
  MySQL: { Icon: SiMysql, color: "#4479A1" },
  Supabase: { Icon: SiSupabase, color: "#3FCF8E" },
  Docker: { Icon: SiDocker, color: "#2496ED" },
  Figma: { Icon: SiFigma, color: "#F24E1E" },
};

/**
 * react-icons/si tidak punya ikon Adobe sama sekali, jadi Premiere Pro
 * dapat lencana buatan sendiri alih-alih fallback titik.
 */
function PremiereProIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" className="shrink-0" aria-hidden="true">
      <rect width="22" height="22" rx="4" fill="#00005B" />
      <text
        x="11"
        y="15"
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
        fill="#9999FF"
      >
        Pr
      </text>
    </svg>
  );
}

const CUSTOM_ICONS: Record<string, typeof PremiereProIcon> = {
  "Premiere Pro": PremiereProIcon,
};

function Chip({ name }: { name: string }) {
  const entry = ICONS[name];
  const Custom = CUSTOM_ICONS[name];
  return (
    <span className="inline-flex shrink-0 items-center gap-2 text-sm text-text-secondary">
      {entry ? (
        <entry.Icon
          size={22}
          color={entry.color}
          className={`shrink-0 ${entry.color ? "" : "text-text-primary"}`}
          aria-hidden="true"
        />
      ) : Custom ? (
        <Custom />
      ) : (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-text-secondary" aria-hidden="true" />
      )}
      {name}
    </span>
  );
}

function MarqueeRow({ items, direction }: { items: string[]; direction: "left" | "right" }) {
  // Diulang 4x (bukan 2x): kalau satu set item lebih pendek dari lebar
  // container, 2 salinan saja tidak cukup mengisi baris dan menyisakan
  // celah kosong di ujungnya. Loop tetap mulus karena translateX ke
  // -50% selalu berhenti tepat di kelipatan genap lebar satu set.
  // Durasi digandakan (32s -> 64s) supaya kecepatan geraknya sama
  // seperti sebelumnya — jarak tempuh animasi ikut berlipat dua.
  const looped = [...items, ...items, ...items, ...items];
  return (
    <div className="overflow-hidden motion-reduce:overflow-x-auto motion-reduce:[scrollbar-width:thin]">
      <div
        className={`flex w-max gap-10 py-1 ${
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        } hover:[animation-play-state:paused] motion-reduce:animate-none`}
        style={{ animationDuration: "64s" }}
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

      <div className="mx-auto max-w-3xl overflow-hidden px-6 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex flex-col gap-4">
          <MarqueeRow items={row1} direction="left" />
          <MarqueeRow items={row2} direction="right" />
        </div>
      </div>
    </section>
  );
}
