export type Project = {
  slug: string;
  name: string;
  role: string;           // peran eksplisit — jangan dikaburkan
  summary: string;        // satu kalimat: masalah apa yang diselesaikan
  outcome?: string;       // HASIL terukur. Kosongkan kalau belum ada — jangan dikarang.
  tech: string[];
  image: string;          // screenshot ASLI. Bukan foto stok.
  href?: string;
  caseStudy?: string;
  inProgress?: boolean;
};

// Project unggulan — diberi panggung penuh di atas grid.
export const featured: Project = {
  slug: "milenner",
  name: "Milenner Platform",
  role: "System Architect & Sole Developer",
  summary:
    "Content operations platform for social media teams: Kanban planning, multi-tenancy, and role-based access.",
  outcome: "TODO — dipakai berapa tim? berapa konten dikelola? memangkas waktu apa?",
  tech: ["Laravel 12", "PHP 8.4", "PostgreSQL", "Tailwind"],
  image: "/projects/m.1.png",   // TODO ganti screenshot asli
};

export const projects: Project[] = [
  {
    slug: "rekam-medis",
    name: "Medical Record Encryption",
    role: "Researcher & Developer",
    summary:
      "Encryption layer for patient records on a web platform, built as applied research at Universitas Bina Sarana Informatika.",
    tech: ["PHP", "Cryptography", "MySQL"],
    image: "/projects/rekam-medis.png",   // TODO
  },
  {
    slug: "milenianews",
    name: "MileniaNews Content System",
    role: "Content Lead & Editor",
    summary:
      "Editorial calendar and production pipeline for a digital newsroom, from pre-production through distribution.",
    outcome: "TODO — satu angka yang konsisten. Pilih 600 atau 2000, jangan dua-duanya.",
    tech: ["Editorial Planning", "Premiere Pro", "Analytics"],
    image: "/projects/milenianews.png",   // TODO
  },
  {
    slug: "portfolio",
    name: "This Site",
    role: "Designer & Developer",
    summary:
      "Static-exported Next.js portfolio with a hand-built design system and a pixel-reveal profile interaction.",
    tech: ["Next.js 14", "Tailwind v4", "TypeScript"],
    image: "/projects/portfolio.png",     // TODO
    href: "https://github.com/ridhomaul",
  },
];
