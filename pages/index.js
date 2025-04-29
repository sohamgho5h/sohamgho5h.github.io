import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { LinkedInIcon, GitHubIcon, XIcon } from '../components/icons/SocialIcons';
import Modal from '../components/Modal';
import useProjectAnimation from '../components/ProjectAnimation';
import { companies, ANIMATION_DURATION, STAGGER_DELAY, INITIAL_DELAY, SOCIAL_LINKS } from '../config/constants';
import { getRandomPastelColor, calculateModalDimensions } from '../utils/helpers';

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [lastFocusedElement, setLastFocusedElement] = useState(null);
  const projectRefs = useRef([]);
  const logoRefs = useRef([]);
  const observerRef = useRef(null);
  const modalCardRef = useRef(null);
  const clickedCardRef = useRef(null);

  // Initialize project and logo animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Handle initial visibility
    if (prefersReducedMotion) {
      [...projectRefs.current, ...logoRefs.current].forEach(el => {
        if (el) el.classList.add('visible');
      });
      return;
    }

    // Initial animation with quick stagger
    const allElements = [...logoRefs.current, ...projectRefs.current];
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

    // Scroll animation observer
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
        observerRef.current.observe(el);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Pre-generate random colors for consistency
  const projectColors = Array(6).fill().map(() => getRandomPastelColor());

  const closeModal = () => {
    if (!modalCardRef.current || !clickedCardRef.current || isClosing) return;
    
    setIsClosing(true);
    setModalContent(false);
    
    const cardRect = clickedCardRef.current.getBoundingClientRect();

    // Animate back to the card's position and size
    requestAnimationFrame(() => {
      if (modalCardRef.current) {
        modalCardRef.current.style.width = `${cardRect.width}px`;
        modalCardRef.current.style.height = `${cardRect.height}px`;
        modalCardRef.current.style.left = `${cardRect.left}px`;
        modalCardRef.current.style.top = `${cardRect.top}px`;
      }
    });

    // After animation completes
    setTimeout(() => {
      setModalOpen(false);
      setIsClosing(false);
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
      // Reset modal card styles
      if (modalCardRef.current) {
        modalCardRef.current.style.transform = '';
      }
    }, ANIMATION_DURATION);
  };

  const openModal = (e) => {
    if (isClosing) return;
    const card = e.currentTarget;
    clickedCardRef.current = card;
    setLastFocusedElement(card);

    // Get the clicked card's position and size
    const cardRect = card.getBoundingClientRect();
    const { width, maxHeight, left, top } = calculateModalDimensions(window);
    
    // Set initial position and size
    if (modalCardRef.current) {
      modalCardRef.current.style.width = `${cardRect.width}px`;
      modalCardRef.current.style.height = `${cardRect.height}px`;
      modalCardRef.current.style.left = `${cardRect.left}px`;
      modalCardRef.current.style.top = `${cardRect.top}px`;
      modalCardRef.current.style.background = card.style.backgroundColor;

      // Trigger the animation in the next frame
      requestAnimationFrame(() => {
        modalCardRef.current.style.width = `${width}px`;
        modalCardRef.current.style.height = 'auto';
        modalCardRef.current.style.maxHeight = `${maxHeight}px`;
        modalCardRef.current.style.left = `${left}px`;
        modalCardRef.current.style.top = `${top}px`;
      });
    }

    setModalOpen(true);

    // Show content after animation
    setTimeout(() => {
      setModalContent(true);
    }, ANIMATION_DURATION);
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
              <p>with learnings from</p>
              <div className="logo-grid">
                {companies.map((company, index) => (
                  <div 
                    key={company.name} 
                    ref={(el) => (logoRefs.current[index] = el)}
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
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="projects">
          <h2 className="projects-heading">Featured work</h2>
          <div className="projects-grid">
            {[1, 2, 3, 4, 5, 6].map((num, index) => (
              <button
                key={num}
                className="project-card"
                onClick={openModal}
                style={{ backgroundColor: projectColors[index] }}
                aria-haspopup="dialog"
                ref={(el) => (projectRefs.current[index] = el)}
              >
                Project {num}
              </button>
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

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        modalRef={modalCardRef}
        contentVisible={modalContent}
        isClosing={isClosing}
      >
        <h1>Sample Project Title</h1>
        <p>This is some <strong>Markdown</strong> content:</p>
        <ul>
          <li>bullet one</li>
          <li>bullet two</li>
          <li>bullet three</li>
        </ul>
        <blockquote>
          "Autonomous agents are transforming customer service."
        </blockquote>
      </Modal>
    </>
  );
}