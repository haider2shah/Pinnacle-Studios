'use client';

import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import styles from '../styles_css/home.module.css';

const reviews = [
  {
    text: "Pinnacle Studios completely transformed our online presence. The design is stunning and our conversions jumped within the first month.",
    name: "Sarah Mitchell",
    role: "CEO, NovaBrand",
    initials: "SM",
  },
  {
    text: "Working with Pinnacle was the best decision we made. They delivered a world-class website that truly reflects our brand.",
    name: "James Okafor",
    role: "Founder, Okafor Ventures",
    initials: "JO",
  },
  {
    text: "The attention to detail is unmatched. Every pixel, every animation feels intentional. Our clients are completely obsessed.",
    name: "Priya Nair",
    role: "Creative Director, Lumi Co.",
    initials: "PN",
  },
  {
    text: "From concept to launch in record time. The team understood our vision instantly and delivered something beyond what we imagined.",
    name: "Tom Eriksen",
    role: "Co-founder, Stackr",
    initials: "TE",
  },
  {
    text: "Not just beautiful — it performs. SEO improved, load times are fast, and the bounce rate dropped significantly.",
    name: "Aisha Rahman",
    role: "Marketing Lead, Helix Labs",
    initials: "AR",
  },
  {
    text: "Pinnacle doesn't just build websites. They craft digital experiences that make your brand impossible to ignore.",
    name: "Carlos Vega",
    role: "Founder, Vega Digital",
    initials: "CV",
  },
];

function ReviewCard({ review }) {
  return (
    <motion.div
      className={styles.reviewCard}
      data-review-card
    >
      <span className={styles.reviewQuoteMark}>&ldquo;</span>
      <p className={styles.reviewText}>{review.text}</p>
      <div className={styles.reviewDivider} />
      <div className={styles.reviewAuthor}>
        <div className={styles.reviewAvatar}>{review.initials}</div>
        <div className={styles.reviewAuthorInfo}>
          <span className={styles.reviewName}>{review.name}</span>
          <span className={styles.reviewRole}>{review.role}</span>
        </div>
        <span className={styles.reviewStars}>★★★★★</span>
      </div>
    </motion.div>
  );
}

export default function Reviews() {
  const mobileRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function handleScroll() {
    const el = mobileRef.current;
    if (!el) return;
    const cards = el.querySelectorAll('[data-review-card]');
    const center = el.scrollLeft + el.offsetWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs((card.offsetLeft + card.offsetWidth / 2) - center);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setActiveIndex(closest);
  }

  return (
    <>
      {/* Desktop: infinite auto-scroll */}
      <div className={styles.reviewsTrackWrapper}>
        <div className={styles.reviewsTrack}>
          {reviews.map((review, i) => <ReviewCard key={`a-${i}`} review={review} />)}
          {reviews.map((review, i) => <ReviewCard key={`b-${i}`} review={review} />)}
        </div>
      </div>

      {/* Mobile: snap carousel */}
      <div
        className={styles.reviewsMobileTrack}
        ref={mobileRef}
        onScroll={handleScroll}
      >
        {reviews.map((review, i) => <ReviewCard key={i} review={review} />)}
      </div>
      <div className={styles.reviewsDots}>
        {reviews.map((_, i) => (
          <span
            key={i}
            className={i === activeIndex ? styles.reviewsDotActive : styles.reviewsDot}
          />
        ))}
      </div>
    </>
  );
}
