import data from "./data/experience.json";

export type Role = {
  period: string;
  title: string;
  org: string;
  place: string;
  // Satu baris pencapaian TERUKUR — bukan deskripsi tugas.
  // Buruk : "Bertanggung jawab sebagai Content Planner dan Editor."
  // Baik  : "Led production of 2,000+ pieces over two years."
  note?: string;
};

// Diedit lewat /admin -> commit ke content/data/experience.json.
// File ini cuma loader tipis supaya komponen yang sudah ada tidak perlu berubah.
export const experience: Role[] = data.experience;
