'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, easeInOut } from 'framer-motion';
import styles from '../styles_css/RevealSection.module.css';

// A page rendered twice with the same skeleton: once as a wireframe — ghost
// bars and blocks, structure without a pulse — and once as the finished
// Pinnacle-grade design. Because the bones line up exactly, the sliding lens
// appears to bring the wireframe to life element by element: a gray bar
// becomes the headline, a ghost pill becomes the gradient CTA.
function MockSite({ after }) {
  return (
    <div className={`${styles.mock} ${after ? styles.after : styles.before}`}>
      <div className={styles.mockChrome}>
        <span className={styles.dots}>
          <i /><i /><i />
        </span>
        {after ? (
          <span className={styles.urlPill}>yourbusiness.com</span>
        ) : (
          <span className={`${styles.ghostPill} ${styles.ghostUrl}`} />
        )}
      </div>

      <div className={styles.mockBody}>
        <div className={styles.mockNav}>
          {after ? (
            <>
              <span className={styles.mockLogo}>YourBusiness</span>
              <span className={styles.mockLinks}>
                <span>Home</span>
                <span>About</span>
                <span>Services</span>
                <span>Contact</span>
              </span>
              <span className={styles.mockCta}>Let&apos;s talk</span>
            </>
          ) : (
            <>
              <span className={`${styles.bar} ${styles.barLogo}`} />
              <span className={styles.ghostLinks}>
                <i /><i /><i /><i />
              </span>
              <span className={`${styles.ghostPill} ${styles.ghostCta}`} />
            </>
          )}
        </div>

        <div className={styles.mockHero}>
          {after ? (
            <>
              <p className={styles.mockKicker}>Digital, done right</p>
              <h3 className={styles.mockH}>
                Make them <em>jealous.</em>
              </h3>
              <p className={styles.mockP}>Websites with pulse, polish and purpose.</p>
              <span className={styles.mockButton}>Start your project →</span>
            </>
          ) : (
            <>
              <span className={`${styles.bar} ${styles.barKicker}`} />
              <span className={`${styles.bar} ${styles.barH1}`} />
              <span className={`${styles.bar} ${styles.barH2}`} />
              <span className={`${styles.bar} ${styles.barP}`} />
              <span className={`${styles.ghostPill} ${styles.ghostButton}`} />
            </>
          )}
        </div>

        <div className={styles.mockCards}>
          {[0, 1, 2].map((i) =>
            after ? (
              <div key={i} className={styles.mockCard}>
                <span className={styles.cardDot} />
                <strong>{['Brand', 'Design', 'Launch'][i]}</strong>
                <p>
                  {[
                    'Identity that turns heads.',
                    'Interfaces with pulse.',
                    'Shipped, not shelved.',
                  ][i]}
                </p>
              </div>
            ) : (
              <div key={i} className={styles.mockCard}>
                <span className={styles.ghostDot} />
                <span className={`${styles.bar} ${styles.barCardT}`} />
                <span className={`${styles.bar} ${styles.barCardP}`} />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// The Pinnacle lens: the wireframe fills the stage; the lens slides across
// showing the same page finished, in perfect registration.
export default function RevealSection() {
  const trackRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });
  const p = scrollYProgress;

  const windowX = useTransform(p, [0.15, 0.85], ['0vw', '49vw'], { ease: easeInOut });
  const photoX = useTransform(p, [0.15, 0.85], ['0vw', '-49vw'], { ease: easeInOut });

  const aOpacity = useTransform(p, [0.18, 0.38], [1, 0]);
  const aX = useTransform(p, [0.18, 0.38], [0, 70]);
  const bOpacity = useTransform(p, [0.68, 0.88], [0, 1]);
  const bX = useTransform(p, [0.68, 0.88], [-70, 0]);

  return (
    <section ref={trackRef} className={styles.track}>
      <div className={styles.stage}>
        {/* BEFORE: the wireframe fills the whole band */}
        <div className={styles.beforeBand} aria-hidden="true">
          <MockSite after={false} />
        </div>

        {/* AFTER: the lens — constant size, slides across, fully designed */}
        <motion.div className={styles.lensGroup} style={{ x: windowX }}>
          <div className={styles.window}>
            <motion.div className={styles.photo} style={{ x: photoX }}>
              <MockSite after />
            </motion.div>
          </div>
          <div className={styles.lensBadge} aria-hidden="true">✨</div>
        </motion.div>

        <motion.div className={`${styles.copy} ${styles.copyRight}`} style={{ opacity: aOpacity, x: aX }}>
          <div className={styles.copyCard}>
            <p className={styles.kicker}>Before</p>
            <h2 className={styles.heading}>What you have.</h2>
            <p className={styles.para}>
              A skeleton of potential. Structure without a pulse — easy to
              build, easy to forget.
            </p>
          </div>
        </motion.div>

        <motion.div className={`${styles.copy} ${styles.copyLeft}`} style={{ opacity: bOpacity, x: bX }}>
          <div className={styles.copyCard}>
            <p className={styles.kicker}>After Pinnacle</p>
            <h2 className={styles.heading}>What they&apos;ll be jealous of.</h2>
            <p className={styles.para}>
              Same brand — new gravity. Color, motion and confidence that make
              people stop, stare and remember you.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
