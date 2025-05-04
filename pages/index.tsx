import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { LinkedInIcon, GitHubIcon, XIcon } from '../components/icons/SocialIcons';
import Modal from '../components/Modal';
import ProjectCard from '../components/ProjectCard';
import { getAllProjects } from '../utils/projects';
import type { Project } from '../types/project';
import { companies, ANIMATION_DURATION, STAGGER_DELAY, INITIAL_DELAY, SOCIAL_LINKS } from '../config/constants';
import { getRandomPastelColor } from '../utils/helpers';
import { GetStaticProps } from 'next';
import Marquee from 'react-fast-marquee';
// FontAwesome imports
import { FaLinkedin, FaEnvelope, FaDownload, FaFile } from 'react-icons/fa';

interface HomeProps {
  initialProjects: Project[];
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  try {
    const projects = await getAllProjects();
    return {
      props: {
        initialProjects: projects,
      },
    };
  } catch (error) {
    console.error('Error loading projects in getStaticProps:', error);
    return {
      props: {
        initialProjects: [],
      },
    };
  }
};

export default function Home({ initialProjects }: HomeProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [modalContent, setModalContent] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [lastFocusedElement, setLastFocusedElement] = useState<HTMLElement | null>(null);
  const [projects] = useState<Project[]>(initialProjects);
  const projectRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const logoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const modalCardRef = useRef<HTMLDivElement>(null);

  // Initialize project and logo animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      [...projectRefs.current, ...logoRefs.current].forEach(el => {
        if (el) el.classList.add('visible');
      });
      return;
    }

    const allElements = [...logoRefs.current, ...projectRefs.current, ...ctaRefs.current];
    allElements.forEach((el, index) => {
      if (el) {
        const delay = index === 0 ? INITIAL_DELAY : STAGGER_DELAY * index;
        setTimeout(() => {
          requestAnimationFrame(() => {
            el.classList.add('visible');
          });
        }, delay);
      }
    });

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting && !entry.target.classList.contains('visible')) {
            setTimeout(() => {
              requestAnimationFrame(() => {
                entry.target.classList.add('visible');
              });
            }, STAGGER_DELAY * index);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '50px',
      }
    );

    allElements.forEach((el) => {
      if (el) {
        observerRef.current?.observe(el);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [projects]);

  const openModal = (project: Project, event: React.MouseEvent<HTMLButtonElement>) => {
    if (isClosing) return;
    
    // Set project first
    setSelectedProject(project);
    
    // Use requestAnimationFrame to ensure DOM updates
    requestAnimationFrame(() => {
      setModalOpen(true);
      // Delay setting content visible
      setTimeout(() => {
        setModalContent(true);
      }, 100);
    });
    
    setLastFocusedElement(event.currentTarget);
  };

  const closeModal = () => {
    if (isClosing) return;
    setIsClosing(true);
    setModalContent(false);
    
    setTimeout(() => {
      setModalOpen(false);
      setIsClosing(false);
      setSelectedProject(undefined);
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    }, 300);
  };

  // Pre-generate random colors for consistency
  const projectColors = Array(projects.length).fill(null).map(() => getRandomPastelColor());

  const handleProjectClick = (project: Project) => (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    openModal(project, event);
  };

  return (
    <>
      <main className="container">
        {/* Hero Section */}
        <section className="hero">
          <div className="profile-section">
            <div className="profile-image">
              <Image 
                src="/soham-dp.jpeg"
                alt="Soham Ghosh"
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 600px) 77px, 115px"
              />
            </div>
            <span className="profile-name">Soham Ghosh</span>
          </div>
          <div>
            <p>AI Product Manager working on Autonomous Agents</p>
            <div className="company-logos">
              <h2 className="projects-heading">Experience</h2>
              <Marquee gradient={false} speed={40} pauseOnHover={true}>
                {companies.map((company, index) => (
                  <div
                    key={company.name}
                    className="marquee-logo"
                    style={{ position: 'relative', width: '120px', height: '60px' }}
                  >
                    <Image
                      src={company.logo}
                      alt={company.name}
                      fill
                      style={{ objectFit: 'contain' }}
                      sizes="120px"
                    />
                  </div>
                ))}
              </Marquee>
              <div className="cta-buttons">
                <a
                  href="https://www.linkedin.com/in/sohamgho5h/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-btn"
                  ref={el => { ctaRefs.current[0] = el; }}
                >
                  <FaLinkedin className="cta-icon" /> Connect
                </a>
                <a
                  href="mailto:sohamghosh@email.com"
                  className="cta-btn"
                  ref={el => { ctaRefs.current[1] = el; }}
                >
                  <FaEnvelope className="cta-icon" /> Email
                </a>
                <a
                  href="/SohamGhoshCV.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-btn"
                  ref={el => { ctaRefs.current[2] = el; }}
                >
                  <FaFile className="cta-icon" /> Get CV
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="projects">
          <h2 className="projects-heading">Featured work</h2>
          <div className="projects-grid">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                ref={el => {
                  projectRefs.current[index] = el;
                }}
                project={project}
                onClick={handleProjectClick(project)}
                backgroundColor={projectColors[index]}
              />
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="contact">
          <ul className="social-links">
            {SOCIAL_LINKS.map(({ name, url, Icon }) => (
              <li key={name}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${name} Profile`}
                >
                  {Icon === 'LinkedInIcon' && <LinkedInIcon />}
                  {Icon === 'GitHubIcon' && <GitHubIcon />}
                  {Icon === 'XIcon' && <XIcon />}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {selectedProject && (
        <Modal
          key={selectedProject.id}
          isOpen={modalOpen}
          onClose={closeModal}
          project={selectedProject}
          modalRef={modalCardRef}
          contentVisible={modalContent}
          isClosing={isClosing}
        />
      )}
    </>
  );
} 