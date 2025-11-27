
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '../styles_css/ImageColumns.module.css';
import { motion } from "framer-motion";



// --- We now need 5 columns of images ---
const col1Images = [
  { id: 1, src: '/SF.png', alt: 'Placeholder 1' },
  { id: 2, src: '/SF.png', alt: 'Placeholder 2' },
  { id: 3, src: '/SF.png', alt: 'Placeholder 3' }, // Fixed
  { id: 4, src: '/SF.png', alt: 'Placeholder 4' }, // Fixed
  
];

const col2Images = [
  { id: 5, src: '/SF.png', alt: 'Placeholder 5' }, // Fixed
  { id: 6, src: '/SF.png', alt: 'Placeholder 6' }, // Fixed
  { id: 7, src: '/SF.png', alt: 'Placeholder 7' }, // Fixed
  { id: 8, src: '/SF.png', alt: 'Placeholder 8' }, // Fixed


];

const col3Images = [
  { id: 9, src: '/SF.png', alt: 'Placeholder 9' },  // Fixed
  { id: 10, src: '/SF.png', alt: 'Placeholder 10' }, // Fixed
  { id: 11, src: '/SF.png', alt: 'Placeholder 11' }, // Fixed
  { id: 12, src: '/SF.png', alt: 'Placeholder 12' }, // Fixed
];

const col4Images = [
  { id: 13, src: '/SF.png', alt: 'Placeholder 13' }, // Fixed
  { id: 14, src: '/SF.png', alt: 'Placeholder 14' }, // Fixed
  { id: 15, src: '/SF.png', alt: 'Placeholder 15' }, // Fixed
  { id: 16, src: '/SF.png', alt: 'Placeholder 16' }, // Fixed

];

const col5Images = [
  { id: 17, src: '/SF.png', alt: 'Placeholder 17' }, // Fixed
  { id: 18, src: '/SF.png', alt: 'Placeholder 18' }, // Fixed
  { id: 19, src: '/SF.png', alt: 'Placeholder 19' }, // Fixed
  { id: 20, src: '/SF.png', alt: 'Placeholder 20' }, // Fixed
];
// -------------------------------------

export default function ImageColumns() {
  const [offsetY, setOffsetY] = useState(0);
  const handleScroll = () => setOffsetY(window.pageYOffset);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className={styles.container}>
      <div className={styles.gridWrapper}>
        
        {/* === GROUP 1 === (Moves up slow) */}
        <div 
          className={styles.column}
          style={{ transform: `translateY(-${offsetY * 0.1}px)` }}
        >
          {col1Images.map((img) => (
            <div key={img.id} className={styles.imageCard}>
              <Image src={img.src} alt={img.alt} width={600} height={400} className={styles.image} />
            </div>
          ))}
        </div>

        {/* === GROUP 2 === (Moves up faster) */}
        <div 
          className={styles.column}
          style={{ transform: `translateY(${offsetY * -0.19}px)` }} // This is moving up, just slower than group 1
        >
          {col2Images.map((img) => (
            <div key={img.id} className={styles.imageCard}>
              <Image src={img.src} alt={img.alt} width={600} height={400} className={styles.image} />
            </div>
          ))}
        </div>

        {/* === GROUP 1 === (Moves up slow) */}
        <div 
          className={styles.column}
          style={{ transform: `translateY(-${offsetY * 0.1}px)` }} 
        >
          {col3Images.map((img) => (
            <div key={img.id} className={styles.imageCard}>
              <Image src={img.src} alt={img.alt} width={600} height={400} className={styles.image} />
            </div>
          ))}
        </div>

        {/* === GROUP 2 === (Moves up faster) */}
        <div 
          className={styles.column}
          style={{ transform: `translateY(${offsetY * -0.19}px)` }}
        >
          {col4Images.map((img) => (
            <div key={img.id} className={styles.imageCard}>
              <Image src={img.src} alt={img.alt} width={600} height={400} className={styles.image} />
            </div>
          ))}
        </div>

        {/* === GROUP 1 === (Moves up slow) */}
        <div 
          className={styles.column}
          style={{ transform: `translateY(-${offsetY * 0.1}px)` }}
        >
          {col5Images.map((img) => (
            <div key={img.id} className={styles.imageCard}>
              <Image src={img.src} alt={img.alt} width={600} height={400} className={styles.image} />
            </div>
          ))}
        </div>

      </div>
      {/* This empty div is just to create scrollable space */}
      <div style={{ height: '0vh' }}></div>
    </section>
  );
}