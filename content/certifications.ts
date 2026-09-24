import data from "./data/certifications.json";

export type Certification = {
  date: string;          // contoh: "Mar 2026"
  title: string;
  issuer: string;
  credentialId?: string;
  url?: string;          // link verifikasi, kalau ada
  image?: string;        // path di public/certificates/
};

// Diedit lewat /admin -> commit ke content/data/certifications.json.
// File ini cuma loader tipis supaya komponen yang sudah ada tidak perlu berubah.
export const certifications: Certification[] = data.certifications;
