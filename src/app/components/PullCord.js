'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import styles from '../styles_css/PullCord.module.css';

// Ceiling-fan pull cord: sways like a slow pendulum until grabbed, stretches
// as the user drags it down, and fires onPull the moment the pull passes the
// threshold — like the click of a real fan cord — then springs back up.
export default function PullCord({ onPull }) {
  const pull = useMotionValue(0);
  const stringHeight = useTransform(pull, (v) => 140 + v);
  const [grabbed, setGrabbed] = useState(false);
  const grabbedRef = useRef(false);
  const startY = useRef(0);
  const fired = useRef(false);

  const release = (e) => {
    if (!grabbedRef.current) return;
    grabbedRef.current = false;
    setGrabbed(false);
    fired.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    animate(pull, 0, { type: 'spring', stiffness: 400, damping: 17 });
  };

  return (
    <div className={`${styles.cordWrap} ${grabbed ? styles.grabbed : ''}`}>
      <motion.div className={styles.string} style={{ height: stringHeight }} />
      <div
        className={styles.grip}
        role="button"
        tabIndex={0}
        aria-label="Pull the cord"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          pull.stop();
          startY.current = e.clientY - pull.get();
          grabbedRef.current = true;
          setGrabbed(true);
        }}
        onPointerMove={(e) => {
          if (!grabbedRef.current) return;
          const v = Math.max(0, Math.min(150, e.clientY - startY.current));
          pull.set(v);
          // The "click" of the cord: fires while still holding, once per grab.
          if (v > 25 && !fired.current) {
            fired.current = true;
            onPull?.();
          }
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onPull?.();
            animate(pull, [0, 80, 0], { duration: 0.5, ease: 'easeInOut' });
          }
        }}
      >
        <div className={styles.bead} />
      </div>
      <span className={styles.pullLabel}>pull</span>
    </div>
  );
}
