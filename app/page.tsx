import Hero from "./components/Hero";
import FeaturedBuild from "./components/FeaturedBuild";
import ProjectGrid from "./components/ProjectGrid";
import ExperienceList from "./components/ExperienceList";
import StackGrid from "./components/StackGrid";
import Contact from "./components/Contact";
import SiteFooter from "./components/SiteFooter";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedBuild />
      <ProjectGrid />
      <ExperienceList />
      <StackGrid />
      <Contact />
      <SiteFooter />
    </>
  );
}
