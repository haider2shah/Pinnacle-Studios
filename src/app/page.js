'use client';
import { motion } from 'framer-motion';
import NavBar from './components/navBar';
import styles from './styles_css/home.module.css';
import Image from 'next/image';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show:  { opacity: 1, y: 0, transition: { duration: 0.9, ease: 'easeOut' } }
};


export default function HomePage() {
  return (
    <>
        <div>
          <NavBar/>
        </div>

<section className={styles.hero}>
      {/* H1: animate immediately (on mount) */}
      <motion.h1
        className={styles.heroHeading}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        Make them jealous.
      </motion.h1>

      <Image
        className={styles.heroImage}
        alt="About us image"
        src="/show the world.png"     // ← remove the space in the filename
        width={460}
        height={920}
        unoptimized
        priority
      />

      {/* H2: animate only when it scrolls into view */}
      <motion.h2
        className={styles.heroSubHeading}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6, margin: '-25% 0px -25% 0px' }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
      >
        With a website <br /> that is uniquely yours.
      </motion.h2>
    </section>

        <section className = {styles.sectionOne}>
            
            <h1 className = {styles.sectionOneHeading}> But Your website <br/>doesn’t have to be. </h1>

            <div className = {styles.images}>

              <Image className= {styles.imageOne} alt="About us image" width={0} height={0} src="/iphone.png" unoptimized priority/>

              <Image className= {styles.imageTwo} alt="About us image" width={0} height={0} src="/iphone.png" unoptimized priority/>

              <Image className= {styles.imageThree} alt="About us image" width={0} height={0} src="/iphone.png" unoptimized priority/>

              <Image className= {styles.imageFour} alt="About us image" width={0} height={0} src="/iphone.png" unoptimized priority/>

              <Image className= {styles.imageFive} alt="About us image" width={0} height={0} src="/iphone.png" unoptimized priority/>

            </div>
        </section>

        <section className = {styles.sectionTwo}>
            
            <h1 className = {styles.sectionTwoHeading}> If You’re changing the world,<br/> the world should know. </h1>


            <Image className= {styles.sectionTwoImage} alt="About us image" width={0} height={0} src="/show the world.png" unoptimized priority/>

        </section>

        <section className = {styles.sectionThree}>
            
            <h1 className = {styles.sectionThreeHeading}> Does your website reflect <br/> your vision for the future? </h1>


            <Image className= {styles.sectionThreeImage} alt="About us image" width={0} height={0} src="/tablet.png" unoptimized priority/>

        </section>

        <section className = {styles.sectionFour}>
            
            <h1 className = {styles.sectionFourHeading}> Developing websites with <br/> world-class technology. </h1>

            <div className = {styles.sectionFourImages}>

              <Image className= {styles.figma} alt="About us image" width={0} height={0} src="/Figmaa.png" unoptimized priority/>

              <Image className= {styles.wix} alt="About us image" width={0} height={0} src="/wix.png" unoptimized priority/>

              <Image className= {styles.framer} alt="About us image" width={0} height={0} src="/Framer.png" unoptimized priority/>

              <Image className= {styles.webflow} alt="About us image" width={0} height={0} src="/webfloww.png" unoptimized priority/>

              <Image className= {styles.react} alt="About us image" width={0} height={0} src="/react.png" unoptimized priority/>

            </div>
        </section>

        <section className = {styles.sectionFive}>
            
            <h1 className = {styles.sectionFiveHeading}> Connect with your customers <br/> across all devices. </h1>


            <Image className= {styles.sectionFiveImage} alt="About us image" width={0} height={0} src="/bg.png" unoptimized priority/>

        </section>

        <section className = {styles.sectionSix}>
            
            <h1 className = {styles.sectionSixHeading}> Design that tells your story,<br/> before you say a word. </h1>


            <Image className= {styles.sectionSixImage} alt="About us image" width={0} height={0} src="/.png" unoptimized priority/>

        </section>

    </>



  );
}