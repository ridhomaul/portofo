export const site = {
  name: "Ridho Maulana",
  initials: "RM",

  // Ditampilkan di hero. Teks di dalam {kurung kurawal} dirender sebagai chip.
  intro:
    "I build web platforms with {Laravel} and {Next.js}, backed by {PostgreSQL}. " +
    "Before writing code I spent two years leading digital media production — " +
    "planning, editing, and shipping content at scale. Now I build the tools I used to need.",

  location: "Jakarta, Indonesia",
  status: "Open to work",
  quote: "Systems are only as good as the people who use them.",

  email: "maulridho04@gmail.com",              // TODO wajib
  whatsapp: "6289618775467",              // TODO verifikasi — nomor ID mulai 8 setelah 62
  cv: "/CV-Ridho-Maulana.pdf",
  url: "https://maulanaridho.netlify.app",

  socials: [
    { label: "GitHub",    href: "https://github.com/ridhomaul" },
    { label: "LinkedIn",  href: "https://www.linkedin.com/in/ridho-maulana-073aaa386/" },
    { label: "Instagram", href: "https://www.instagram.com/maulani.sudjatmiko" },
  ],
} as const;

export const stack = {
  Frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS", "GSAP"],
  Backend: ["PHP", "Laravel", "Python"],
  Data: ["PostgreSQL", "MySQL", "Supabase"],
  Tools: ["Docker", "Figma", "Premiere Pro"],
} as const;
