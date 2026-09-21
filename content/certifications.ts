export type Certification = {
  date: string;          // contoh: "Mar 2026"
  title: string;
  issuer: string;
  credentialId?: string;
  url?: string;          // link verifikasi, kalau ada
  image?: string;        // path di public/certificates/
};

export const certifications: Certification[] = [
  {
    date: "TODO",
    title: "TODO - nama sertifikat",
    issuer: "TODO - penerbit",
    image: "/certificates/contoh.png",
  },
];
