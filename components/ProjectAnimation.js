import { useEffect } from 'react';
import { STAGGER_DELAY, INITIAL_DELAY } from '../config/constants';

export default function useProjectAnimation(projectRefs, observerRef) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      projectRefs.current.forEach(card => {
        if (card) card.classList.add('visible');
      });
      return;
    }

    // Initial animation with quick stagger
    projectRefs.current.forEach((card, index) => {
      if (card) {
        // Start first card almost immediately, then stagger others
        const delay = index === 0 ? INITIAL_DELAY : STAGGER_DELAY * index;
        setTimeout(() => {
          requestAnimationFrame(() => {
            card.classList.add('visible');
          });
        }, delay);
      }
    });

    // Scroll animation
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting && !entry.target.classList.contains('visible')) {
            // Add same stagger effect for scroll animations
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

    projectRefs.current.forEach((card) => {
      if (card) {
        observerRef.current.observe(card);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [projectRefs, observerRef]);
} 