'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import auStyles from '../styles_css/auSection2.module.css';


const SectionTwo = () => {
    return (
        <div className= {auStyles.wrapper}>
            <div className= {auStyles.box}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                >
                    <p className= {auStyles.text}>
                        At Pinnacle Studios, we turn your ideas into seamless
                        digital experiences. Based in the San Francisco Bay Area,
                        we design engaging websites and build custom software,
                        so you can focus on growing your business while we
                        handle the tech.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
                >
                    <Image className= {auStyles.imageTwo} alt="About us image" width={0} height={0} src="/ipad.webp" unoptimized/>
                </motion.div>
            </div>
        </div>




    );
};

export default SectionTwo;
