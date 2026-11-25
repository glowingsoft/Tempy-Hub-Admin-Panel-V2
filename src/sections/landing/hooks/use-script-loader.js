// Dynamic CDN and Script Loader with Fallbacks
// Loads GSAP 3.12.5, ScrollTrigger, Lenis, and Three.js r128 cleanly

const SCRIPT_DEFS = [
  { id: 'script-gsap', src: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js', global: 'gsap' },
  { id: 'script-scrolltrigger', src: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js', global: 'ScrollTrigger' },
  { id: 'script-flip', src: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Flip.min.js', global: 'Flip' },
  { id: 'script-motionpath', src: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/MotionPathPlugin.min.js', global: 'MotionPathPlugin' },
  { id: 'script-lenis', src: 'https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js', global: 'Lenis' },
  { id: 'script-three', src: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', global: 'THREE' },
];

export function loadScript(def) {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window[def.global]) {
      resolve(window[def.global]);
      return;
    }

    const existing = document.getElementById(def.id);
    if (existing) {
      existing.addEventListener('load', () => resolve(window[def.global]));
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
  const [gsap, ScrollTrigger, Flip, MotionPathPlugin, Lenis, THREE] = await Promise.all([
    loadScript(SCRIPT_DEFS[0]),
    loadScript(SCRIPT_DEFS[1]),
    loadScript(SCRIPT_DEFS[2]),
    loadScript(SCRIPT_DEFS[3]),
    loadScript(SCRIPT_DEFS[4]),
    loadScript(SCRIPT_DEFS[5]),
  ]);

  if (window.gsap) {
    if (window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);
    if (window.Flip) window.gsap.registerPlugin(window.Flip);
    if (window.MotionPathPlugin) window.gsap.registerPlugin(window.MotionPathPlugin);
  }

  return { gsap: window.gsap, ScrollTrigger: window.ScrollTrigger, Flip: window.Flip, MotionPathPlugin: window.MotionPathPlugin, Lenis: window.Lenis, THREE: window.THREE };
}
