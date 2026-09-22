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
  imageFit?: "cover" | "contain"; // default "cover". "contain" untuk logo di atas latar terang.
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
    imageFit: "contain",
    caseStudy: {
      intro: "TODO — satu atau dua kalimat pembuka: lingkup kerja dan peran di MileniaNews.",
      sections: [
        {
          title: "Content Planning & Editing",
          icon: "Newspaper",
          images: [
            {
              src: "/projects/milenianews/news-1.png",
              alt: "Four MileniaNews Instagram posts covering business, crime, entertainment, and sports news",
            },
            {
              src: "/projects/milenianews/news-2.png",
              alt: "Four MileniaNews Instagram posts covering public services, politics, awards, and lifestyle",
            },
            {
              src: "/projects/milenianews/news-3.png",
              alt: "Four MileniaNews Instagram posts covering pop culture, international politics, and social issues",
            },
          ],
          description:
            "Planned and edited daily news posts for MileniaNews' social channels: choosing the angle, writing the headline, and shaping every post for the feed.",
          points: [
            "Covered business, politics, entertainment, sports, and pop culture within one consistent visual system.",
            "Led headlines with the hard number or the conflict, so each post reads in a single glance.",
            "2,000+ posts published, from internship through a full-time role.",
          ],
        },
        {
          title: "Podcast: Kaum Milenial",
          icon: "Mic",
          images: [
            {
              src: "/projects/milenianews/podcast.png",
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
  {
    // TODO — isi seluruh entri ini, lalu ganti screenshot placeholder
    // di public/projects/todo-project.png dengan yang asli.
    slug: "todo-project",
    name: "TODO — nama project",
    role: "TODO — peranmu",
    summary: "TODO — satu kalimat: masalah apa yang diselesaikan",
    tech: ["TODO", "TODO", "TODO"],
    image: "/projects/todo-project.png",
    href: "TODO — link demo atau repo (hapus baris ini kalau tidak ada)",
  },
];
