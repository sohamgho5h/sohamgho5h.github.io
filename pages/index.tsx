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
import { FaLinkedin, FaEnvelope, FaFile, FaRocket, FaFeather, FaRobot, FaBomb } from 'react-icons/fa';
import { FaGhost, FaBluesky, FaRegPaperPlane, FaMosquito, FaSpaghettiMonsterFlying, FaSkull } from 'react-icons/fa6';

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

const flyingIcons = [FaRocket, FaFeather, FaMosquito, FaGhost, FaBluesky, FaRegPaperPlane, FaRobot, FaSkull, FaSpaghettiMonsterFlying];
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

function useTypingHintOrScore(score, lastScoreTime) {
  const [show, setShow] = useState(false);
  const [typed, setTyped] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [scoreAnim, setScoreAnim] = useState(false);
  const fullText = isMobile ? '(Try tapping on the flying objects)' : '(Try clicking on the flying objects)';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 600);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show score if recent, else show typing hint
  useEffect(() => {
    let timeoutId;
    if (score > 0) {
      setShowScore(true);
      setShow(false);
      // Hide score and show hint after 20s of inactivity
      timeoutId = setTimeout(() => {
        setShowScore(false);
        setShow(true);
      }, 20000);
    }
    return () => clearTimeout(timeoutId);
  }, [score, lastScoreTime]);

  // Typing animation for hint
  useEffect(() => {
    if (showScore) return;
    let timeoutId;
    let intervalId;
    let eraseTimeoutId;
    let typing = false;
    function startTyping() {
      setShow(true);
      setTyped('');
      typing = true;
      let i = 0;
      intervalId = setInterval(() => {
        setTyped(fullText.slice(0, i + 1));
        i++;
        if (i === fullText.length) {
          clearInterval(intervalId);
          typing = false;
          // Stay for 10s, then erase
          eraseTimeoutId = setTimeout(() => {
            setShow(false);
            setTyped('');
            // Wait 15s, then start again
            timeoutId = setTimeout(startTyping, 15000);
          }, 10000);
        }
      }, 28);
    }
    if (!showScore) startTyping();
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      clearTimeout(eraseTimeoutId);
    };
    // eslint-disable-next-line
  }, [isMobile, showScore]);

  // Score animation
  const triggerScoreAnim = () => {
    setScoreAnim(true);
    setTimeout(() => setScoreAnim(false), 400);
  };

  return {
    typingHint: show ? typed : '',
    showScore,
    scoreAnim,
    triggerScoreAnim,
  };
}

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
  const [isBurst, setIsBurst] = useState(false);
  const [burstPosition, setBurstPosition] = useState({ left: 0, top: 0 });
  const flyingIconRef = useRef(null);
  const [explosionText, setExplosionText] = useState(null);
  const [explosionTextOffset, setExplosionTextOffset] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [lastScoreTime, setLastScoreTime] = useState(Date.now());
  const [scoreFlash, setScoreFlash] = useState(null);
  const [scoreFlashAnim, setScoreFlashAnim] = useState(false);
  const typingHintState = useTypingHintOrScore(score, lastScoreTime);

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
        setIsBurst(false);
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

  // Flying icon click handler for burst effect
  const handleFlyingIconClick = (e) => {
    console.log('Flying icon clicked!');
    if (isBurst) return;
    // Get the position of the actual flying icon element
    const iconEl = document.querySelector('.flying-object');
    if (iconEl) {
      const rect = iconEl.getBoundingClientRect();
      setBurstPosition({ left: rect.left, top: rect.top });
    }
    // 60% chance to show explosion text
    if (Math.random() < 0.6) {
      setExplosionText(Math.random() < 0.5 ? 'BOOM!' : 'KABOOM!');
      // Random offset around the explosion (between -30 and +30 px)
      setExplosionTextOffset({
        x: Math.floor(Math.random() * 60) - 30,
        y: Math.floor(Math.random() * 60) - 30,
      });
    } else {
      setExplosionText(null);
    }
    setIsBurst(true);
    // Update score and flash message if needed
    setScore(prev => {
      const newScore = prev + 1;
      setLastScoreTime(Date.now());
      typingHintState.triggerScoreAnim();
      if (newScore % 5 === 0) {
        const flashMessages = ['NOICE', 'COOL', 'AWESOME'];
        setScoreFlash(flashMessages[(newScore / 5 - 1) % flashMessages.length]);
        setScoreFlashAnim(true);
        setTimeout(() => {
          setScoreFlashAnim(false);
          setTimeout(() => setScoreFlash(null), 350);
        }, 700);
      }
      return newScore;
    });
    setTimeout(() => {
      setShowFlyingIcon(false); // hide burst
      setTimeout(() => {
        setIsBurst(false);
        setExplosionText(null);
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
      }, getRandomInt(500, 1500));
    }, 400); // Show burst for 400ms
  };

  return (
    <>
      <main className="container">
        {/* Fun animated flying icon in the background */}
        <div className="flying-object-bg">
          {showFlyingIcon && (
            isBurst ? (
              (() => { console.log('Rendering burst'); return null; })() ||
              <div
                style={{
                  position: 'fixed',
                  left: burstPosition.left,
                  top: burstPosition.top,
                  width: 80,
                  height: 80,
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              >
                {/* Main burst */}
                <div style={{
                  position: 'absolute',
                  left: 20,
                  top: 20,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #FFD600 60%, #FF9100 100%)',
                  opacity: 0.85,
                  animation: 'burst-expand 0.4s ease-out forwards',
                }} />
                {/* Flames */}
                <div style={{
                  position: 'absolute', left: 10, top: 30, width: 18, height: 18, borderRadius: '50%', background: '#FF9100', opacity: 0.7, animation: 'flame1 0.4s ease-out forwards',
                }} />
                <div style={{
                  position: 'absolute', left: 52, top: 28, width: 14, height: 14, borderRadius: '50%', background: '#FF6F00', opacity: 0.6, animation: 'flame2 0.4s ease-out forwards',
                }} />
                {/* Smoke */}
                <div style={{
                  position: 'absolute', left: 28, top: 0, width: 16, height: 16, borderRadius: '50%', background: '#eee', opacity: 0.5, animation: 'smoke1 0.4s ease-out forwards',
                }} />
                <div style={{
                  position: 'absolute', left: 40, top: 4, width: 12, height: 12, borderRadius: '50%', background: '#bbb', opacity: 0.4, animation: 'smoke2 0.4s ease-out forwards',
                }} />
                {/* Explosion text */}
                {explosionText && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 40 + explosionTextOffset.x,
                      top: 40 + explosionTextOffset.y,
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 700,
                      fontSize: 14,
                      color: '#111',
                      textShadow: '0 1px 4px #fff, 0 0px 8px #FFD600',
                      opacity: 0.85,
                      pointerEvents: 'none',
                      animation: 'boom-fade 0.32s cubic-bezier(0.4,1.6,0.6,1) forwards',
                      userSelect: 'none',
                    }}
                  >
                    {explosionText}
                  </span>
                )}
                <style>{`
                  @keyframes burst-expand {
                    0% { transform: scale(0.5); opacity: 1; }
                    80% { transform: scale(1.2); opacity: 0.9; }
                    100% { transform: scale(1.6); opacity: 0; }
                  }
                  @keyframes flame1 {
                    0% { transform: scale(0.5); opacity: 0.7; }
                    100% { transform: scale(1.5) translateY(10px); opacity: 0; }
                  }
                  @keyframes flame2 {
                    0% { transform: scale(0.5); opacity: 0.6; }
                    100% { transform: scale(1.3) translateY(8px); opacity: 0; }
                  }
                  @keyframes smoke1 {
                    0% { transform: scale(0.7) translateY(0); opacity: 0.5; }
                    100% { transform: scale(1.2) translateY(-18px); opacity: 0; }
                  }
                  @keyframes smoke2 {
                    0% { transform: scale(0.7) translateY(0); opacity: 0.4; }
                    100% { transform: scale(1.1) translateY(-14px); opacity: 0; }
                  }
                  @keyframes boom-fade {
                    0% { opacity: 0; transform: scale(0.7) translateY(0); }
                    60% { opacity: 1; transform: scale(1.1) translateY(-6px); }
                    100% { opacity: 0; transform: scale(1.2) translateY(-12px); }
                  }
                `}</style>
              </div>
            ) : (
              (() => { console.log('Rendering flying icon'); return null; })() ||
              <span
                ref={flyingIconRef}
                onClick={handleFlyingIconClick}
                style={{ position: 'absolute', left: 0, top: 0, width: 'auto', height: 'auto', display: 'inline-block' }}
              >
                <FlyingIcon
                  key={flyingKey}
                  className="flying-object"
                  style={{ color: flyingColor, fontSize: flyingSize, animation: `${flyingAnimationName} 7s linear 1`, transform: `rotate(${flyingAngle}deg)` }}
                />
              </span>
            )
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
            <div style={{
              minHeight: '1.7em',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              position: 'relative',
            }}>
              {scoreFlash ? (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -60%) scale(${scoreFlashAnim ? 1.18 : 1})`,
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '1.1rem',
                    color: '#FF6F00',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    opacity: scoreFlashAnim ? 1 : 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.3s, transform 0.3s',
                    zIndex: 2,
                    textShadow: '0 1px 4px #fff, 0 0px 8px #FFD600',
                  }}
                >
                  {scoreFlash}
                </div>
              ) : typingHintState.showScore ? (
                <div
                  style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '1.05rem',
                    color: '#222',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    transition: 'opacity 0.3s',
                    opacity: 1,
                    minWidth: '7ch',
                    textAlign: 'center',
                    transform: typingHintState.scoreAnim ? 'scale(1.18)' : 'scale(1)',
                    transitionProperty: 'opacity, transform',
                    transitionDuration: '0.3s, 0.3s',
                    transitionTimingFunction: 'ease, cubic-bezier(0.4,1.6,0.6,1)',
                  }}
                >
                  SCORE {score.toString().padStart(3, '0')}
                </div>
              ) : typingHintState.typingHint && (
                <div style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '0.75rem',
                  color: '#888',
                  letterSpacing: '0.01em',
                  fontWeight: 500,
                  whiteSpace: 'pre',
                  transition: 'opacity 0.3s',
                  opacity: typingHintState.typingHint ? 1 : 0,
                }}>
                  {typingHintState.typingHint}
                  <span style={{
                    display: 'inline-block',
                    width: '1ch',
                    background: 'currentColor',
                    opacity: 0.5,
                    marginLeft: '2px',
                    animation: 'blink-cursor 1s steps(2, start) infinite',
                  }}>&nbsp;</span>
                </div>
              )}
            </div>
            <p style={{ marginTop: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>AI Product Manager working on Autonomous Agents</p>
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

      <style>{`
        @keyframes blink-cursor {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0; }
        }
      `}</style>
    </>
  );
} 