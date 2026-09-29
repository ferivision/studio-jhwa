import { getProjects } from "@/lib/content";

export default function HomePage() {
  const projectCount = getProjects().length;
  return <main data-project-count={projectCount}>studioJHWA</main>;
}
