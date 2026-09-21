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
    date: "21 May 2024",
    title: "Workshop IT Bootcamp",
    issuer: "Universitas Bina Sarana Informatika",
    image: "/certificates/sertifikat-digital.png",
  },
];
