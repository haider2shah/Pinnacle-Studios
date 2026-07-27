'use client';
import Styles from '../styles_css/secondServiceCard.module.css';
import Image from 'next/image';
import { motion } from 'framer-motion';



const SecondServicesCard = ({ title, paragraph, image,imageMobile,icon,iconTwo,iconThree,iconParagraphOne,iconParagraphTwo,iconParagraphThree, iconHeadingOne, iconHeadingTwo,iconHeadingThree}) => {
    return (
        <div className= {Styles.wrapper}>
            <div className= {Styles.card}>
                    <motion.div
                        className= {Styles.textBox}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                    >
                        <p className={Styles.title}>
                                {title}
                        </p>
                        <p className= {Styles.paragraph}>
                                {paragraph}
                        </p>
                        <button className= {Styles.button}>Contact us</button>

                    </motion.div>

                    <motion.div
                        className= {Styles.picture}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
                    >
                        <Image className= {Styles.image} alt="Team members" width={0} height={0} src= {image} unoptimized/>
                    </motion.div>
                    <motion.div
                        className= {Styles.picture}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.9, delay: 0.15, ease: 'easeOut' }}
                    >
                        <Image className= {Styles.imageMobile} alt="Team members" width={0} height={0} src= {imageMobile} unoptimized/>
                    </motion.div>

                    <div className= {Styles.iconWrapper}>
                        <motion.div
                            className= {Styles.iconCard}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.7, delay: 0, ease: 'easeOut' }}
                        >
                            <div>
                                <Image className= {Styles.icon} alt="Team members" width={0} height={0} src= {icon} unoptimized/>
                            </div>
                            <div className= {Styles.iconText}>
                                <div className= {Styles.iconHeadingOne} >
                                    <p> {iconHeadingOne}</p>
                                </div>
                                <div className= {Styles.iconParaOne} >
                                    <p> {iconParagraphOne}</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className= {Styles.iconCard}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                        >
                            <div>
                                <Image className= {Styles.icon} alt="Team members" width={0} height={0} src= {iconTwo} unoptimized/>
                            </div>
                            <div className= {Styles.iconText}>
                                <div className= {Styles.iconHeadingTwo} >
                                    <p> {iconHeadingTwo}</p>
                                </div>
                                <div className= {Styles.iconParaTwo} >
                                    <p> {iconParagraphTwo}</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className= {Styles.iconCard}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
                        >
                            <div>
                                <Image className= {Styles.icon} alt="Team members" width={0} height={0} src= {iconThree} unoptimized/>
                            </div>
                            <div className= {Styles.iconText}>
                                <div className= {Styles.iconHeadingThree} >
                                    <p> {iconHeadingThree}</p>
                                </div>
                                <div className= {Styles.iconParaThree} >
                                    <p> {iconParagraphThree}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
            </div>



        </div>




    );
};

export default SecondServicesCard;
