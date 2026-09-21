import { ArrowRight } from "lucide-react";
import { GitHubIcon, LinkedInIcon, InstagramIcon } from "./BrandIcons";
import PixelReveal from "./PixelReveal";
import { site } from "@/content/site";

const icons = { GitHub: GitHubIcon, LinkedIn: LinkedInIcon, Instagram: InstagramIcon } as const;

/**
 * Chip dirender inline di dalam paragraf, seperti referensi - tapi dengan
 * align-middle dan line-height tetap, supaya baris tidak jadi renggang
 * tak rata setiap kali bertemu chip.
 */
function IntroText({ text }: { text: string }) {
  return (
    <p className="max-w-[54ch] text-lg leading-[2.1] text-text-secondary sm:text-xl">
      {text.split(/(\{[^}]+\})/g).map((part, i) =>
        part.startsWith("{") ? (
          <span
            key={i}
            className="mx-0.5 inline-flex h-7 items-center rounded-full border border-border px-3 align-middle text-[0.85em] leading-none text-text-primary"
          >
            {part.slice(1, -1)}
          </span>
        ) : (
          part
        )
      )}
    </p>
  );
}

export default function Hero() {
  return (
    <section id="top" className="mx-auto max-w-270 px-6 pb-24 pt-20 md:px-10 md:pb-32 md:pt-28">
      <div className="rise flex flex-col items-start gap-7 sm:flex-row sm:items-center sm:gap-9">
        <PixelReveal
          cover="/Myface.1.png"
          reveal="/profile1.png"
          alt={site.name}
          className="w-32 shrink-0 sm:w-40"
/>

        <div>
          <h1 className="display text-4xl sm:text-5xl">{site.name}</h1>
          <div className="mt-4 flex items-center gap-4">
            {site.socials.map((s) => {
              const Icon = icons[s.label as keyof typeof icons];
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-text-secondary transition-colors hover:text-text-primary"
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Separuh kedua judul sengaja dibuat pudar - hierarki lewat warna,
          bukan lewat bold. Ini tanda tangan visual referensi. */}
      <h2 className="rise display mt-14 text-4xl sm:text-5xl md:text-6xl" style={{ animationDelay: "60ms" }}>
        Full-Stack Developer{" "}
        <span className="text-text-secondary">&mdash; Laravel &amp; Next.js</span>
      </h2>

      <div className="rise mt-9" style={{ animationDelay: "120ms" }}>
        <IntroText text={site.intro} />
      </div>

      {/* CTA utama netral: rekruter dan klien sama-sama mau lihat karya dulu.
          Dua pintu spesifik menunggu di section Contact. */}
      <a
        href="#work"
        className="rise mt-11 inline-flex items-center gap-2.5 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-bg transition-opacity hover:opacity-85"
        style={{ animationDelay: "180ms" }}
      >
        See the work
        <ArrowRight className="h-4 w-4" />
      </a>
    </section>
  );
}


