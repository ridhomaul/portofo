import { Mail, FileText, MessageCircle, ChevronRight } from "lucide-react";
import { site } from "@/content/site";

/**
 * Dua pintu. Referensi gagal di sini karena CTA hero-nya "View Resume"
 * (bahasa rekruter) sementara bagian bawah menjual jasa freelance —
 * dua audiens, tidak ada yang dilayani dengan jelas.
 *
 * Solusinya bukan memilih salah satu, tapi menetralkan CTA utama
 * lalu memberi pintu eksplisit di sini.
 */
const doors = [
  {
    kicker: "Hiring?",
    label: "Download CV",
    href: site.cv,
    Icon: FileText,
    external: false,
  },
  {
    kicker: "Need something built?",
    label: site.email,
    href: `mailto:${site.email}`,
    Icon: Mail,
    external: false,
  },
  {
    kicker: "Prefer chat?",
    label: "WhatsApp",
    href: `https://wa.me/${site.whatsapp}`,
    Icon: MessageCircle,
    external: true,
  },
];

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-3xl px-6 pb-20">
      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <h2 className="display text-4xl md:text-5xl">Let&apos;s work together.</h2>
          <p className="mt-6 max-w-[42ch] text-base leading-relaxed text-text-secondary">
            Available for full-stack work in Laravel and Next.js, and for teams that need
            someone who understands both the system and the content running through it.
          </p>
        </div>

        {/* Tidak ada form. Situs ini static export — tanpa backend, form hanya
            menampung pesan lalu membuangnya. Link langsung selalu bekerja. */}
        <ul className="flex flex-col gap-3">
          {doors.map(({ kicker, label, href, Icon, external }) => (
            <li key={label}>
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex items-center gap-4 rounded-(--radius) border border-border p-5 transition-colors hover:border-text-secondary"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border">
                  <Icon className="h-4.5 w-4.5 text-text-secondary" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-text-muted">{kicker}</span>
                  <span className="block truncate text-sm text-text-primary">{label}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
