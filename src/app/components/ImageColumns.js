'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from '../styles_css/ImageColumns.module.css';
import { AnimatePresence, motion, useScroll, useTransform, easeInOut } from 'framer-motion';

// Measure before first paint in the browser, without the SSR warning.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// All grid imagery uses the pre-sized WebP versions in /public/grid (see the
// optimize script) — the originals are multi-megabyte PNGs whose decode cost
// stalls the scroll thread and freezes the pinned animation.
const col1Images = [
  { id: 1,  src: '/grid/fintech-mockup.webp', alt: 'Fintech Website Design' },
  { id: 28, src: '/grid/pottery-mockup.webp', alt: 'Pottery Website Design' },
  { id: 2,  src: '/grid/real-estate-mockup.webp', alt: 'Real Estate Website Design' },
  { id: 41, src: '/grid/pharmacy-mockup.webp', alt: 'Pharmacy Website Design' },
];
const col2Images = [
  { id: 5,  src: '/grid/serum-mockup.webp', alt: 'Serum Website Design' },
  { id: 26, src: '/grid/logistics-mockup.webp', alt: 'Logistics Website Design' },
  { id: 30, src: '/grid/restaurant-mockup.webp', alt: 'Restaurant Website Design' },
];
const col3Images = [
  { id: 9,  src: '/grid/spa-mockup.webp', alt: 'Spa Website Design' },
  { id: 10, src: '/grid/car-rental-mockup.webp', alt: 'Car Rental Website Design' },
  { id: 11, src: '/grid/vending-mockup.webp', alt: 'Vending Solutions Website Design' },
  { id: 31, src: '/grid/automation-mockup.webp', alt: 'Automation Website Design' },
];
const col4Images = [
  { id: 13, src: '/grid/robotics-mockup.webp', alt: 'Robotics Website Design' },
  { id: 14, src: '/grid/travel-mockup.webp',  alt: 'Travel Website Design' },
  { id: 32, src: '/grid/medixa-mockup.webp', alt: 'Medixa Website Design' },
];
const col5Images = [
  { id: 25, src: '/grid/ebike-mockup.webp', alt: 'Ebike Website Design' },
  { id: 27, src: '/grid/dentist-mockup.webp', alt: 'Dentist Website Design' },
  { id: 29, src: '/grid/denim-mockup.webp', alt: 'Denim Website Design' },
  { id: 40, src: '/grid/nitrox-mockup.webp', alt: 'Nitrox Website Design' },
];

const COLUMNS = [
  { images: col1Images, offset: '0px'   },
  { images: col2Images, offset: '-40px' },
  { images: col3Images, offset: '0px'   },
  { images: col4Images, offset: '-40px' },
  { images: col5Images, offset: '0px'   },
];

const PORTFOLIO_ITEMS = COLUMNS.flatMap((column) => column.images);

const mobileRow1 = [
  { id: 'm1', src: '/grid/fintech-mockup.webp', alt: 'Fintech Website Design' },
  { id: 'm28', src: '/grid/pottery-mockup.webp', alt: 'Pottery Website Design' },
  { id: 'm2', src: '/grid/real-estate-mockup.webp', alt: 'Real Estate Website Design' },
  { id: 'm41', src: '/grid/pharmacy-mockup.webp', alt: 'Pharmacy Website Design' },
];
const mobileRow2 = [
  { id: 'm5', src: '/grid/serum-mockup.webp', alt: 'Serum Website Design' },
  { id: 'm26', src: '/grid/logistics-mockup.webp', alt: 'Logistics Website Design' },
  { id: 'm30', src: '/grid/restaurant-mockup.webp', alt: 'Restaurant Website Design' },
];
const mobileRow3 = [
  { id: 'm8',  src: '/grid/spa-mockup.webp', alt: 'Spa Website Design' },
  { id: 'm12', src: '/grid/car-rental-mockup.webp', alt: 'Car Rental Website Design' },
  { id: 'm13', src: '/grid/vending-mockup.webp', alt: 'Vending Solutions Website Design' },
  { id: 'm31', src: '/grid/automation-mockup.webp', alt: 'Automation Website Design' },
];
const mobileRow4 = [
  { id: 'm18', src: '/grid/robotics-mockup.webp', alt: 'Robotics Website Design' },
  { id: 'm21', src: '/grid/travel-mockup.webp', alt: 'Travel Website Design' },
  { id: 'm32', src: '/grid/medixa-mockup.webp', alt: 'Medixa Website Design' },
];
const mobileRow5 = [
  { id: 'm23', src: '/grid/ebike-mockup.webp', alt: 'Ebike Website Design' },
  { id: 'm27', src: '/grid/dentist-mockup.webp', alt: 'Dentist Website Design' },
  { id: 'm29', src: '/grid/denim-mockup.webp', alt: 'Denim Website Design' },
  { id: 'm40', src: '/grid/nitrox-mockup.webp', alt: 'Nitrox Website Design' },
];

// Timeline over the section's full transit: 0 = it enters at the bottom of
// the viewport, ~0.5 = fully on screen, 1 = it has scrolled out the top.
// There is no pinning — the hero rides up full-size through the hold, then
// shrinks and docks while the page keeps scrolling (landing as the section
// reaches full view), and the grid keeps drifting until the section is
// completely scrolled through.
// (Fractions retuned for the 130vh stage so the absolute scroll pacing and
// the on-screen landing moment match the 100vh version.)
const HOLD = 0.05;         // hero stays at full size until here
const DOCK_AT = 0.47;      // featured image finishes docking into the grid
const FADE = [0.5, 0.59];  // featured copy fades out, revealing the grid cell
// How far into the shrink the box reaches the card's (square-ish) aspect —
// from there it scales down uniformly in that form. Without this early
// convergence the box stays a wide rectangle for most of the flight.
const SQUARE_FRACTION = 0.35;
// Vertical scroll drift for each desktop column (px over the full transit).
const COL_DRIFT = [-160, 140, -220, 130, -180];
// Horizontal drift of the first mobile row (the one the featured image docks
// into): keep it nearly still until the dock completes so the landing card
// stays on screen, then let it slide with the others.
const ROW1_X_AT_DOCK = -40;
const ROW1_X_AT_END = -340;
const LIGHTBOX_LAYOUT_DURATION = 0.82;

const lightboxImageVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction >= 0 ? 46 : -46,
    scale: 0.985,
    filter: 'blur(12px)',
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction >= 0 ? -46 : 46,
    scale: 0.985,
    filter: 'blur(12px)',
  }),
};

function ArrowIcon({ direction }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {direction === 'previous' ? (
        <path d="M15.5 5.5 9 12l6.5 6.5" />
      ) : (
        <path d="m8.5 5.5 6.5 6.5-6.5 6.5" />
      )}
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6.5 6.5 17.5 17.5" />
      <path d="M17.5 6.5 6.5 17.5" />
    </svg>
  );
}

export default function ImageColumns() {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const firstCardRef = useRef(null);
  const firstMobileCardRef = useRef(null);
  const bodyOverflowRef = useRef('');
  const scrollLockedRef = useRef(false);
  const closeStateRef = useRef({
    active: false,
    layoutDone: false,
    exitDone: false,
  });
  const [lightbox, setLightbox] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [slideDirection, setSlideDirection] = useState(0);
  const selectedItem = lightbox == null ? null : PORTFOLIO_ITEMS[lightbox.index];
  const wrapIndex = (index) => (index + PORTFOLIO_ITEMS.length) % PORTFOLIO_ITEMS.length;

  const lockBodyScroll = useCallback(() => {
    if (typeof document === 'undefined' || scrollLockedRef.current) return;

    bodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    scrollLockedRef.current = true;
  }, []);

  const unlockBodyScroll = useCallback(() => {
    if (typeof document === 'undefined' || !scrollLockedRef.current) return;

    document.body.style.overflow = bodyOverflowRef.current;
    scrollLockedRef.current = false;
  }, []);

  const finalizeClose = useCallback(() => {
    const closeState = closeStateRef.current;
    if (!closeState.active || !closeState.layoutDone || !closeState.exitDone) return;

    closeStateRef.current = {
      active: false,
      layoutDone: false,
      exitDone: false,
    };

    unlockBodyScroll();
    setLightbox(null);
  }, [unlockBodyScroll]);

  const markLayoutDone = useCallback(() => {
    if (!closeStateRef.current.active) return;

    closeStateRef.current.layoutDone = true;
    finalizeClose();
  }, [finalizeClose]);

  const markExitDone = useCallback(() => {
    if (!closeStateRef.current.active) return;

    closeStateRef.current.exitDone = true;
    finalizeClose();
  }, [finalizeClose]);

  const openLightbox = (index, layoutId) => {
    if (index < 0) return;

    setSlideDirection(0);
    closeStateRef.current = {
      active: false,
      layoutDone: false,
      exitDone: false,
    };
    setIsLightboxOpen(true);
    setLightbox({
      index,
      layoutId,
    });
  };

  const closeLightbox = useCallback(() => {
    if (lightbox == null || selectedItem == null) return;

    closeStateRef.current = {
      active: true,
      layoutDone: false,
      exitDone: false,
    };
    setIsLightboxOpen(false);
  }, [lightbox, selectedItem]);

  const moveLightbox = (step) => {
    setSlideDirection(step > 0 ? 1 : -1);
    setLightbox((current) => {
      if (current == null) return current;
      return {
        ...current,
        index: (current.index + step + PORTFOLIO_ITEMS.length) % PORTFOLIO_ITEMS.length,
      };
    });
  };

  const jumpLightbox = (index) => {
    setSlideDirection(lightbox == null || index >= lightbox.index ? 1 : -1);
    setLightbox((current) => (current == null ? current : { ...current, index }));
  };

  // The featured image is laid out at the exact size of the first grid card
  // and animated with transforms only — never width/height, which would
  // force a layout + repaint on every frame. Its top-left corner is glued to
  // the first card's top-left corner for the entire flight (transform-origin
  // top left), so it opens as a near-full-bleed panel extending right/down
  // and collapses from the right into the card; the inner image
  // counter-scales so the picture itself never distorts.
  // Measured from the real layout before first paint and on resize; these
  // initial values only matter if measuring fails.
  const [dock, setDock] = useState({
    desktop: { w1: 310, h1: 260, sx0: 4.6, sy0: 3.1, x: -100, yTop: 70 },
    mobile: { w1: 240, h1: 176, sx0: 1.5, sy0: 2.9, xLeft: 0, yTop: 50 },
  });

  // 'start end' → 'end start' spans the section's entire pass through the
  // viewport, so the hero eases down while scrolling into place and the grid
  // keeps moving until the section has fully scrolled out the top.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Scroll smoothing lives at the page level (Lenis, in SmoothScroll.js), so
  // every transform below maps 1:1 onto the smoothed scroll with zero lag —
  // the featured image and its landing cell always move in lockstep.
  const progress = scrollYProgress;

  const yCol1 = useTransform(progress, [0, 1], [0, COL_DRIFT[0]]);
  const yCol2 = useTransform(progress, [0, 1], [0, COL_DRIFT[1]]);
  const yCol3 = useTransform(progress, [0, 1], [0, COL_DRIFT[2]]);
  const yCol4 = useTransform(progress, [0, 1], [0, COL_DRIFT[3]]);
  const yCol5 = useTransform(progress, [0, 1], [0, COL_DRIFT[4]]);
  const yValues = [yCol1, yCol2, yCol3, yCol4, yCol5];

  // Eased time for the shrink: 0 at HOLD, 1 at DOCK_AT, easing in and out so
  // the hero leaves the hold gently and decelerates into the landing instead
  // of hitting it at full speed (a linear map stops with a visible jerk).
  const shrink = useTransform(progress, [HOLD, DOCK_AT], [0, 1], { ease: easeInOut });

  // Box morph: the outer element's aspect changes via independent axis
  // scales while the inner image counter-scales to the larger axis, so the
  // visible picture stays uniformly scaled (just cropped wider or tighter).
  // Both axes pass through the same scale at SQUARE_FRACTION of the shrink,
  // so from there the box is card-shaped and shrinks uniformly.
  const dSquare =
    Math.min(dock.desktop.sx0, dock.desktop.sy0) +
    SQUARE_FRACTION * (1 - Math.min(dock.desktop.sx0, dock.desktop.sy0));
  const featuredScaleX = useTransform(
    shrink,
    [0, SQUARE_FRACTION, 1],
    [dock.desktop.sx0, dSquare, 1]
  );
  const featuredScaleY = useTransform(
    shrink,
    [0, SQUARE_FRACTION, 1],
    [dock.desktop.sy0, dSquare, 1]
  );
  const featuredInnerX = useTransform([featuredScaleX, featuredScaleY], ([sx, sy]) => Math.max(sx, sy) / sx);
  const featuredInnerY = useTransform([featuredScaleX, featuredScaleY], ([sx, sy]) => Math.max(sx, sy) / sy);
  // The corner tracks column 1's drift the whole time (x never moves), so
  // the hero and its landing card can never separate.
  const featuredY = useTransform(progress, [0, 1], [dock.desktop.yTop, dock.desktop.yTop + COL_DRIFT[0]]);
  // Corner rounding under a non-uniform scale: a single radius renders as an
  // ellipse (r·sx by r·sy), which smears the corners on the big image. So
  // pick the rendered radius we want, then emit per-axis "rx / ry" radii
  // divided by the live scales — corners stay circular at every frame.
  const featuredRadiusPx = useTransform(shrink, [0, 1], [28, 20]);
  const featuredRadius = useTransform(
    [featuredRadiusPx, featuredScaleX, featuredScaleY],
    ([r, sx, sy]) => `${r / sx}px / ${r / sy}px`
  );
  // Shadows scale with the element too, so these are authored in card-space.
  const featuredShadow = useTransform(
    shrink,
    [0, 1],
    ['0 12px 36px rgba(170, 255, 0, 0.28)', '0 6px 24px rgba(0, 0, 0, 0.18)']
  );
  // Grid fades in once the featured image is halfway through its travel;
  // the featured copy fades out only after it has docked over its cell.
  const gridOpacity = useTransform(progress, [DOCK_AT / 2, DOCK_AT], [0, 1]);
  const featuredOpacity = useTransform(progress, FADE, [1, 0]);

  const mSquare =
    Math.min(dock.mobile.sx0, dock.mobile.sy0) +
    SQUARE_FRACTION * (1 - Math.min(dock.mobile.sx0, dock.mobile.sy0));
  const featuredMobileScaleX = useTransform(
    shrink,
    [0, SQUARE_FRACTION, 1],
    [dock.mobile.sx0, mSquare, 1]
  );
  const featuredMobileScaleY = useTransform(
    shrink,
    [0, SQUARE_FRACTION, 1],
    [dock.mobile.sy0, mSquare, 1]
  );
  const featuredMobileInnerX = useTransform([featuredMobileScaleX, featuredMobileScaleY], ([sx, sy]) => Math.max(sx, sy) / sx);
  const featuredMobileInnerY = useTransform([featuredMobileScaleX, featuredMobileScaleY], ([sx, sy]) => Math.max(sx, sy) / sy);
  // The corner follows row 1's horizontal drift so it stays glued to the
  // landing card; vertically the rows never move.
  const featuredMobileX = useTransform(
    progress,
    [0, DOCK_AT, 1],
    [dock.mobile.xLeft, dock.mobile.xLeft + ROW1_X_AT_DOCK, dock.mobile.xLeft + ROW1_X_AT_END]
  );
  const featuredMobileRadiusPx = useTransform(shrink, [0, 1], [18, 14.4]);
  const featuredMobileRadius = useTransform(
    [featuredMobileRadiusPx, featuredMobileScaleX, featuredMobileScaleY],
    ([r, sx, sy]) => `${r / sx}px / ${r / sy}px`
  );

  const xRow1 = useTransform(progress, [0, DOCK_AT, 1], [0, ROW1_X_AT_DOCK, ROW1_X_AT_END]);
  const xRow2 = useTransform(progress, [0, 1], [-400, 0]);
  const xRow3 = useTransform(progress, [0, 1], [0, -420]);
  const xRow4 = useTransform(progress, [0, 1], [-400, 0]);
  const xRow5 = useTransform(progress, [0, 1], [0, 360]);

  useIsoLayoutEffect(() => {
    const measure = () => {
      const stage = stageRef.current;
      if (!stage) return;
      // The stage is never transformed, so its rect is a reliable anchor
      // even mid-animation. Everything is measured as the landing card's
      // top-left corner relative to the stage, drift stripped.
      const sRect = stage.getBoundingClientRect();

      setDock((prev) => {
        const next = { ...prev };

        const card = firstCardRef.current;
        if (card && card.offsetWidth > 0) {
          const cRect = card.getBoundingClientRect();
          const cLx = cRect.left - sRect.left;
          const cTy = cRect.top - sRect.top - yCol1.get();
          // Opening panel: from the anchored corner out to near the right
          // edge of the stage, 85% of the *viewport* height (the stage is
          // taller than the screen) — expressed as per-axis scales of the card.
          const sx0 = Math.max(1.1, (sRect.width * 0.96 - cLx) / card.offsetWidth);
          const sy0 = Math.max(1.1, (window.innerHeight * 0.85) / card.offsetHeight);
          next.desktop = {
            w1: card.offsetWidth,
            h1: card.offsetHeight,
            sx0,
            sy0,
            x: cLx,
            yTop: cTy,
          };
        }

        const cardM = firstMobileCardRef.current;
        if (cardM && cardM.offsetWidth > 0) {
          const cRect = cardM.getBoundingClientRect();
          const cLxM = cRect.left - sRect.left - xRow1.get();
          const cTyM = cRect.top - sRect.top;
          const sx0 = Math.max(1.05, (sRect.width * 0.94 - cLxM) / cardM.offsetWidth);
          const sy0 = Math.max(1.05, (window.innerHeight * 0.6) / cardM.offsetHeight);
          next.mobile = {
            w1: cardM.offsetWidth,
            h1: cardM.offsetHeight,
            sx0,
            sy0,
            xLeft: cLxM,
            yTop: cTyM,
          };
        }

        return next;
      });
    };

    measure();
    // Re-measure once everything has settled (restored scroll position, fonts,
    // late layout shifts) — the mount-time numbers can be off in those cases.
    const settle = setTimeout(measure, 500);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(settle);
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    if (lightbox == null) return;

    lockBodyScroll();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeLightbox();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setSlideDirection(-1);
        setLightbox((current) => {
          if (current == null) return current;
          return {
            ...current,
            index: (current.index - 1 + PORTFOLIO_ITEMS.length) % PORTFOLIO_ITEMS.length,
            layoutId: null,
          };
        });
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setSlideDirection(1);
        setLightbox((current) => {
          if (current == null) return current;
          return {
            ...current,
            index: (current.index + 1) % PORTFOLIO_ITEMS.length,
            layoutId: null,
          };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeLightbox, lightbox, lockBodyScroll]);

  useEffect(() => () => {
    unlockBodyScroll();
    closeStateRef.current = {
      active: false,
      layoutDone: false,
      exitDone: false,
    };
  }, [unlockBodyScroll]);

  return (
    <section ref={containerRef} className={styles.container}>
      <div ref={stageRef} className={styles.stage}>
        <motion.div
          className={styles.featuredImage}
          style={{
            width: dock.desktop.w1,
            height: dock.desktop.h1,
            x: dock.desktop.x,
            y: featuredY,
            scaleX: featuredScaleX,
            scaleY: featuredScaleY,
            borderRadius: featuredRadius,
            boxShadow: featuredShadow,
            opacity: featuredOpacity,
          }}
          aria-hidden="true"
        >
          <motion.div className={styles.featuredInner} style={{ scaleX: featuredInnerX, scaleY: featuredInnerY }}>
            <Image src="/grid/fintech-mockup.webp" alt="" width={900} height={600} className={styles.image} priority />
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.featuredMobileImage}
          style={{
            width: dock.mobile.w1,
            height: dock.mobile.h1,
            x: featuredMobileX,
            y: dock.mobile.yTop,
            scaleX: featuredMobileScaleX,
            scaleY: featuredMobileScaleY,
            borderRadius: featuredMobileRadius,
            opacity: featuredOpacity,
          }}
          aria-hidden="true"
        >
          <motion.div className={styles.featuredInner} style={{ scaleX: featuredMobileInnerX, scaleY: featuredMobileInnerY }}>
            <Image src="/grid/fintech-mockup.webp" alt="" width={600} height={430} className={styles.image} priority />
          </motion.div>
        </motion.div>

        <motion.div className={styles.gridWrapper} style={{ opacity: gridOpacity }}>
          {COLUMNS.map((col, colIndex) => (
            <motion.div
              key={colIndex}
              className={styles.column}
              style={{ y: yValues[colIndex], marginTop: col.offset }}
            >
              {col.images.map((img, imgIndex) => (
                <motion.button
                  key={img.id}
                  type="button"
                  ref={colIndex === 0 && imgIndex === 0 ? firstCardRef : undefined}
                  className={styles.imageCard}
                  data-card
                  layoutId={`portfolio-card-${img.id}`}
                  aria-label={`Expand ${img.alt}`}
                  onClick={() => openLightbox(
                    PORTFOLIO_ITEMS.findIndex((item) => item.id === img.id),
                    `portfolio-card-${img.id}`
                  )}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
                    zIndex: 20,
                    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                  }}
                  whileTap={{ scale: 0.985 }}
                >
                  {/* Eager: the pinned stage reveals all cards at once, so lazy
                      loading would make them pop in after the fade. */}
                  <Image src={img.src} alt={img.alt} width={600} height={400} className={styles.image} loading="eager" />
                </motion.button>
              ))}
            </motion.div>
          ))}
        </motion.div>

        <motion.div className={styles.mobileRows} style={{ opacity: gridOpacity }}>
          {[
            { row: mobileRow1, x: xRow1 },
            { row: mobileRow2, x: xRow2 },
            { row: mobileRow3, x: xRow3 },
            { row: mobileRow4, x: xRow4 },
            { row: mobileRow5, x: xRow5 },
          ].map(({ row, x }, i) => (
            <motion.div key={i} className={styles.mobileRow} style={{ x }}>
              {row.map((img, imgIndex) => (
                <motion.button
                  type="button"
                  key={img.id}
                  ref={i === 0 && imgIndex === 0 ? firstMobileCardRef : undefined}
                  className={styles.mobileCard}
                  data-card
                  layoutId={`portfolio-mobile-card-${img.id}`}
                  aria-label={`Expand ${img.alt}`}
                  onClick={() => openLightbox(
                    PORTFOLIO_ITEMS.findIndex((item) => item.src === img.src),
                    `portfolio-mobile-card-${img.id}`
                  )}
                  whileTap={{ scale: 0.985 }}
                >
                  <Image src={img.src} alt={img.alt} width={400} height={300} className={styles.image} loading="eager" />
                </motion.button>
              ))}
            </motion.div>
          ))}
        </motion.div>
      </div>

      <AnimatePresence
        onExitComplete={markExitDone}
      >
        {isLightboxOpen && selectedItem && (
          <motion.div
            className={styles.lightboxOverlay}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.999 }}
            transition={{ duration: 0.82, ease: [0.16, 1, 0.3, 1] }}
            onClick={closeLightbox}
          >
            <motion.div
              className={styles.lightboxBackdrop}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            />

            <motion.div
              className={styles.lightboxFrame}
              role="dialog"
              aria-modal="true"
              aria-label={`${selectedItem.alt} expanded preview`}
              onClick={(event) => event.stopPropagation()}
              layoutId={lightbox.layoutId || undefined}
              onLayoutAnimationComplete={markLayoutDone}
              transition={{
                layout: {
                  duration: LIGHTBOX_LAYOUT_DURATION,
                  ease: [0.16, 1, 0.3, 1],
                },
              }}
            >
              <button
                type="button"
                className={styles.lightboxClose}
                aria-label="Close image preview"
                onClick={closeLightbox}
              >
                <CloseIcon />
              </button>

              <motion.div className={styles.lightboxImageShell}>
                <AnimatePresence mode="wait" custom={slideDirection} initial={false}>
                  <motion.div
                    key={selectedItem.id}
                    className={styles.lightboxImageLayer}
                    custom={slideDirection}
                    variants={lightboxImageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Image
                      src={selectedItem.src}
                      alt={selectedItem.alt}
                      fill
                      sizes="(max-width: 768px) 95vw, 1280px"
                      className={styles.lightboxImage}
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              <div className={styles.lightboxControls} aria-label="Portfolio image navigation">
                <button
                  type="button"
                  className={`${styles.lightboxNavButton} ${styles.lightboxPrev}`}
                  aria-label="Show previous portfolio image"
                  onClick={() => moveLightbox(-1)}
                >
                  <ArrowIcon direction="previous" />
                </button>

                <button
                  type="button"
                  className={`${styles.lightboxNavButton} ${styles.lightboxNext}`}
                  aria-label="Show next portfolio image"
                  onClick={() => moveLightbox(1)}
                >
                  <ArrowIcon direction="next" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
