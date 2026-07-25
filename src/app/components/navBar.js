'use client';

import { useRef, useState } from 'react';
import { useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import navStyles from '../styles_css/navigationbar.module.css';
import MobileMenu from './menu'; // Capital 'M' and correct spelling


const NavBar = () => {
  const { scrollY, scrollYProgress } = useScroll();
  const [isVisible, setIsVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const percentRef = useRef(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 80) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  });

  // Live page-scroll percentage, written straight to the DOM so the navbar
  // never re-renders while scrolling.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (percentRef.current) {
      percentRef.current.textContent = `${Math.round(v * 100)}%`;
    }
  });

  return (
    <div className={navStyles.navWrapper}>
      {/* Scrolling down shrinks the bar from both sides into a pill with
          just the logo + scroll percentage (desktop); scrolling up expands
          it back. On mobile it slides away as before. */}
      <nav className={`${navStyles.navbar} ${isVisible ? '' : navStyles.shrunk}`}>
        <div className={navStyles.menu}>
          <img
            src="/menu.svg"
            className={navStyles.menuIcon}
            onClick = {() => setMenuOpen(true)}
            />

          <div className={navStyles.logo}>Pinnacle Studios.</div>
        </div>

        <ul className={navStyles['nav-links']}>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/about">About us</Link></li>
          <li><Link href="/services">Services</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>

        <button type="button" className={navStyles.button}> Contact us</button>

        <span ref={percentRef} className={navStyles.percent} aria-hidden="true">0%</span>
      </nav>
      <AnimatePresence>
          {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default NavBar;
