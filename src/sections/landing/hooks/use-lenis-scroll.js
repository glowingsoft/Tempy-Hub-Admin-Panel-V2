import { useEffect } from 'react';

/**
 * Initializes Lenis smooth scroll and wires it to GSAP ScrollTrigger
 */
export function useLenisScroll() {
  useEffect(() => {
    let lenisInstance = null;
    let rafId = null;

    const init = () => {
      if (typeof window === 'undefined') return;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      if (window.Lenis) {
        lenisInstance = new window.Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          direction: 'vertical',
          gestureDirection: 'vertical',
          smooth: true,
          smoothTouch: false,
          touchMultiplier: 2,
        });

        // Wire to ScrollTrigger
        if (window.ScrollTrigger) {
          lenisInstance.on('scroll', window.ScrollTrigger.update);

          window.gsap?.ticker.add((time) => {
            lenisInstance.raf(time * 1000);
          });
          window.gsap?.ticker.lagSmoothing(0);
        } else {
          const raf = (time) => {
            lenisInstance.raf(time);
            rafId = requestAnimationFrame(raf);
          };
          rafId = requestAnimationFrame(raf);
        }

        window.__tempyLenis = lenisInstance;
        window.lenis = lenisInstance;
      }
    };

    if (window.Lenis) {
      init();
    } else {
      const timer = setTimeout(init, 300);
      return () => clearTimeout(timer);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenisInstance) {
        lenisInstance.destroy();
        window.__tempyLenis = null;
      }
    };
  }, []);
}
