import data from "./data/projects.json";

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

// Diedit lewat /admin -> commit ke content/data/projects.json.
// File ini cuma loader tipis supaya komponen yang sudah ada tidak perlu berubah.
export const featured: Project = data.featured as Project;
export const projects: Project[] = data.projects as Project[];
