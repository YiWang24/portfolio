import { ProfileData } from "@/types/profile";
import { TimelineItem, ProjectItem, StackGroup } from "@/types/portfolio";
import SectionHeader from "./SectionHeader";
import EducationSection from "./EducationSection";
import ExperienceSection from "./ExperienceSection";
import ProjectsSection from "./ProjectsSection";
import StackSection from "./StackSection";

interface PortfolioSectionsProps {
  data: ProfileData;
}

export default function PortfolioSections({ data }: PortfolioSectionsProps) {
  // Helper function to extract domain for Clearbit logo fetch
  const extractDomain = (schoolName: string): string => {
    const base = schoolName.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
    const domainMap: Record<string, string> = {
      yorkuniversity: "yorku.ca",
      york: "yorku.ca",
      universityoftoronto: "utoronto.ca",
      uoft: "utoronto.ca",
      stanford: "stanford.edu",
      harvard: "harvard.edu",
      mit: "mit.edu",
      amazon: "amazon.com",
      aws: "amazon.com",
      google: "google.com",
    };
    return domainMap[base] || `${base}.com`;
  };

  // Transform education data
  const educationItems: TimelineItem[] = data.education.map((item) => ({
    heading: item.school,
    subheading: item.degree,
    period: item.period,
    bullets: item.highlights,
    domain: extractDomain(item.school),
  }));

  // Transform experience data
  const experienceItems: TimelineItem[] = data.experience.map((item) => ({
    heading: item.company,
    subheading: item.title,
    period: item.period,
    bullets: item.achievements,
  }));

  // Projects are already in the correct format
  const projectItems: ProjectItem[] = data.projects;

  // Tech stack is already in the correct format
  const stackGroups: StackGroup[] = data.techStack;

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-16 space-y-16">
      {/* Education Section */}
      <section>
        <SectionHeader number="01" title="Education" />
        <EducationSection items={educationItems} />
      </section>

      {/* Experience Section */}
      <section>
        <SectionHeader number="02" title="Experience" />
        <ExperienceSection items={experienceItems} />
      </section>

      {/* Projects Section */}
      <section>
        <SectionHeader number="03" title="Projects" />
        <ProjectsSection projects={projectItems} />
      </section>

      {/* Tech Stack Section */}
      <section>
        <SectionHeader number="04" title="Stack" />
        <StackSection stack={stackGroups} />
      </section>
    </div>
  );
}
