'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Drives native scrolling through Lenis so wheel input glides instead of
// stepping one notch at a time — scroll-linked animations (like the portfolio
// dock effect) inherit the smoothing for free. Touch scrolling stays native,
// and users who prefer reduced motion keep default scrolling.
//
// Lenis is stepped from GSAP's ticker (not its own rAF) so ScrollTrigger
// scrubs — like the 3D build journey — sample scroll position in the same
// frame Lenis writes it; two independent loops would trail by a frame.
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Duration + exponential ease-out is the classic "award site" glide:
    // each wheel tick melts into a long decelerating drift. The slightly
    // reduced wheel step slows everything scroll-driven (like the portfolio
    // hero) without changing any animation timing.
    const lenis = new Lenis({
      duration: 1.4,
      wheelMultiplier: 0.85,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time) => {
      lenis.raf(time * 1000); // gsap ticker reports seconds, Lenis wants ms
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
