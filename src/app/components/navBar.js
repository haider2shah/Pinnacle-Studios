'use client';

import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import navStyles from '../styles_css/navigationbar.module.css';
import MobileMenu from './menu'; // Capital 'M' and correct spelling


const NavBar = () => {
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState (false); 

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 80) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  });

  return (
    <div className={navStyles.navWrapper}>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className={navStyles.navbar}
      >
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
      </motion.nav>
      <AnimatePresence>
          {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default NavBar;
