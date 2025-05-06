import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Modal from '../components/Modal';
import ProjectCard from '../components/ProjectCard';
import { getAllProjects } from '../utils/projects';
import type { Project } from '../types/project';
import { companies, ANIMATION_DURATION, STAGGER_DELAY, INITIAL_DELAY, SOCIAL_LINKS } from '../config/constants';
import { getPastelColorByIndex } from '../utils/colors';
import { GetStaticProps } from 'next';
import Marquee from 'react-fast-marquee';
import { FaLinkedin, FaEnvelope, FaDownload, FaFile, FaInstagram, FaRocket, FaPlane, FaFeather, FaPaperPlane } from 'react-icons/fa';
import { FaJetFighter } from 'react-icons/fa6';
import { FaXTwitter } from 'react-icons/fa6';

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

const flyingIcons = [FaPlane, FaRocket, FaFeather, FaJetFighter, FaPaperPlane];
const flyingColors = ['#6c63ff', '#ff6f61', '#00b894', '#fdcb6e', '#00bcd4', '#e17055', '#636e72', '#fd79a8', '#0984e3'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Returns {x, y, edge} for a random edge
const getRandomEdgeAndPosition = () => {
  const edge = getRandomInt(0, 3);
  const percent = getRandomInt(10, 90); // avoid extreme corners
  switch (edge) {
    case 0: // left
      return { x: '-60px', y: `${percent}vh`, edge };
    case 1: // right
      return { x: '100vw', y: `${percent}vh`, edge };
    case 2: // top
      return { x: `${percent}vw`, y: '-60px', edge };
    case 3: // bottom
      return { x: `${percent}vw`, y: '100vh', edge };
    default:
      return { x: '-60px', y: '10vh', edge: 0 };
  }
};

// Returns a different edge than the start
const getRandomDifferentEdge = (startEdge) => {
  let edge;
  do {
    edge = getRandomInt(0, 3);
  } while (edge === startEdge);
  const percent = getRandomInt(10, 90);
  switch (edge) {
    case 0: return { x: '-60px', y: `${percent}vh`, edge };
    case 1: return { x: '100vw', y: `${percent}vh`, edge };
    case 2: return { x: `${percent}vw`, y: '-60px', edge };
    case 3: return { x: `${percent}vw`, y: '100vh', edge };
    default: return { x: '100vw', y: '50vh', edge: 1 };
  }
};

// Calculate angle in degrees from start to end (for icon rotation)
const getAngle = (start, end) => {
  // Remove 'px', 'vw', 'vh' and convert to numbers
  const parse = v => v.includes('vw') ? window.innerWidth * parseInt(v) / 100 : v.includes('vh') ? window.innerHeight * parseInt(v) / 100 : parseInt(v);
  const x1 = parse(start.x), y1 = parse(start.y);
  const x2 = parse(end.x), y2 = parse(end.y);
  return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
};

// Generate a smooth, slightly curved path from start to end
const getCurvedPathKeyframes = (start, end) => {
  // Midpoint with a random offset for a gentle curve
  const parse = v => v.includes('vw') ? window.innerWidth * parseInt(v) / 100 : v.includes('vh') ? window.innerHeight * parseInt(v) / 100 : parseInt(v);
  const x1 = parse(start.x), y1 = parse(start.y);
  const x2 = parse(end.x), y2 = parse(end.y);
  const mx = (x1 + x2) / 2 + getRandomInt(-100, 100);
  const my = (y1 + y2) / 2 + getRandomInt(-100, 100);
  return `
    0% {
      left: ${start.x};
      top: ${start.y};
      opacity: 0.7;
      transform: rotate(0deg) scale(1);
    }
    50% {
      left: ${mx}px;
      top: ${my}px;
      opacity: 1;
      transform: rotate(0deg) scale(1.05);
    }
    100% {
      left: ${end.x};
      top: ${end.y};
      opacity: 0.7;
      transform: rotate(0deg) scale(1);
    }
  `;
};

export default function Home({ initialProjects }: HomeProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [modalContent, setModalContent] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [lastFocusedElement, setLastFocusedElement] = useState<HTMLElement | null>(null);
  const [projects] = useState<Project[]>(initialProjects);
  const [selectedProjectColor, setSelectedProjectColor] = useState<string | undefined>(undefined);
  const projectRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const logoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const modalCardRef = useRef<HTMLDivElement>(null);
  const [flyingIconIdx, setFlyingIconIdx] = useState(() => getRandomInt(0, flyingIcons.length - 1));
  const [flyingColor, setFlyingColor] = useState(() => flyingColors[getRandomInt(0, flyingColors.length - 1)]);
  const [flyingSize, setFlyingSize] = useState(() => getRandomInt(18, 32));
  const [flyingAnimationName, setFlyingAnimationName] = useState('');
  const [flyingStart, setFlyingStart] = useState(getRandomEdgeAndPosition());
  const [flyingEnd, setFlyingEnd] = useState(getRandomDifferentEdge(flyingStart.edge));
  const [flyingAngle, setFlyingAngle] = useState(0);
  const [flyingKey, setFlyingKey] = useState(0);
  const [showFlyingIcon, setShowFlyingIcon] = useState(true);

  // Pre-generate colors for consistency, one per project (stable)
  const projectColors = useMemo(() => {
    const colorMap = {};
    projects.forEach((project, index) => {
      colorMap[project.id] = getPastelColorByIndex(index);
    });
    return colorMap;
  }, [projects]);

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

  // Animate new icon, color, size, direction on each animation iteration
  useEffect(() => {
    let timeoutId;
    const handleAnimationEnd = () => {
      setShowFlyingIcon(false);
      timeoutId = setTimeout(() => {
        setFlyingIconIdx(getRandomInt(0, flyingIcons.length - 1));
        setFlyingColor(flyingColors[getRandomInt(0, flyingColors.length - 1)]);
        setFlyingSize(getRandomInt(18, 32));
        const newStart = getRandomEdgeAndPosition();
        const newEnd = getRandomDifferentEdge(newStart.edge);
        setFlyingStart(newStart);
        setFlyingEnd(newEnd);
        setFlyingAngle(getAngle(newStart, newEnd));
        setFlyingKey(prev => prev + 1);
        setShowFlyingIcon(true);
      }, getRandomInt(500, 1500)); // 0.5s to 1.5s delay
    };
    const el = document.querySelector('.flying-object');
    if (el) {
      el.addEventListener('animationend', handleAnimationEnd);
      return () => {
        el.removeEventListener('animationend', handleAnimationEnd);
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [flyingKey]);

  // Generate and inject a unique keyframes animation for each icon instance
  useEffect(() => {
    const name = `fly-across-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const keyframes = getCurvedPathKeyframes(flyingStart, flyingEnd);
    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `@keyframes ${name} {${keyframes}}`;
    document.head.appendChild(styleSheet);
    setFlyingAnimationName(name);
    setFlyingAngle(getAngle(flyingStart, flyingEnd));
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, [flyingKey, flyingStart, flyingEnd]);

  const FlyingIcon = flyingIcons[flyingIconIdx];

  const openModal = (project: Project, event: React.MouseEvent<HTMLButtonElement>, color: string) => {
    if (isClosing) return;
    setSelectedProject(project);
    setSelectedProjectColor(color);
    requestAnimationFrame(() => {
      setModalOpen(true);
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

  const handleProjectClick = (project: Project, color: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    openModal(project, event, color);
  };

  return (
    <>
      <main className="container">
        {/* Fun animated flying icon in the background */}
        <div className="flying-object-bg">
          {showFlyingIcon && (
            <FlyingIcon
              key={flyingKey}
              className="flying-object"
              style={{ color: flyingColor, fontSize: flyingSize, animation: `${flyingAnimationName} 7s linear 1`, transform: `rotate(${flyingAngle}deg)` }}
            />
          )}
        </div>

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
                  href="mailto:sohamizhere@email.com"
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
                onClick={handleProjectClick(project, projectColors[project.id])}
                backgroundColor={projectColors[project.id]}
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
                  <Icon />
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
          backgroundColor={projectColors[selectedProject.id]}
        />
      )}
    </>
  );
} 