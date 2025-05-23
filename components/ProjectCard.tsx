import { forwardRef } from 'react';
import type { Project } from '../types/project';
import Image from 'next/image';

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
        {/* Title row with thumbnail and title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', gap: '0.75rem' }}>
          {project.thumbnailImage && (
            <Image
              src={project.thumbnailImage}
              alt={project.title + ' thumbnail'}
              width={32}
              height={32}
              style={{ borderRadius: 8, objectFit: 'contain', height: '1.6rem', width: '1.6rem', minWidth: '1.6rem', minHeight: '1.6rem' }}
            />
          )}
          <h3 className="project-title" style={{ margin: 0, fontSize: '1rem', lineHeight: '1rem', fontWeight: 600 }}>
            {project.title}
          </h3>
        </div>
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