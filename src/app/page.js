'use client';
import { motion, useScroll, useTransform, useMotionValue, useInView } from 'framer-motion';
import { Fragment, useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import NavBar from './components/navBar';
import styles from './styles_css/home.module.css';
import Image from 'next/image';
const MotionImage = motion(Image);
import DustText from './components/DustText';
import ImageColumns from './components/ImageColumns';
import ParticleField from './components/ParticleField';
import PullCord from './components/PullCord';
import Reviews from './components/Reviews';

// WebGL scroll journey — client-only so the three.js chunk stays out of the
// initial bundle and never attempts to server-render.
const BuildJourney = dynamic(() => import('./components/BuildJourney'), { ssr: false });

function LockIcon() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    const id = setTimeout(() => setUnlocked(true), 600);
    return () => clearTimeout(id);
  }, [isInView]);

  return (
    <motion.span
      ref={ref}
      className={styles.lockIcon}
      animate={{ rotate: unlocked ? -10 : 0, scale: unlocked ? 1.08 : 1, opacity: unlocked ? 1 : 0.85 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {unlocked ? '🔓' : '🔒'}
    </motion.span>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.9, ease: 'easeOut' },
};

// Section-two heading, split per letter so single letters can roll like a
// ticker: the letter slides up out of its clipped box while an identical
// clone rises in from below.
const ROLL_LINES = [['Show', 'them'], ["what's", 'possible.']];

function LetterRoll({ ch, rolling, delay }) {
  return (
    <span className={styles.flipLetter}>
      <span
        className={`${styles.flipRoll} ${rolling ? styles.rolling : ''}`}
        style={delay == null ? undefined : { animationDelay: `${delay}s` }}
      >
        {ch}
        <span className={styles.flipClone} aria-hidden="true">{ch}</span>
      </span>
    </span>
  );
}

const cardVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

// Placeholder set for the mobile phone carousel — repeats a few of the real
// screens so the carousel scrolls for longer. Swap these for dedicated
// screens later.
const mobilePhoneImages = [
  '/iphone-1.png',
  '/iphone-2.png',
  '/iphone-3.png',
  '/iphone-4.png',
  '/iphone-5A.png',
  '/iphone-1.png',
  '/iphone-2.png',
  '/iphone-3.png',
];

function useMobileDotOpacity(centeredIndexMV, index) {
  return useTransform(centeredIndexMV, (idx) => 1 - Math.min(Math.abs(idx - index), 1) * 0.65);
}

export default function HomePage() {
  // --- MOUSE PARALLAX SETUP ---
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Section two: burst API of the particle sea + the heading it bounces off.
  const particleFieldRef = useRef(null);
  const statementRef = useRef(null);

  // Letter-roll cycle: every few seconds pick one random letter per word and
  // roll them all at the same moment. rollMap: { wordIndex: letterIndex }.
  // Starts only once the heading has been in view for a second, so the first
  // roll never collides with the heading's own entrance animation.
  const [rollMap, setRollMap] = useState(null);
  const statementInView = useInView(statementRef, { once: true, amount: 0.3 });
  useEffect(() => {
    if (!statementInView) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const words = ROLL_LINES.flat();
    let clearT;
    let id;
    const flip = () => {
      const next = {};
      words.forEach((word, wi) => {
        const idxs = [];
        for (let i = 0; i < word.length; i++) {
          if (/[a-zA-Z]/.test(word[i])) idxs.push(i);
        }
        next[wi] = idxs[(Math.random() * idxs.length) | 0];
      });
      setRollMap(next);
      clearT = setTimeout(() => setRollMap(null), 700);
    };
    const startT = setTimeout(() => {
      flip();
      id = setInterval(flip, 2800);
    }, 1000);
    return () => {
      clearTimeout(startT);
      clearTimeout(clearT);
      clearInterval(id);
    };
  }, [statementInView]);

  const renderRollLine = (lineIdx, interactive) => {
    // Cumulative letter index across the whole heading: the overlay letters
    // use it to phase-shift the gradient so the flow sweeps left to right.
    const flat = ROLL_LINES.flat();
    const firstWord = lineIdx === 0 ? 0 : ROLL_LINES[0].length;
    let letterBase = 0;
    for (let i = 0; i < firstWord; i++) letterBase += flat[i].length;
    return ROLL_LINES[lineIdx].map((word, wIdx) => {
      const globalW = firstWord + wIdx;
      const wordBase = letterBase;
      letterBase += word.length;
      return (
        <Fragment key={wIdx}>
          {wIdx > 0 && ' '}
          <span className={styles.word}>
            {[...word].map((ch, ci) => (
              <LetterRoll
                key={ci}
                ch={ch}
                rolling={interactive && rollMap?.[globalW] === ci}
                delay={interactive ? null : (wordBase + ci) * -0.16}
              />
            ))}
          </span>
        </Fragment>
      );
    });
  };

  function handleMouseMove(event) {
    mouseX.set(event.clientX);
    mouseY.set(event.clientY);
  }

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

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (v) => v * 0.1);

  const subRef = useRef(null);
  const { scrollYProgress: yoursProgress } = useScroll({
    target: subRef,
    offset: ['start 85%', 'start 65%'],
  });
  const whiteAlpha = useTransform(yoursProgress, [0, 1], [1, 0]);

  const sectionOneRef = useRef(null);
  const mobileStickyRef = useRef(null);
  const [mobileStickyHeight, setMobileStickyHeight] = useState(0);
  const { scrollYProgress: sec1 } = useScroll({
    target: sectionOneRef,
    offset: ['start 80%', 'end 10%'],
  });
  const { scrollYProgress: phoneCarouselProgress } = useScroll({
    target: sectionOneRef,
    offset: ['start start', 'end end'],
  });

  const xL1 = useTransform(sec1, [0, 1], ['12vw', '0vw']);
  const xL2 = useTransform(sec1, [0, 1], ['6vw', '0vw']);
  const xR1 = useTransform(sec1, [0, 1], ['-6vw', '0vw']);
  const xR2 = useTransform(sec1, [0, 1], ['-12vw', '0vw']);
  const phoneCarouselActive = windowSize.width > 0 && windowSize.width <= 768;
  const mobilePhoneWidth = Math.min(Math.max(windowSize.width * 0.52, 220), 430);
  const mobilePhoneGap = Math.min(Math.max(windowSize.width * 0.012, 4), 10);
  const mobilePhoneStep = mobilePhoneWidth + mobilePhoneGap;
  // Carousel starts with slide index 2 centered and ends on the last slide,
  // so it travels (mobilePhoneImages.length - 1 - 2) steps in total.
  const mobileCarouselScroll = mobilePhoneStep * (mobilePhoneImages.length - 3);
  const mobileSectionHeight = (mobileStickyHeight || windowSize.height) + mobileCarouselScroll;
  const mobilePhoneTrackX = useTransform(
    phoneCarouselProgress,
    [0, 0.08, 0.26, 0.44, 0.62, 0.8, 0.98, 1],
    phoneCarouselActive
      ? [-2, -2, -3, -4, -5, -6, -7, -7].map((n) => mobilePhoneStep * n)
      : [0, 0, 0, 0, 0, 0, 0, 0]
  );
  const mobileCenteredIndex = useTransform(mobilePhoneTrackX, (x) => -x / mobilePhoneStep);
  const mobileDot1 = useMobileDotOpacity(mobileCenteredIndex, 0);
  const mobileDot2 = useMobileDotOpacity(mobileCenteredIndex, 1);
  const mobileDot3 = useMobileDotOpacity(mobileCenteredIndex, 2);
  const mobileDot4 = useMobileDotOpacity(mobileCenteredIndex, 3);
  const mobileDot5 = useMobileDotOpacity(mobileCenteredIndex, 4);
  const mobileDot6 = useMobileDotOpacity(mobileCenteredIndex, 5);
  const mobileDot7 = useMobileDotOpacity(mobileCenteredIndex, 6);
  const mobileDot8 = useMobileDotOpacity(mobileCenteredIndex, 7);

  useEffect(() => {
    if (!phoneCarouselActive || !mobileStickyRef.current) return;

    const el = mobileStickyRef.current;
    const updateHeight = () => {
      setMobileStickyHeight(el.getBoundingClientRect().height);
    };

    updateHeight();
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateHeight) : null;
    resizeObserver?.observe(el);
    window.addEventListener('resize', updateHeight);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [phoneCarouselActive, windowSize.width, windowSize.height]);

  return (
    <>
      <NavBar />

      {/* ===== HERO ===== */}
      <section className={styles.hero} onMouseMove={handleMouseMove}>
        <motion.h1
          className={styles.heroHeading}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          Make them jealous.
        </motion.h1>

        <motion.div
          className={styles.heroImages}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
        >
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

          <motion.div className={styles.heroSmallImage} style={{ y }}>
            <motion.img className={styles.heroImageOne} src="/image3.png" alt="" style={{ x: p1x, y: p1y }} />
            <motion.img className={styles.heroImageTwo} src="/image8.png" alt="" style={{ x: p2x, y: p2y }} />
            <motion.img className={styles.heroImageThree} src="/image9.png" alt="" style={{ x: p3x, y: p3y }} />
            <motion.img className={styles.heroImageFour} src="/image10.png" alt="" style={{ x: p4x, y: p4y }} />
            <motion.img className={styles.heroImageFive} src="/image1.png" alt="" style={{ x: p5x, y: p5y }} />
            <motion.img className={styles.heroImageSix} src="/image7.png" alt="" style={{ x: p6x, y: p6y }} />
          </motion.div>
        </motion.div>

        <motion.h2
          ref={subRef}
          className={styles.heroSubHeading}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3, margin: '0% 0px -10% 0px' }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
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
      <section
        ref={sectionOneRef}
        className={styles.sectionOne}
        style={phoneCarouselActive ? {
          '--mobile-phone-width': `${mobilePhoneWidth}px`,
          '--mobile-phone-gap': `${mobilePhoneGap}px`,
          '--mobile-carousel-scroll': `${mobileCarouselScroll}px`,
          '--mobile-section-height': `${mobileSectionHeight}px`,
        } : undefined}
      >
        <div className={styles.sectionOneDesktop}>
          <motion.h1
            className={styles.sectionOneHeading}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3, margin: '0% 0px -10% 0px' }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            <span className={styles.blackText}>We build what</span>
            <br />
            <span className={styles.gradientOneText}>others only imagine.</span>
          </motion.h1>

          <div className={styles.images}>
            <motion.div style={{ x: xL1, zIndex: 2, position: 'relative', transform: 'translateZ(0)' }}>
              <Image className={styles.imageOne} alt="" width={0} height={0} src="/iphone-1.png" unoptimized priority />
            </motion.div>

            <motion.div style={{ x: xL2, zIndex: 2, position: 'relative', transform: 'translateZ(0)' }}>
              <Image className={styles.imageTwo} alt="" width={0} height={0} src="/iphone-2.png" unoptimized priority />
            </motion.div>

            <div style={{ zIndex: 10, position: 'relative', transform: 'translateZ(0)' }}>
              <Image className={styles.imageThree} alt="" width={0} height={0} src="/iphone-3.png" unoptimized priority />
            </div>

            <motion.div style={{ x: xR1, zIndex: 3, position: 'relative', transform: 'translateZ(0)' }}>
              <Image className={styles.imageFour} alt="" width={0} height={0} src="/iphone-4.png" unoptimized priority />
            </motion.div>

            <motion.div style={{ x: xR2, zIndex: 1, position: 'relative', transform: 'translateZ(0)' }}>
              <Image className={styles.imageFive} alt="" width={0} height={0} src="/iphone-5A.png" unoptimized priority />
            </motion.div>
          </div>
        </div>

        <div className={styles.sectionOneMobile}>
          <div ref={mobileStickyRef} className={styles.sectionOneMobileSticky}>
            <motion.h1
              className={styles.sectionOneHeading}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3, margin: '0% 0px -10% 0px' }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            >
              <span className={styles.blackText}>We build what</span>
              <br />
              <span className={styles.gradientOneText}>others only imagine.</span>
            </motion.h1>

            <div className={styles.mobilePhoneViewport}>
              <motion.div className={styles.mobilePhoneTrack} style={{ x: mobilePhoneTrackX }}>
                {mobilePhoneImages.map((src, index) => (
                  <div className={styles.mobilePhoneSlide} key={`${src}-${index}`}>
                    <Image className={styles.mobilePhoneImage} alt="" width={0} height={0} src={src} unoptimized priority />
                  </div>
                ))}
              </motion.div>
            </div>

            <div className={styles.mobilePhoneDots} aria-hidden="true">
              <motion.span className={styles.mobilePhoneDot} style={{ opacity: mobileDot1 }} />
              <motion.span className={styles.mobilePhoneDot} style={{ opacity: mobileDot2 }} />
              <motion.span className={styles.mobilePhoneDot} style={{ opacity: mobileDot3 }} />
              <motion.span className={styles.mobilePhoneDot} style={{ opacity: mobileDot4 }} />
              <motion.span className={styles.mobilePhoneDot} style={{ opacity: mobileDot5 }} />
              <motion.span className={styles.mobilePhoneDot} style={{ opacity: mobileDot6 }} />
              <motion.span className={styles.mobilePhoneDot} style={{ opacity: mobileDot7 }} />
              <motion.span className={styles.mobilePhoneDot} style={{ opacity: mobileDot8 }} />
            </div>
          </div>
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
          <span className={styles.whiteText}>Your presence,</span>
          <br />
          <span className={styles.colorText}>Unapologetically bold.</span>
        </motion.h1>

        <ImageColumns />
      </section>

      {/* ===== SECTION TWO ===== */}
      <section className={styles.sectionTwo}>
        <ParticleField ref={particleFieldRef} obstacleRef={statementRef} />
        <PullCord onPull={() => particleFieldRef.current?.burst()} />
        <motion.p
          className={styles.sectionTwoKicker}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3, margin: '0% 0px -10% 0px' }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          We believe in endless possibilities
        </motion.p>
        <motion.h1
          ref={statementRef}
          className={styles.sectionTwoHeading}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3, margin: '0% 0px -10% 0px' }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
            e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.setProperty('--mx', '-999px');
            e.currentTarget.style.setProperty('--my', '-999px');
          }}
        >
          <span className={styles.blackText} data-collide data-text="Show them">
            {renderRollLine(0, true)}
          </span>
          <br />
          <span className={styles.blackText} data-collide data-text="what's possible.">
            {renderRollLine(1, true)}
          </span>
          {/* Gradient copy, revealed only around the cursor; mirrors the
              letter-span structure so both copies lay out identically */}
          <span className={styles.headingPastel} aria-hidden="true">
            {renderRollLine(0, false)}
            <br />
            {renderRollLine(1, false)}
          </span>
        </motion.h1>
      </section>

      {/* ===== BUILD JOURNEY (scroll-driven 3D story) ===== */}
      {/* Hidden for now — revisit later. <BuildJourney /> */}

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
          <motion.h1 className={styles.sectionFourText1}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7, ease: 'easeOut' }}>
            TECH STACK.
          </motion.h1>

          <motion.h1 className={styles.sectionFourText}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}>
            Everything you need <br/> + a little more.
          </motion.h1>

          <motion.div className={styles.firstRow}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}>
            <Image className={styles.figma}  alt="" width={0} height={0} src="/Figmaa.png"   unoptimized priority />
            <Image className={styles.wix}    alt="" width={0} height={0} src="/claude.png"      unoptimized priority />
            <Image className={styles.framer} alt="" width={0} height={0} src="/lovable.png"   unoptimized priority />
          </motion.div>

          <motion.div className={styles.secondRow}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}>
            <Image className={styles.webflow} alt="" width={0} height={0} src="/openai.png" unoptimized priority />
            <Image className={styles.react}   alt="" width={0} height={0} src="/node.png"    unoptimized priority />
            <Image className={styles.framer}  alt="" width={0} height={0} src="/Framer.png"   unoptimized priority />
          </motion.div>

          <motion.h1 className={styles.secondHeading}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}>
            Design | Develop | Deploy
          </motion.h1>

          <motion.h1 className={styles.sectionFourPara}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7, delay: 0.45, ease: 'easeOut' }}>
            We design compelling visual narratives and intuitive user experiences, develop robust and
            high-performing applications with world-class technology, and strategically
            deploy your final solution to the global market.
          </motion.h1>

          <motion.button type="button" className={styles.mainButton}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7, delay: 0.55, ease: 'easeOut' }}>
            Contact us
          </motion.button>

          <motion.div
            style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}>
            <Image
              className={styles.sectionFourImage}
              src="/tablet.png"
              alt="Main phone"
              width={460}
              height={920}
              unoptimized
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* ===== AI SECTION ===== */}
      <section className={styles.aiSection}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <span className={styles.aiLogo}>✨</span>
        </motion.div>

        <motion.h1
          className={styles.aiHeading}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3, margin: '0% 0px -10% 0px' }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <span className={styles.whiteText}>We don&apos;t compete with AI.</span>
          <br />
          <DustText className={styles.aiGradient} text="We use it masterfully." />
        </motion.h1>

        <motion.h2
          className={styles.aiSubHeading}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
        >
          Unlocking the power of design psychology.
        </motion.h2>

        <LockIcon />


        <motion.div
          className={styles.aiCard}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
        >
          <motion.p
            className={styles.aiCardIntro}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            We employ research based mental models to design the best user experience for your customers.
          </motion.p>

          <div className={styles.aiPrinciples}>
            <motion.div
              className={styles.aiPrinciple}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
            >
              <h3 className={styles.aiPrincipleTitle}>Jakob&apos;s Law</h3>
              <p className={styles.aiPrincipleText}>
                Users prefer <strong>familiar interface patterns</strong> from other sites, so maintaining common design conventions (e.g., logo in the top left corner) makes your site intuitive and comfortable for them.
              </p>
            </motion.div>
            <motion.div
              className={styles.aiPrinciple}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
            >
              <h3 className={styles.aiPrincipleTitle}>Von Restorff Effect</h3>
              <p className={styles.aiPrincipleText}>
                Items that <strong>stand out from their peers</strong> are more likely to be remembered. For example, highlighting a call-to-action button in a bright color makes it more noticeable and memorable.
              </p>
            </motion.div>
            <motion.div
              className={styles.aiPrinciple}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
            >
              <h3 className={styles.aiPrincipleTitle}>Zeigarnik Effect</h3>
              <p className={styles.aiPrincipleText}>
                People remember <strong>incomplete tasks</strong> better than completed ones. For example, showing a progress bar that isn&apos;t fully completed encourages users to finish the task for a sense of closure.
              </p>
            </motion.div>
            <motion.div
              className={styles.aiPrincipleMedia}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
            >
              <Image
                className={styles.aiPrincipleImage}
                src="/grid/design-laws-mockup.webp"
                alt="Multi-step case review form demonstrating familiar layout, a standout call-to-action, and an in-progress bar"
                width={1400}
                height={814}
                unoptimized
              />
            </motion.div>
            <MotionImage
              className={styles.aiArrowVonRestorff}
              src="/pointer%20arrow.svg"
              alt=""
              aria-hidden="true"
              width={270}
              height={245}
              unoptimized
              initial={{ opacity: 0, y: 20, rotate: -23 }}
              whileInView={{ opacity: 1, y: 0, rotate: -23 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, delay: 0.5, ease: 'easeOut' }}
            />
            <MotionImage
              className={styles.aiArrowJakob}
              src="/pointer%20arrow.svg"
              alt=""
              aria-hidden="true"
              width={270}
              height={245}
              unoptimized
              initial={{ opacity: 0, y: 20, rotate: -13 }}
              whileInView={{ opacity: 1, y: 0, rotate: -13 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, delay: 0.55, ease: 'easeOut' }}
            />
            <MotionImage
              className={styles.aiArrowZeigarnik}
              src="/pointer%20arrow%202.svg"
              alt=""
              aria-hidden="true"
              width={357}
              height={251}
              unoptimized
              initial={{ opacity: 0, y: 20, rotate: 8 }}
              whileInView={{ opacity: 1, y: 0, rotate: 8 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, delay: 0.6, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      </section>

      {/* ===== REVIEWS SECTION ===== */}
      <section className={styles.reviewsSection}>
        <motion.h1
          className={styles.reviewsHeading}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3, margin: '0% 0px -10% 0px' }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <span className={styles.blackText}>Trusted by founders</span>
          <br />
          <span className={styles.reviewsGradient}>who demand the best.</span>
        </motion.h1>
        <motion.div style={{ width: '100%' }} {...fadeUp} transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}>
          <Reviews />
        </motion.div>
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
          <span className={styles.blackText}>Seamless everywhere.</span>
          <br />
          <span className={styles.gradientText}>Across all devices.</span>
        </motion.h1>

        <motion.div
          className={styles.sectionFiveSubtext}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
        >
          <p className={styles.sectionFivePara}>
            Your users aren&apos;t on one device—so neither are we. Every website we build adapts perfectly
            across phones, tablets, laptops, and large screens. No compromises. No missed breakpoints.
          </p>
          <button type="button" className={styles.mainButton}>Contact us</button>
        </motion.div>

        <motion.div
          className={styles.sectionFiveImages}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.4, delay: 0.6, ease: 'easeOut' }}
        >
          <Image className={styles.sfPhone1}  src="/iphone-1.png" alt="" width={460} height={920} unoptimized priority />
          <Image className={styles.sfPhone2}  src="/iphone-2.png" alt="" width={460} height={920} unoptimized priority />
          <Image className={styles.sfMonitor} src="/web.png"      alt="" width={1200} height={800} unoptimized priority />
          <Image className={styles.sfPhone4}  src="/iphone-4.png" alt="" width={460} height={920} unoptimized priority />
          <Image className={styles.sfPhone5}  src="/iphone-5A.png" alt="" width={460} height={920} unoptimized priority />
        </motion.div>
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

        <motion.div
          className={styles.sectionSixImageCard}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          <MotionImage
            className={styles.sectionSixImage}
            alt="" width={0} height={0} src="/iphone-3.png" unoptimized priority
            variants={cardItemVariants}
          />

          <div className={styles.sectionSixTextbox}>
            <motion.span className={styles.sectionSixText1} variants={cardItemVariants}>
              Bespoke
            </motion.span>

            <motion.span className={styles.sectionSixText} variants={cardItemVariants}>
              Let the design <br/> speak for itself.
            </motion.span>

            <motion.span className={styles.sectionSixPara} variants={cardItemVariants}>
              Bespoke design, purpose-built to deliver compelling visual narratives and seamless user experiences.
            </motion.span>

            <motion.button type="button" className={styles.button} variants={cardItemVariants}>
              Contact us
            </motion.button>
          </div>
        </motion.div>
      </section>
    </>
  );
}
