import { forwardRef } from 'react';
import type { Project } from '../types/project';

interface ProjectCardProps {
  project: Project;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  backgroundColor: string;
}

const ProjectCard = forwardRef<HTMLButtonElement, ProjectCardProps>(
  ({ project, onClick, backgroundColor }, ref) => {
    return (
      <button
        ref={ref}
        className="project-card"
        onClick={onClick}
        style={{
          background: `${backgroundColor}66`, // 40% opacity
          border: `2.5px solid ${backgroundColor}`,
          boxShadow: `0 4px 24px 0 ${backgroundColor}33`
        }}
        aria-haspopup="dialog"
      >
        <h3 className="project-title">{project.title}</h3>
        <p className="project-description">{project.shortDescription}</p>
        <div className="project-tags">
          {project.tags.map((tag) => (
            <span key={tag} className="project-tag">
              {tag}
            </span>
          ))}
        </div>
      </button>
    );
  }
);

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard; 