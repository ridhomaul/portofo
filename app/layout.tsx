import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import Header from "@/app/components/Header";
import { site } from "@/content/site";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const outfit = Outfit({ variable: "--font-geist", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Full-Stack Developer | Laravel & Next.js`,
    template: `%s | ${site.name}`,
  },
  description:
    "Full-stack developer in Jakarta building Laravel and Next.js platforms, with two years leading digital media production.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: site.name,
    url: site.url,
    title: `${site.name} — Full-Stack Developer`,
    description:
      "Laravel and Next.js platforms, built by a developer who spent two years running digital media production.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${site.name} portfolio` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Full-Stack Developer`,
    images: ["/og.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: "Full-Stack Developer",
  url: site.url,
  email: `mailto:${site.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Jakarta", addressCountry: "ID" },
  sameAs: site.socials.map((s) => s.href),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <Header />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
