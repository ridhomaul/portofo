import Image from "next/image";
import { certifications } from "@/content/certifications";

export default function Certifications() {
  return (
    <section id="certifications" className="mx-auto max-w-3xl px-6 pb-20">
      <h2 className="display mb-10 text-3xl">Certifications</h2>

      <ol className="flex flex-col gap-11">
        {certifications.map((c) => (
          <li key={`${c.title}-${c.date}`} className="grid gap-2 sm:grid-cols-[160px_1fr] sm:gap-6">
            <p className="pt-0.5 text-sm text-text-muted">{c.date}</p>

            <div>
              <h3 className="text-base font-medium">
                {c.url ? (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-text-secondary"
                  >
                    {c.title}
                  </a>
                ) : (
                  c.title
                )}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">{c.issuer}</p>
              {c.credentialId && <p className="text-xs text-text-muted">{c.credentialId}</p>}

              {c.image && (
                <a
                  href={c.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block w-fit transition-opacity hover:opacity-80"
                >
                  <Image
                    src={c.image}
                    alt={`${c.title} certificate`}
                    width={96}
                    height={64}
                    className="rounded-md border border-border object-cover"
                  />
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
