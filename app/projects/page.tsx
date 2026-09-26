import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { allProjects } from "@/content/projects";
import ProjectsBrowser from "./ProjectsBrowser";

export function generateMetadata(): Metadata {
  return { title: "Projects" };
}

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-20 pt-16">
      <Link
        href="/#work"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <h1 className="display mt-6 text-3xl">Selected Projects</h1>
      <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-text-secondary">
        Platforms, research, and media work I have designed, built, or led.
      </p>

      <ProjectsBrowser projects={allProjects} />
    </div>
  );
}
