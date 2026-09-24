"use client";

import { useState } from "react";
import { useAuth } from "./lib/useAuth";
import { useJsonResource } from "./lib/useJsonResource";
import type { CertificationsFile } from "./panels/CertificationsPanel";
import { CertificationsPanel } from "./panels/CertificationsPanel";
import type { ExperienceFile } from "./panels/ExperiencePanel";
import { ExperiencePanel } from "./panels/ExperiencePanel";
import type { ProjectsFile } from "./panels/ProjectsPanel";
import { ProjectsPanel } from "./panels/ProjectsPanel";
import { FeaturedProjectPanel } from "./panels/FeaturedProjectPanel";
import { CaseStudyPanel } from "./panels/CaseStudyPanel";
import type { SiteFile } from "./panels/SitePanel";
import { SitePanel } from "./panels/SitePanel";
import { StackPanel } from "./panels/StackPanel";
import { HeroIntroPanel } from "./panels/HeroIntroPanel";

const CERTIFICATIONS_PATH = "content/data/certifications.json";
const EXPERIENCE_PATH = "content/data/experience.json";
const PROJECTS_PATH = "content/data/projects.json";
const SITE_PATH = "content/data/site.json";

const TABS = [
  "Certifications",
  "Experience",
  "Projects",
  "Featured project",
  "Case study",
  "Site",
  "Stack",
  "Hero intro",
] as const;

type Tab = (typeof TABS)[number];

export default function AdminPage() {
  const { token, hydrated, user, verifying, error, handleLogin, handleLogout } = useAuth();
  const [tab, setTab] = useState<Tab>("Certifications");

  const certifications = useJsonResource<CertificationsFile>(token, CERTIFICATIONS_PATH);
  const experience = useJsonResource<ExperienceFile>(token, EXPERIENCE_PATH);
  const projects = useJsonResource<ProjectsFile>(token, PROJECTS_PATH);
  const site = useJsonResource<SiteFile>(token, SITE_PATH);

  if (!hydrated) {
    return null;
  }

  return (
    <div className="pb-20 pt-16">
      <div className="mx-auto flex min-h-[40vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <h1 className="display text-2xl">Admin</h1>

        {!token && (
          <>
            <p className="mt-3 max-w-[42ch] text-sm text-text-secondary">
              Login dengan akun GitHub yang punya akses ke repo ini.
            </p>
            <button
              type="button"
              onClick={handleLogin}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-85"
            >
              Login with GitHub
            </button>
          </>
        )}

        {token && (
          <div className="mt-6 flex flex-col items-center gap-3">
            {verifying && <p className="text-sm text-text-secondary">Memverifikasi token…</p>}

            {user && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.avatar_url} alt={user.login} className="h-16 w-16 rounded-full border border-border" />
                <p className="text-sm text-text-primary">
                  Login sebagai <span className="font-medium">{user.name || user.login}</span>{" "}
                  <span className="text-text-secondary">(@{user.login})</span>
                </p>
              </>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 rounded-full border border-border px-5 py-2.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              Logout
            </button>
          </div>
        )}

        {error && <p className="mt-4 max-w-[48ch] text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>

      {token && (
        <div className="mx-auto mt-8 max-w-3xl px-6 text-left">
          <nav className="flex flex-wrap gap-2 border-b border-border pb-4">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-2 text-xs transition-colors ${
                  tab === t
                    ? "bg-accent text-bg"
                    : "border border-border text-text-secondary hover:text-text-primary"
                }`}
              >
                {t}
              </button>
            ))}
          </nav>

          <div className="mt-6">
            {tab === "Certifications" && <CertificationsPanel token={token} resource={certifications} />}
            {tab === "Experience" && <ExperiencePanel resource={experience} />}
            {tab === "Projects" && <ProjectsPanel token={token} resource={projects} />}
            {tab === "Featured project" && <FeaturedProjectPanel token={token} resource={projects} />}
            {tab === "Case study" && <CaseStudyPanel token={token} resource={projects} />}
            {tab === "Site" && <SitePanel resource={site} />}
            {tab === "Stack" && <StackPanel resource={site} />}
            {tab === "Hero intro" && <HeroIntroPanel resource={site} />}
          </div>
        </div>
      )}
    </div>
  );
}
