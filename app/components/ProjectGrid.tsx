import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { allProjects, projects } from "@/content/projects";
import ProjectCard from "./ProjectCard";

const HOME_LIMIT = 3;

export default function ProjectGrid() {
  return (
    <section id="work" className="mx-auto max-w-3xl px-6 pb-20">
      <h2 className="display mb-10 text-3xl">Projects</h2>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.slice(0, HOME_LIMIT).map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>

      {projects.length > HOME_LIMIT && (
        <div className="mt-10 flex justify-center">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2.5 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-bg transition-opacity hover:opacity-85"
          >
            Explore {allProjects.length}+ Projects
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
