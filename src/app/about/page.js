'use client';
import { motion } from 'framer-motion';
import SectionOne from '../components/auSection1';
import SectionTwo from '../components/auSection2';
import ImageCard from '../components/auImageCard';


import NavBar from '../components/navBar';
import auStyles from '../styles_css/auPage.module.css';

const cardVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

export default function AboutUs() {
    return (
      <>
        <NavBar/>

        <section>
          <SectionOne/>
        </section>

        <section>
          <SectionTwo/>
        </section>

        <section className= {auStyles.Section3}>
          <div className= {auStyles.heading}>
              <motion.h2
                  className= {auStyles.heading1}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3, margin: '0% 0px -10% 0px' }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
              >The minds behind</motion.h2>
              <motion.span
                  className= {auStyles.heading2}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3, margin: '0% 0px -10% 0px' }}
                  transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
              > Pinnacle Studios.</motion.span>
          </div>

          <motion.div
              className= {auStyles.team}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
          >
                <ImageCard
                    name = "Haider Shah"
                    src = "/haider.webp"
                    position = "Lead UX Designer"
                />

                <ImageCard
                    name = "Syed Zain Ali"
                    src = "/zain.webp"
                    position = "Front - End Developer"
                />

                <ImageCard
                    name = "Ali Raza Kazmi"
                    src = "/raza.webp"
                    position = "Full - Stack Developer"
                />

                <ImageCard
                    name = "Ali Raza Kazmi"
                    src = "/raza.webp"
                    position = "Full - Stack Developer"
                />

          </motion.div>


        </section>


      </>

    );
  }
