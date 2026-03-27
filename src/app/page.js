'use client';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { useRef, useState, useEffect }from 'react';
import NavBar from './components/navBar';
import styles from './styles_css/home.module.css';
import Image from 'next/image';
import ImageColumns from './components/ImageColumns';


export default function HomePage() {
  // --- MOUSE PARALLAX SETUP ---
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize(); // Set initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(event) {
    mouseX.set(event.clientX);
    mouseY.set(event.clientY);
  }

  // Individual image transforms for mouse movement
  const p1x = useTransform(mouseX, [0, windowSize.width], [-15, 15]);
  const p1y = useTransform(mouseY, [0, windowSize.height], [-15, 15]);
  const p2x = useTransform(mouseX, [0, windowSize.width], [23, -30]);
  const p2y = useTransform(mouseY, [0, windowSize.height], [25, -25]);
  const p3x = useTransform(mouseX, [0, windowSize.width], [-15, 15]);
  const p3y = useTransform(mouseY, [0, windowSize.height], [12, -12]);
  const p4x = useTransform(mouseX, [0, windowSize.width], [8, -8]);
  const p4y = useTransform(mouseY, [0, windowSize.height], [-20, 20]);
  const p5x = useTransform(mouseX, [0, windowSize.width], [-22, 22]);
  const p5y = useTransform(mouseY, [0, windowSize.height], [-5, 5]);
  const p6x = useTransform(mouseX, [0, windowSize.width], [18, -18]);
  const p6y = useTransform(mouseY, [0, windowSize.height], [10, -10]);

  // --- SCROLL PARALLAX SETUP ---
  // Parallax for the small icon group in hero
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (v) => v * 0.1);

  // Scroll-driven color change for ONLY the word "yours"
  const subRef = useRef(null);
  const { scrollYProgress: yoursProgress } = useScroll({
    target: subRef,
    offset: ['start 52%', 'start 42%'],
  });
  const whiteAlpha = useTransform(yoursProgress, [0, 1], [1, 0]);

  // --- SECTION ONE scroll setup (for sliding images) ---
  const sectionOneRef = useRef(null);
  const { scrollYProgress: sec1 } = useScroll({
    target: sectionOneRef,
    offset: ['start 80%', 'end 10%'],
  });

  const xL1 = useTransform(sec1, [0, 1], ['12vw', '0vw']);
  const xL2 = useTransform(sec1, [0, 1], ['6vw', '0vw']);
  const xR1 = useTransform(sec1, [0, 1], ['-6vw', '0vw']);
  const xR2 = useTransform(sec1, [0, 1], ['-12vw', '0vw']);

  return (
    <>
      <NavBar />

      {/* Attach the mouse move handler to the hero section */}
      <section className={styles.hero} onMouseMove={handleMouseMove}>
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
            src="/emailmock.png"
            alt="Main phone"
            width={460}
            height={920}
            unoptimized
            priority
          />
          <Image
            className={styles.mainImageMobile}
            src="/mobilemock.png"
            alt="Main phone"
            width={460}
            height={920}
            unoptimized
            priority
          />

          {/* This wrapper has the SCROLL parallax */}
          <motion.div className={styles.heroSmallImage} style={{ y }}>
            
            {/* These images have the MOUSE parallax */}
            <motion.img
              className={styles.heroImageOne}
              src="/image3.png"
              alt=""
              style={{ x: p1x, y: p1y }}
            />
            <motion.img
              className={styles.heroImageTwo}
              src="/image8.png"
              alt=""
              style={{ x: p2x, y: p2y }}
            />
            <motion.img
              className={styles.heroImageThree}
              src="/image9.png"
              alt=""
              style={{ x: p3x, y: p3y }}
            />
            <motion.img
              className={styles.heroImageFour}
              src="/image10.png"
              alt=""
              style={{ x: p4x, y: p4y }}
            />
            <motion.img
              className={styles.heroImageFive}
              src="/image1.png"
              alt=""
              style={{ x: p5x, y: p5y }}
            />
            <motion.img
              className={styles.heroImageSix}
              src="/image7.png"
              alt=""
              style={{ x: p6x, y: p6y }}
            />
          </motion.div>
        </div>

        {/* Heading where only "yours" morphs to gradient */}
        <motion.h2
          ref={subRef}
          className={styles.heroSubHeading}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3, margin: '0% 0px -10% 0px' }}
          transition={{ duration: 4, ease: 'easeOut' }}
        >
          With a website <br /> that is{' '}
          <motion.span
            className={styles.yoursBlend}
            style={{ '--whiteAlpha': whiteAlpha }}
          >
            uniquially yours.
          </motion.span>
        </motion.h2>
      </section>

      {/* ===== SECTION ONE ===== */}
      <section ref={sectionOneRef} className={styles.sectionOne}>
        <motion.h1
            className={styles.sectionOneHeading}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3, margin: '0% 0px -10% 0px' }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <span className={styles.blackText}>But your website</span>
          <br />
          <span className={styles.gradientOneText}>doesn’t have to be.</span>
        </motion.h1>


        <div className={styles.images}>
        {/* Left two */}
        <motion.div style={{ x: xL1, zIndex: 2, position: 'relative', transform: 'translateZ(0)' }}>
          <Image className={styles.imageOne} alt="" width={0} height={0} src="/iphone-1.png" unoptimized priority />
        </motion.div>

        <motion.div style={{ x: xL2, zIndex: 2, position: 'relative', transform: 'translateZ(0)' }}>
          <Image className={styles.imageTwo} alt="" width={0} height={0} src="/iphone-2.png" unoptimized priority />
        </motion.div>

        {/* Center on top */}
        <div style={{ zIndex: 10, position: 'relative', transform: 'translateZ(0)' }}>
          <Image className={styles.imageThree} alt="" width={0} height={0} src="/iphone-3.png" unoptimized priority />
        </div>

        {/* Right two (4 above 5) */}
        <motion.div style={{ x: xR1, zIndex: 3, position: 'relative', transform: 'translateZ(0)' }}>
          <Image className={styles.imageFour} alt="" width={0} height={0} src="/iphone-4.png" unoptimized priority />
        </motion.div>

        <motion.div style={{ x: xR2, zIndex: 1, position: 'relative', transform: 'translateZ(0)' }}>
          <Image className={styles.imageFive} alt="" width={0} height={0} src="/iphone-5A.png" unoptimized priority />
        </motion.div>
      </div>

      </section>

      {/* ===== Portfolio Section ===== */}
      <section className={styles.portfolioSection}>
          <motion.h1
                className={styles.portfolioSectionHeading}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3, margin: '0% 0px -10% 0px' }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
            >
              <span className={styles.whiteText}>Your digital presence,</span>
              <br />
              <span className={styles.colorText}>Unapologetically bold.</span>
          </motion.h1>

          <ImageColumns />
      </section>

      {/* ===== SECTION TWO ===== */}
      <section className={styles.sectionTwo}>
        <motion.h1
            className={styles.sectionTwoHeading}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3, margin: '0% 0px -10% 0px' }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
          <span className={styles.blackText}>If you’re changing the world,</span>
            <br />
          <span className={styles.gradientTwoText}>the world should know.</span>
        </motion.h1>


        <Image className={styles.sectionTwoImage} alt="" width={0} height={0} src="/show the world.png" unoptimized priority />
      </section>

      {/* ===== SECTION THREE ===== 
      <section className={styles.sectionThree}>
        <motion.h1
            className={styles.sectionThreeHeading}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3, margin: '0% 0px -10% 0px' }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <span className={styles.blackText}>Does your website reflect</span>
          <br />
          <span className={styles.gradientText}>your vision for the future?</span>
        </motion.h1>


        <Image className={styles.sectionThreeImage} alt="" width={0} height={0} src="/tablet.png" unoptimized priority />
      </section>
      */}

      {/* ===== SECTION FOUR ===== */}
      <section className={styles.sectionFour}>
        <motion.h1
            className={styles.sectionFourHeading}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3, margin: '0% 0px -10% 0px' }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            <span className={styles.whiteText}>Developing websites with</span>
            <br />
            <span className={styles.gradientFourText}>world-class technology.</span>
        </motion.h1>


        <div className={styles.sectionFourImages}>
          <h1 className={styles.sectionFourText1}>TECH STACK.</h1>
          <h1 className={styles.sectionFourText}>Everything you need <br/> + a little more.</h1>

          <div className={styles.firstRow}>
              <Image className={styles.figma}  alt="" width={0} height={0} src="/Figmaa.png"   unoptimized priority />
              <Image className={styles.wix}    alt="" width={0} height={0} src="/wix.png"      unoptimized priority />
              <Image className={styles.framer} alt="" width={0} height={0} src="/Framer.png"   unoptimized priority />
          </div>
          <div className={styles.secondRow}>
              <Image className={styles.webflow}alt="" width={0} height={0} src="/webfloww.png" unoptimized priority />
              <Image className={styles.react}  alt="" width={0} height={0} src="/react.png"    unoptimized priority />
              <Image className={styles.framer} alt="" width={0} height={0} src="/Framer.png"   unoptimized priority />
          </div>

          <h1 className={styles.secondHeading}> Design | Develop | Deploy</h1>
            <h1 className={styles.sectionFourPara}>We design compelling 
              visual narratives and intuitive user experiences, develop robust and
              high-performing applications with world-class technology, and strategically 
              deploy your final solution to the global market.</h1>
            <button type="button" className={styles.mainButton}> Contact us</button>



          <Image
            className={styles.sectionFourImage}
            src="/tablet.png"
            alt="Main phone"
            width={460}
            height={920}
            unoptimized
            priority
          />
        </div>
      </section>

      {/* ===== SECTION FIVE ===== */}
      <section className={styles.sectionFive}>
        <motion.h1
          className={styles.sectionFiveHeading}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3, margin: '0% 0px -10% 0px' }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <span className={styles.blackText}>Connect with your customers</span>
          <br />
          <span className={styles.gradientText}>across all devices.</span>
        </motion.h1>
        <div className={styles.sectionFiveImages}>
          <Image
            className={styles.sectionFiveImage1}
            src="/tablet.png"
            alt="Main phone"
            width={460}
            height={920}
            unoptimized
            priority
          />
          <Image
            className={styles.sectionFiveImage2}
            src="/iphone-1.png"
            alt="Main phone"
            width={460}
            height={920}
            unoptimized
            priority
          />
          <Image
            className={styles.sectionFiveImage3}
            src="/web.png"
            alt="Main phone"
            width={460}
            height={920}
            unoptimized
            priority
          />
        </div>
      </section>

      {/* ===== SECTION SIX ===== */}
      <section className={styles.sectionSix}>
        <motion.h1
          className={styles.sectionSixHeading}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3, margin: '0% 0px -10% 0px' }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
        <span className={styles.whiteText}>Design that tells your story,</span>
        <br />
        <span className={styles.gradientText}>before you say a word.</span>
        </motion.h1>
        <div className={styles.sectionSixImageCard}>
            <Image className={styles.sectionSixImage} alt="" width={0} height={0} src="/iphone-3.png" unoptimized priority />
            <div className={styles.sectionSixTextbox}>
              <span className={styles.sectionSixText1}>Bespoke</span>
              <span className={styles.sectionSixText}>Let the design <br/> speak for itself.</span>
              <span className={styles.sectionSixPara}>Bespoke design, purpose-built to deliver compelling visual narratives and seamless user experiences.</span>
              <button type="button" className={styles.button}> Contact us</button>


            </div>

        </div>
      </section>
    </>
  );
}
