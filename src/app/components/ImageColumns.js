'use client';

import { useRef } from 'react';
import Image from 'next/image';
import styles from '../styles_css/ImageColumns.module.css';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const col1Images = [
  { id: 1,  src: '/SF.png', alt: 'Project 1' },
  { id: 2,  src: '/SF.png', alt: 'Project 2' },
  { id: 3,  src: '/SF.png', alt: 'Project 3' },
  { id: 4,  src: '/SF.png', alt: 'Project 4' },
];
const col2Images = [
  { id: 5,  src: '/SF.png', alt: 'Project 5' },
  { id: 6,  src: '/SF.png', alt: 'Project 6' },
  { id: 7,  src: '/SF.png', alt: 'Project 7' },
  { id: 8,  src: '/SF.png', alt: 'Project 8' },
];
const col3Images = [
  { id: 9,  src: '/SF.png', alt: 'Project 9' },
  { id: 10, src: '/SF.png', alt: 'Project 10' },
  { id: 11, src: '/SF.png', alt: 'Project 11' },
  { id: 12, src: '/SF.png', alt: 'Project 12' },
];
const col4Images = [
  { id: 13, src: '/SF.png', alt: 'Project 13' },
  { id: 14, src: '/SF.png', alt: 'Project 14' },
  { id: 15, src: '/SF.png', alt: 'Project 15' },
  { id: 16, src: '/SF.png', alt: 'Project 16' },
];
const col5Images = [
  { id: 17, src: '/SF.png', alt: 'Project 17' },
  { id: 18, src: '/SF.png', alt: 'Project 18' },
  { id: 19, src: '/SF.png', alt: 'Project 19' },
  { id: 20, src: '/SF.png', alt: 'Project 20' },
];

const COLUMNS = [
  { images: col1Images, offset: '0px'   },
  { images: col2Images, offset: '-40px' },
  { images: col3Images, offset: '0px'   },
  { images: col4Images, offset: '-40px' },
  { images: col5Images, offset: '0px'   },
];

// Mobile rows — 5 images each for a dense sliding strip
const mobileRow1 = [
  { id: 'm1', src: '/SF.png', alt: 'Project 1' },
  { id: 'm2', src: '/SF.png', alt: 'Project 2' },
  { id: 'm3', src: '/SF.png', alt: 'Project 3' },
  { id: 'm4', src: '/SF.png', alt: 'Project 4' },
  { id: 'm5', src: '/SF.png', alt: 'Project 5' },
];
const mobileRow2 = [
  { id: 'm17', src: '/SF.png', alt: 'Project 17' },
  { id: 'm6',  src: '/SF.png', alt: 'Project 6' },
  { id: 'm7',  src: '/SF.png', alt: 'Project 7' },
  { id: 'm8',  src: '/SF.png', alt: 'Project 8' },
  { id: 'm9',  src: '/SF.png', alt: 'Project 9' },
  { id: 'm10', src: '/SF.png', alt: 'Project 10' },
  { id: 'm16', src: '/SF.png', alt: 'Project 16' },
];
const mobileRow3 = [
  { id: 'm11', src: '/SF.png', alt: 'Project 11' },
  { id: 'm12', src: '/SF.png', alt: 'Project 12' },
  { id: 'm13', src: '/SF.png', alt: 'Project 13' },
  { id: 'm14', src: '/SF.png', alt: 'Project 14' },
  { id: 'm15', src: '/SF.png', alt: 'Project 15' },
];
const mobileRow4 = [
  { id: 'm18', src: '/SF.png', alt: 'Project 18' },
  { id: 'm19', src: '/SF.png', alt: 'Project 19' },
  { id: 'm20', src: '/SF.png', alt: 'Project 20' },
  { id: 'm21', src: '/SF.png', alt: 'Project 21' },
  { id: 'm22', src: '/SF.png', alt: 'Project 22' },
  { id: 'm23', src: '/SF.png', alt: 'Project 23' },
  { id: 'm24', src: '/SF.png', alt: 'Project 24' },
];

export default function ImageColumns() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const spring = { stiffness: 80, damping: 28, restDelta: 0.001 };

  // Desktop: vertical parallax per column
  const raw1 = useTransform(scrollYProgress, [0, 1], [0,  -200]);
  const raw2 = useTransform(scrollYProgress, [0, 1], [0,   160]);
  const raw3 = useTransform(scrollYProgress, [0, 1], [0,  -240]);
  const raw4 = useTransform(scrollYProgress, [0, 1], [0,   140]);
  const raw5 = useTransform(scrollYProgress, [0, 1], [0,  -180]);

  const y1 = useSpring(raw1, spring);
  const y2 = useSpring(raw2, spring);
  const y3 = useSpring(raw3, spring);
  const y4 = useSpring(raw4, spring);
  const y5 = useSpring(raw5, spring);

  const yValues = [y1, y2, y3, y4, y5];

  // Mobile: horizontal parallax per row
  // Rows 1 & 3 slide left (aligned), row 2 slides right
  const rawX1 = useTransform(scrollYProgress, [0, 1], [0,  -280]);
  const rawX2 = useTransform(scrollYProgress, [0, 1], [-260,  0]);
  const rawX3 = useTransform(scrollYProgress, [0, 1], [0,  -280]);
  const rawX4 = useTransform(scrollYProgress, [0, 1], [-260,  0]);

  const xRow1 = useSpring(rawX1, spring);
  const xRow2 = useSpring(rawX2, spring);
  const xRow3 = useSpring(rawX3, spring);
  const xRow4 = useSpring(rawX4, spring);

  return (
    <section ref={containerRef} className={styles.container}>

      {/* ── Desktop: 5-column vertical parallax ── */}
      <div className={styles.gridWrapper}>
        {COLUMNS.map((col, colIndex) => (
          <motion.div
            key={colIndex}
            className={styles.column}
            style={{ y: yValues[colIndex], marginTop: col.offset }}
          >
            {col.images.map((img) => (
              <motion.div
                key={img.id}
                className={styles.imageCard}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
                  zIndex: 20,
                  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                }}
              >
                <Image src={img.src} alt={img.alt} width={600} height={400} className={styles.image} />
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* ── Mobile: 4-row horizontal sliding ── */}
      <div className={styles.mobileRows}>
        {[
          { row: mobileRow1, x: xRow1 },
          { row: mobileRow2, x: xRow2 },
          { row: mobileRow3, x: xRow3 },
          { row: mobileRow4, x: xRow4 },
        ].map(({ row, x }, i) => (
          <motion.div key={i} className={styles.mobileRow} style={{ x }}>
            {row.map((img) => (
              <div key={img.id} className={styles.mobileCard}>
                <Image src={img.src} alt={img.alt} width={400} height={300} className={styles.image} />
              </div>
            ))}
          </motion.div>
        ))}
      </div>

    </section>
  );
}
