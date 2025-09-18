'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import NavBar from './components/navBar';
import styles from './styles_css/home.module.css';
import Image from 'next/image';

export default function HomePage() {
  // Parallax for the small icon group in hero
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, v => v * 0.3);

  // Scroll-driven color change for ONLY the word "yours"
  const subRef = useRef(null);
  const { scrollYProgress: yoursProgress } = useScroll({
    target: subRef,
    offset: ['start 52%', 'start 42%'],
  });
  const whiteAlpha = useTransform(yoursProgress, [0, 1], [1, 0]);

  // ===== SECTION ONE scroll setup (for sliding images) =====
  const sectionOneRef = useRef(null);
  const { scrollYProgress: sec1 } = useScroll({
    target: sectionOneRef,
    offset: ['start 80%', 'end 10%'],
  });

  const xL1 = useTransform(sec1, [0,1], ['12vw','0vw']);
  const xL2 = useTransform(sec1, [0,1], ['6vw','0vw']);
  const xR1 = useTransform(sec1, [0,1], ['-6vw','0vw']);
  const xR2 = useTransform(sec1, [0,1], ['-12vw','0vw']); // match the left side


  return (
    <>
      <NavBar />

      <section className={styles.hero}>
        <motion.h1
          className={styles.heroHeading}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          Make them jealous.
        </motion.h1>

        <div className={styles.heroImages}>
          <Image
            className={styles.mainImage}
            src="/show the world.png"
            alt="Main phone"
            width={460}
            height={920}
            unoptimized
            priority
          />

          <motion.div className={styles.heroSmallImage} style={{ y }}>
            <img className={styles.heroImageOne}   src="/image3.png"  alt="" />
            <img className={styles.heroImageTwo}   src="/image8.png"  alt="" />
            <img className={styles.heroImageThree} src="/image9.png"  alt="" />
            <img className={styles.heroImageFour}  src="/image10.png" alt="" />
            <img className={styles.heroImageFive}  src="/image1.png"  alt="" />
            <img className={styles.heroImageSix}   src="/image7.png"  alt="" />
          </motion.div>
        </div>

        {/* Heading where only "yours" morphs to gradient */}
        <motion.h2
          ref={subRef}
          className={styles.heroSubHeading}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6, margin: '-25% 0px -25% 0px' }}
          transition={{ duration: 4, ease: 'easeOut' }}
        >
          With a website <br /> that is{' '}
          <motion.span
            className={styles.yoursBlend}
            style={{ '--whiteAlpha': whiteAlpha }}
          >
            uniquely yours.
          </motion.span>
        </motion.h2>
      </section>

      {/* ===== SECTION ONE ===== */}
      <section ref={sectionOneRef} className={styles.sectionOne}>
        <motion.h1
          className={styles.sectionOneHeading}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6, margin: '-25% 0px -25% 0px' }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          But Your website <br /> doesn’t have to be.
        </motion.h1>

        <div className={styles.images}>
        {/* Left two */}
        <motion.div style={{ x: xL1, zIndex: 2, position: 'relative', transform: 'translateZ(0)' }}>
          <Image className={styles.imageOne} alt="" width={0} height={0} src="/iphone.png" unoptimized priority />
        </motion.div>

        <motion.div style={{ x: xL2, zIndex: 2, position: 'relative', transform: 'translateZ(0)' }}>
          <Image className={styles.imageTwo} alt="" width={0} height={0} src="/iphone.png" unoptimized priority />
        </motion.div>

        {/* Center on top */}
        <div style={{ zIndex: 10, position: 'relative', transform: 'translateZ(0)' }}>
          <Image className={styles.imageThree} alt="" width={0} height={0} src="/iphone.png" unoptimized priority />
        </div>

        {/* Right two (4 above 5) */}
        <motion.div style={{ x: xR1, zIndex: 3, position: 'relative', transform: 'translateZ(0)' }}>
          <Image className={styles.imageFour} alt="" width={0} height={0} src="/iphone.png" unoptimized priority />
        </motion.div>

        <motion.div style={{ x: xR2, zIndex: 1, position: 'relative', transform: 'translateZ(0)' }}>
          <Image className={styles.imageFive} alt="" width={0} height={0} src="/iphone.png" unoptimized priority />
        </motion.div>
      </div>

      </section>

      {/* ===== SECTION TWO ===== */}
      <section className={styles.sectionTwo}>
        <motion.h1
          className={styles.sectionTwoHeading}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6, margin: '-25% 0px -25% 0px' }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          If You’re changing the world, <br /> the world should know.
        </motion.h1>

        <Image className={styles.sectionTwoImage} alt="" width={0} height={0} src="/show the world.png" unoptimized priority />
      </section>

      {/* ===== SECTION THREE ===== */}
      <section className={styles.sectionThree}>
        <motion.h1
          className={styles.sectionThreeHeading}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6, margin: '-25% 0px -25% 0px' }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          Does your website reflect <br /> your vision for the future?
        </motion.h1>

        <Image className={styles.sectionThreeImage} alt="" width={0} height={0} src="/tablet.png" unoptimized priority />
      </section>

      {/* ===== SECTION FOUR ===== */}
      <section className={styles.sectionFour}>
        <h1 className={styles.sectionFourHeading}>
          Developing websites with <br /> world-class technology.
        </h1>

        <div className={styles.sectionFourImages}>
          <Image className={styles.figma}  alt="" width={0} height={0} src="/Figmaa.png"   unoptimized priority />
          <Image className={styles.wix}    alt="" width={0} height={0} src="/wix.png"      unoptimized priority />
          <Image className={styles.framer} alt="" width={0} height={0} src="/Framer.png"   unoptimized priority />
          <Image className={styles.webflow}alt="" width={0} height={0} src="/webfloww.png" unoptimized priority />
          <Image className={styles.react}  alt="" width={0} height={0} src="/react.png"    unoptimized priority />
        </div>
      </section>

      {/* ===== SECTION FIVE ===== */}
      <section className={styles.sectionFive}>
        <h1 className={styles.sectionFiveHeading}>
          Connect with your customers <br /> across all devices.
        </h1>
        <Image className={styles.sectionFiveImage} alt="" width={0} height={0} src="/bg.png" unoptimized priority />
      </section>

      {/* ===== SECTION SIX ===== */}
      <section className={styles.sectionSix}>
        <h1 className={styles.sectionSixHeading}>
          Design that tells your story, <br /> before you say a word.
        </h1>
        <Image className={styles.sectionSixImage} alt="" width={0} height={0} src="/.png" unoptimized priority />
      </section>
    </>
  );
}
