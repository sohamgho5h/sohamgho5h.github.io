import { useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Project } from '../types/project';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  modalRef: React.RefObject<HTMLDivElement>;
  contentVisible: boolean;
  isClosing: boolean;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  project,
  modalRef, 
  contentVisible, 
  isClosing 
}: ModalProps) {
  const [isContentMounted, setIsContentMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.classList.add('modal-open');
      
      // Mount content after modal is open
      const timer = setTimeout(() => {
        setIsContentMounted(true);
      }, 50);

      return () => clearTimeout(timer);
    } else {
      document.body.classList.remove('modal-open');
      setIsContentMounted(false);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  // Debug log to check project data
  useEffect(() => {
    if (isOpen && project) {
      console.log('Modal project data:', {
        title: project.title,
        markdownContent: project.markdownContent?.substring(0, 100)
      });
    }
  }, [isOpen, project]);

  return (
    <div
      className={`modal-overlay ${isOpen ? 'active' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
      aria-label={`${project.title} Details`}
    >
      <div
        ref={modalRef}
        className="modal-card"
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        <div className={`modal-inner ${isContentMounted && contentVisible ? 'visible' : ''}`}>
          <div className="project-header">
            <h1>{project.title}</h1>
            {project.metadata && (
              <div className="project-metadata">
                {project.metadata.date && <span className="project-date">{project.metadata.date}</span>}
                {project.metadata.role && <span className="project-role">{project.metadata.role}</span>}
                {project.metadata.status && <span className="project-status">{project.metadata.status}</span>}
              </div>
            )}
            {project.links && (
              <div className="project-links">
                {Object.entries(project.links).map(([key, url]) => (
                  <a 
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link"
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="markdown-content">
            {project.markdownContent ? (
              <ReactMarkdown>
                {project.markdownContent}
              </ReactMarkdown>
            ) : (
              <p>No content available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 