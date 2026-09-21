import { site } from "@/content/site";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-270 flex-col gap-3 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10">
        <p className="text-sm italic text-text-secondary">{site.quote}</p>
        <p className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
          <span>{site.name}</span>
          <span aria-hidden>/</span>
          <span>{site.status}</span>
          <span aria-hidden>/</span>
          <span>{site.location}</span>
        </p>
      </div>
    </footer>
  );
}
