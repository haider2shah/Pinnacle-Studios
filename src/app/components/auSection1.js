'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import auStyles from '../styles_css/auSection1.module.css';


const SectionOne = () => {
    return (
        <div className= {auStyles.wrapper}>
            <div className= {auStyles.box}>
                <motion.div
                    className= {auStyles.textButton}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                >
                    <p className= {auStyles.text}>
                        We help startups put
                        their best foot forward
                        in the digital world.
                    </p>

                    <button className= {auStyles.button}>Contact us</button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
                >
                    <Image className= {auStyles.imageOne} alt="Collage of emerging technology — robotics, medical imaging, and clean energy" width={0} height={0} src="/aboutOne.webp" unoptimized priority/>
                </motion.div>
            </div>


        </div>




    );
};

export default SectionOne;
