"use client";

import { useMemo, useState } from "react";

/**
 * Foto asli diam sebagai background wadah. Di atasnya kisi N×N yang tiap
 * kotaknya memegang potongan gambar penutup, lalu menghilang dengan
 * transition-delay berbeda-beda. Delay itulah sumber kesan "kubus demi kubus".
 *
 * Hanya opacity dan transform yang dianimasikan — keduanya ditangani GPU.
 */
type Props = {
  /** Gambar yang terlihat saat diam (penutup). */
  cover: string;
  /** Gambar yang muncul saat hover. */
  reveal: string;
  alt: string;
  /** Sisi kisi. 8 = 64 kotak. Naik secara kuadrat — jangan berlebihan. */
  grid?: number;
  /** Durasi tiap kotak (ms). */
  duration?: number;
  /** Rentang acak delay antar kotak (ms). Ini yang bikin efeknya hidup. */
  stagger?: number;
  className?: string;
};

export default function PixelReveal({
  cover,
  reveal,
  alt,
  grid = 8,
  duration = 280,
  stagger = 520,
  className = "",
}: Props) {
  const [on, setOn] = useState(false);

  // Delay dikunci sekali per mount supaya polanya tidak berubah tiap render.
  const tiles = useMemo(
    () =>
      Array.from({ length: grid * grid }, (_, i) => ({
        x: i % grid,
        y: Math.floor(i / grid),
        delay: Math.round(Math.random() * stagger),
      })),
    [grid, stagger]
  );

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-full border border-border ${className}`}
      style={{ backgroundImage: `url(${reveal})`, backgroundSize: "cover", backgroundPosition: "center" }}
      onMouseEnter={() => setOn(true)}
      onMouseLeave={() => setOn(false)}
      onClick={() => setOn((v) => !v)}          /* layar sentuh */
      role="img"
      aria-label={alt}
    >
      <div
        className="absolute inset-0 grid"
        style={{ gridTemplate: `repeat(${grid},1fr) / repeat(${grid},1fr)` }}
      >
        {tiles.map((t, i) => (
          <span
            key={i}
            aria-hidden
            className="block will-change-[opacity,transform] motion-reduce:!opacity-0 motion-reduce:!transition-none"
            style={{
              backgroundImage: `url(${cover})`,
              // diperbesar N kali sehingga seukuran wadah
              backgroundSize: `${grid * 100}% ${grid * 100}%`,
              // potongan milik kotak ini
              backgroundPosition: `${(t.x / (grid - 1)) * 100}% ${(t.y / (grid - 1)) * 100}%`,
              opacity: on ? 0 : 1,
              transform: on ? "scale(.35)" : "none",
              transitionProperty: "opacity, transform",
              transitionDuration: `${duration}ms`,
              transitionTimingFunction: "cubic-bezier(.4,0,.2,1)",
              transitionDelay: `${t.delay}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
