// Dynamic CDN and Script Loader with Fallbacks
// Loads GSAP 3.12.5, ScrollTrigger, and Lenis cleanly

const SCRIPT_DEFS = [
  { id: 'script-gsap', src: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js', global: 'gsap' },
  { id: 'script-scrolltrigger', src: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js', global: 'ScrollTrigger' },
  { id: 'script-lenis', src: 'https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js', global: 'Lenis' },
];

export function loadScript(def) {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window[def.global]) {
      resolve(window[def.global]);
      return;
    }

    const existing = document.getElementById(def.id);
    if (existing) {
      if (window[def.global]) {
        resolve(window[def.global]);
        return;
      }
      const fallbackTimer = setTimeout(() => resolve(window[def.global] || null), 3000);
      existing.addEventListener(
        'load',
        () => {
          clearTimeout(fallbackTimer);
          resolve(window[def.global] || null);
        },
        { once: true }
      );
      existing.addEventListener(
        'error',
        () => {
          clearTimeout(fallbackTimer);
          resolve(null);
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.id = def.id;
    script.src = def.src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      resolve(window[def.global]);
    };
    script.onerror = () => {
      console.warn(`Failed loading ${def.id} from CDN`);
      resolve(null);
    };
    document.head.appendChild(script);
  });
}

export async function loadAllLandingLibraries() {
  await Promise.all(SCRIPT_DEFS.map(loadScript));

  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  return { gsap: window.gsap, ScrollTrigger: window.ScrollTrigger, Lenis: window.Lenis };
}
