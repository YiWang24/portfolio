type Project = {
  title: string;
  summary: string;
  tech: string[];
  metrics: {
    stars: string;
    users: string;
  };
};

type Props = { projects: Project[] };

export default function ProjectGrid({ projects }: Props) {
  return (
    <div className="project-grid">
      {projects.map((project) => (
        <article key={project.title} className="project-card">
          <h3>{project.title}</h3>
          <p>{project.summary}</p>
          <div className="project-tags">
            {project.tech.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="project-metrics">
            <span>⭐ {project.metrics.stars}</span>
            <span>Users {project.metrics.users}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
