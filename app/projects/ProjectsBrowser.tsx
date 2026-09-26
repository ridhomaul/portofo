"use client";

import { useRef, useState } from "react";
import type { Project } from "@/content/projects";
import Pagination from "@/app/components/Pagination";
import ProjectCard from "@/app/components/ProjectCard";

const PER_PAGE = 4;

export default function ProjectsBrowser({ projects }: { projects: Project[] }) {
  const [page, setPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);

  const pageCount = Math.ceil(projects.length / PER_PAGE);
  const visible = projects.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const goTo = (next: number) => {
    setPage(next);
    gridRef.current?.scrollIntoView({ block: "start" });
  };

  return (
    <>
      <div ref={gridRef} className="mt-10 grid scroll-mt-24 gap-5 sm:grid-cols-2">
        {visible.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>

      <Pagination page={page} pageCount={pageCount} onPageChange={goTo} />
    </>
  );
}
