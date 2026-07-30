'use client';
import Styles from '../styles_css/subSection2.module.css';
import Image from 'next/image';
import { motion } from 'framer-motion';

const Subsection = ({ title, text, cards = [] }) => {
  // Duplicate cards for seamless infinite loop
  const duplicatedCards = [...cards, ...cards];

  return (
    <div className={Styles.wrapper}>
      <div className={Styles.card}>
        <motion.div
          className={Styles.textCombined}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <h3 className={Styles.title}>{title}</h3>
          <p className={Styles.para}>{text}</p>
        </motion.div>

        <div className={Styles.scrollerWrapper}>
          <div className={Styles.scrollerContent}>
            {duplicatedCards.map((card, index) => (
              <div className={Styles.mainCard} key={index}>
                <Image
                  className={Styles.image}
                  alt={card.text}
                  width={0}
                  height={0}
                  src={card.image}
                  unoptimized
                />
                <p className={Styles.text}>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subsection;
