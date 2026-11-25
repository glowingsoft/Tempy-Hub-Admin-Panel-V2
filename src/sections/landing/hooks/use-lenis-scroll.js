import { useEffect } from 'react';

/**
 * Initializes Lenis smooth scroll and wires it to GSAP ScrollTrigger
 */
export function useLenisScroll(enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;

    let isCancelled = false;
    let lenisInstance = null;
    let rafId = null;
    let timer = null;
    let tickerCallback = null;

    const init = () => {
      if (isCancelled || typeof window === 'undefined') return;

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
        if (window.ScrollTrigger && window.gsap) {
          lenisInstance.on('scroll', window.ScrollTrigger.update);

          tickerCallback = (time) => {
            lenisInstance?.raf(time * 1000);
          };
          window.gsap.ticker.add(tickerCallback);
          window.gsap.ticker.lagSmoothing(0);
        } else {
          const raf = (time) => {
            if (isCancelled || !lenisInstance) return;
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
      timer = setTimeout(init, 300);
    }

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
      if (rafId) cancelAnimationFrame(rafId);
      if (tickerCallback && window.gsap?.ticker) {
        window.gsap.ticker.remove(tickerCallback);
      }
      if (lenisInstance) {
        lenisInstance.destroy();
        lenisInstance = null;
      }
      window.__tempyLenis = null;
      window.lenis = null;
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling', 'lenis-stopped');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [enabled]);
}
