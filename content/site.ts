import data from "./data/site.json";

export type Social = {
  label: string;
  href: string;
};

export type Site = {
  name: string;
  initials: string;
  // Ditampilkan di hero. Teks di dalam {kurung kurawal} dirender sebagai chip.
  intro: string;
  location: string;
  status: string;
  quote: string;
  email: string;
  whatsapp: string;
  cv: string;
  url: string;
  socials: Social[];
};

export type Stack = Record<string, string[]>;

// Diedit lewat /admin -> commit ke content/data/site.json.
// File ini cuma loader tipis supaya komponen yang sudah ada tidak perlu berubah.
export const site: Site = data.site;
export const stack: Stack = data.stack;