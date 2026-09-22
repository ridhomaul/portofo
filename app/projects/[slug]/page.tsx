import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { featured, projects, type Project } from "@/content/projects";
import CaseStudySection from "@/app/components/CaseStudySection";

const allProjects: Project[] = [featured, ...projects];

// Static export: hanya render halaman untuk project yang benar-benar
// punya case study, dan tolak slug lain sama sekali saat build.
export const dynamicParams = false;

export function generateStaticParams() {
  return allProjects.filter((p) => p.caseStudy).map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const project = allProjects.find((p) => p.slug === params.slug);
  return { title: project?.name };
}

export default function ProjectCaseStudyPage({ params }: { params: { slug: string } }) {
  const project = allProjects.find((p) => p.slug === params.slug);
  if (!project || !project.caseStudy) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 pb-20 pt-16">
      <Link
        href="/#work"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      <h1 className="display mt-6 text-3xl">{project.name}</h1>
      <p className="mt-1 text-sm text-text-secondary">{project.role}</p>
      <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-text-secondary">
        {project.caseStudy.intro}
      </p>

      <div className="mt-10 flex flex-col gap-8">
        {project.caseStudy.sections.map((section) => (
          <CaseStudySection key={section.title} section={section} />
        ))}
      </div>
    </div>
  );
}
