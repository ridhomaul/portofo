export type CaseStudySection = {
  title: string;
  icon?: string;
  images: { src: string; alt: string }[];
  description: string;
  points: string[];
};

export type CaseStudy = {
  intro: string;
  sections: CaseStudySection[];
};

export type Project = {
  slug: string;
  name: string;
  role: string;           // peran eksplisit — jangan dikaburkan
  summary: string;        // satu kalimat: masalah apa yang diselesaikan
  outcome?: string;       // HASIL terukur. Kosongkan kalau belum ada — jangan dikarang.
  tech: string[];
  image: string;          // screenshot ASLI. Bukan foto stok.
  href?: string;
  caseStudy?: CaseStudy;
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
  image: "/projects/milenner.png",
};

export const projects: Project[] = [
  {
    slug: "rekam-medis",
    name: "Medical Record Encryption",
    role: "Researcher & Developer",
    summary:
      "Encryption layer for patient records on a web platform, built as applied research at Universitas Bina Sarana Informatika.",
    tech: ["PHP", "Cryptography", "MySQL"],
    image: "/projects/rekam-medis.png",
  },
  {
    slug: "milenianews",
    name: "MileniaNews Content System",
    role: "Content Lead & Editor",
    summary:
      "Editorial calendar and production pipeline for a digital newsroom, from pre-production through distribution.",
    outcome: "TODO — satu angka yang konsisten. Pilih 600 atau 2000, jangan dua-duanya.",
    tech: ["Editorial Planning", "Premiere Pro", "Analytics"],
    image: "/projects/milenianews.png",
    caseStudy: {
      intro: "TODO — satu atau dua kalimat pembuka: lingkup kerja dan peran di MileniaNews.",
      sections: [
        {
          title: "Content Planning & Editing",
          icon: "Newspaper",
          images: [
            {
              src: "/projects/milenianews/content-planning.png",
              alt: "TODO — screenshot kalender editorial atau alur produksi konten",
            },
          ],
          description: "TODO — jelaskan proses perencanaan dan penyuntingan konten dalam 2-3 kalimat.",
          points: [
            "TODO — pencapaian terukur pertama.",
            "TODO — pencapaian terukur kedua.",
          ],
        },
        {
          title: "Podcast: Kaum Milenial",
          icon: "Mic",
          images: [
            {
              src: "/projects/milenianews/podcast-kaum-milenial.png",
              alt: "TODO — screenshot atau foto produksi podcast Kaum Milenial",
            },
          ],
          description: "TODO — jelaskan peran di produksi podcast Kaum Milenial dalam 2-3 kalimat.",
          points: [
            "TODO — pencapaian terukur pertama.",
            "TODO — pencapaian terukur kedua.",
          ],
        },
      ],
    },
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
